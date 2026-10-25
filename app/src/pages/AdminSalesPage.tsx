import { useEffect, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit3, GripVertical, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { uploadWithSignedUrl } from '@/lib/api'

type LinkType = 'category' | 'product' | 'booking' | 'custom'

type Sale = {
  id: string
  title: string
  subtitle: string | null
  badge_text: string | null
  link_type: LinkType
  link_value: string | null
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  show_countdown: boolean
  show_in_bar: boolean
  show_as_card: boolean
  is_active: boolean
  display_order: number
}

type SaleDraft = Omit<Sale, 'id' | 'starts_at' | 'ends_at' | 'subtitle' | 'badge_text' | 'link_value' | 'image_url'> & {
  subtitle: string
  badge_text: string
  link_value: string
  image_url: string
  starts_at: string
  ends_at: string
}

type SaleStatus = 'live' | 'scheduled' | 'expired' | 'off'

const SALE_COLUMNS = 'id,title,subtitle,badge_text,link_type,link_value,image_url,starts_at,ends_at,show_countdown,show_in_bar,show_as_card,is_active,display_order'

const EMPTY_DRAFT: SaleDraft = {
  title: '',
  subtitle: '',
  badge_text: '',
  link_type: 'booking',
  link_value: '',
  image_url: '',
  starts_at: '',
  ends_at: '',
  show_countdown: false,
  show_in_bar: false,
  show_as_card: false,
  is_active: false,
  display_order: 0,
}

function toLocalDateTime(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`
}

function istInputToIso(value: string): string | null {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!match) throw new Error('Enter a valid date and time.')
  const [, year, month, day, hour, minute] = match.map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30)).toISOString()
}

function toDraft(sale?: Sale): SaleDraft {
  if (!sale) return { ...EMPTY_DRAFT }
  return {
    ...sale,
    subtitle: sale.subtitle ?? '',
    badge_text: sale.badge_text ?? '',
    link_value: sale.link_value ?? '',
    image_url: sale.image_url ?? '',
    starts_at: toLocalDateTime(sale.starts_at),
    ends_at: toLocalDateTime(sale.ends_at),
  }
}

function statusFor(sale: Sale, now: number): SaleStatus {
  if (!sale.is_active) return 'off'
  if (sale.starts_at && new Date(sale.starts_at).getTime() > now) return 'scheduled'
  if (sale.ends_at && new Date(sale.ends_at).getTime() <= now) return 'expired'
  return 'live'
}

const STATUS_STYLES: Record<SaleStatus, string> = {
  live: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  scheduled: 'bg-blue-50 text-blue-800 border-blue-200',
  expired: 'bg-amber-50 text-amber-900 border-amber-200',
  off: 'bg-[#F5F0E8] text-[#514B46] border-[#D0C9C0]',
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
}

function SortableSaleRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`align-top hover:bg-[#FCFBF9] ${isDragging ? 'relative z-10 bg-[#F8F5F0] shadow-md' : ''}`}>
      <td className="px-2 py-4"><button type="button" {...attributes} {...listeners} aria-label="Drag to reorder sale" title="Drag to reorder" className="touch-none rounded p-2 text-[#514B46] hover:bg-[#F5F0E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6B4F1D]"><GripVertical size={16} aria-hidden="true" /></button></td>
      {children}
    </tr>
  )
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [draft, setDraft] = useState<SaleDraft>({ ...EMPTY_DRAFT })
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [serverNow, setServerNow] = useState(Date.now())
  const [uploadingImage, setUploadingImage] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const loadSales = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase
        .from('sale')
        .select(SALE_COLUMNS)
        .order('display_order', { ascending: true })
      if (error) throw error
      setSales((data ?? []) as Sale[])
      setServerNow(Date.now())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load sales.'
      setLoadError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSales()
  }, [])

  const openAddForm = () => {
    setEditingSale(null)
    setDraft({ ...EMPTY_DRAFT })
    setShowForm(true)
  }

  const openEditForm = (sale: Sale) => {
    setEditingSale(sale)
    setDraft(toDraft(sale))
    setShowForm(true)
  }

  const closeForm = () => {
    if (isSaving) return
    setShowForm(false)
    setEditingSale(null)
    setDraft({ ...EMPTY_DRAFT })
  }

  const updateDraft = <K extends keyof SaleDraft>(key: K, value: SaleDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) {
      toast.error('Title is required.')
      return
    }
    if (!Number.isInteger(Number(draft.display_order))) {
      toast.error('Display order must be a whole number.')
      return
    }

    let startsAt: string | null
    let endsAt: string | null
    try {
      startsAt = istInputToIso(draft.starts_at)
      if (!startsAt) throw new Error('Choose a start date and time.')
      endsAt = istInputToIso(draft.ends_at)
      if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) throw new Error('End time must be after start time.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Enter valid schedule dates.')
      return
    }

    setIsSaving(true)
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      badge_text: draft.badge_text.trim() || null,
      link_type: draft.link_type,
      link_value: draft.link_value.trim() || null,
      image_url: draft.image_url.trim() || null,
      starts_at: startsAt,
      ends_at: endsAt,
      show_countdown: draft.show_countdown,
      show_in_bar: draft.show_in_bar,
      show_as_card: draft.show_as_card,
      is_active: draft.is_active,
      display_order: Number(draft.display_order),
    }

    try {
      const result = editingSale
        ? await supabase.from('sale').update(payload).eq('id', editingSale.id)
        : await supabase.from('sale').insert(payload)
      if (result.error) throw result.error
      toast.success(editingSale ? 'Sale updated.' : 'Sale created.')
      setShowForm(false)
      setEditingSale(null)
      setDraft({ ...EMPTY_DRAFT })
      await loadSales()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save sale.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaleImage = async (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Choose a JPG, PNG or WebP image up to 5 MB.')
      return
    }
    setUploadingImage(true)
    try {
      const url = await uploadWithSignedUrl('sale-images', file)
      updateDraft('image_url', url)
      toast.success('Sale image uploaded.')
    } catch (error) {
      console.error('Sale image upload failed:', error)
      toast.error(error instanceof Error ? error.message : 'Sale image upload failed. Verify admin access.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDelete = async (sale: Sale) => {
    if (!window.confirm(`Delete “${sale.title}”? This cannot be undone.`)) return
    setDeletingId(sale.id)
    try {
      const { error } = await supabase.from('sale').delete().eq('id', sale.id)
      if (error) throw error
      toast.success('Sale deleted.')
      await loadSales()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete sale.'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = sales.findIndex((sale) => sale.id === active.id)
    const to = sales.findIndex((sale) => sale.id === over.id)
    if (from < 0 || to < 0) return
    const reordered = arrayMove(sales, from, to)
    setSales(reordered)
    try {
      const results = await Promise.all(reordered.map((sale, index) => supabase.from('sale').update({ display_order: index }).eq('id', sale.id)))
      const failed = results.find((result) => result.error)
      if (failed?.error) throw failed.error
      setSales(reordered.map((sale, index) => ({ ...sale, display_order: index })))
      toast.success('Sale order updated.')
    } catch (error) {
      console.error('Unable to save sale ordering:', error)
      toast.error('Sale order could not be saved. Restoring the previous order.')
      await loadSales()
    }
  }

  const inputClassName = 'w-full rounded border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#8A672B] focus:ring-2 focus:ring-[#8A672B]/20'
  const labelClassName = 'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-[#514B46]'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl text-[#2C2C2C]">Sales</h1>
          <p className="mt-1 font-body text-sm text-[#514B46]">Manage sale announcements and cards.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadSales()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 border border-[#D0C9C0] bg-white px-4 py-2.5 font-body text-sm text-[#2C2C2C] hover:bg-[#F8F5F0] disabled:opacity-60"
          >
            <RefreshCw size={15} aria-hidden="true" /> Refresh
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#2C2C2C] px-4 py-2.5 font-body text-sm font-medium text-white hover:bg-[#514B46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C2C2C]"
          >
            <Plus size={16} aria-hidden="true" /> Add sale
          </button>
        </div>
      </header>

      {showForm && (
        <section className="border border-[#D0C9C0] bg-white p-5 shadow-sm md:p-7" aria-labelledby="sale-form-title">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="sale-form-title" className="font-display text-2xl text-[#2C2C2C]">
              {editingSale ? 'Edit sale' : 'Add sale'}
            </h2>
            <button type="button" onClick={closeForm} disabled={isSaving} aria-label="Close sale form" className="rounded p-2 text-[#514B46] hover:bg-[#F5F0E8]">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="sale-title" className={labelClassName}>Title <span aria-hidden="true">*</span></label>
                <input id="sale-title" required maxLength={60} value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className={inputClassName} />
                <p className="mt-1 text-right font-body text-xs text-[#514B46]">{draft.title.length}/60</p>
              </div>
              <div>
                <label htmlFor="sale-subtitle" className={labelClassName}>Subtitle</label>
                <input id="sale-subtitle" maxLength={120} value={draft.subtitle ?? ''} onChange={(event) => updateDraft('subtitle', event.target.value)} className={inputClassName} />
                <p className="mt-1 text-right font-body text-xs text-[#514B46]">{draft.subtitle?.length ?? 0}/120</p>
              </div>
              <div>
                <label htmlFor="sale-badge" className={labelClassName}>Badge text</label>
                <input id="sale-badge" maxLength={20} value={draft.badge_text ?? ''} onChange={(event) => updateDraft('badge_text', event.target.value)} className={inputClassName} />
                <p className="mt-1 text-right font-body text-xs text-[#514B46]">{draft.badge_text?.length ?? 0}/20</p>
              </div>
              <div>
                <label htmlFor="sale-link-type" className={labelClassName}>Link type</label>
                <select id="sale-link-type" value={draft.link_type} onChange={(event) => updateDraft('link_type', event.target.value as LinkType)} className={inputClassName}>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                  <option value="booking">Booking</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label htmlFor="sale-link-value" className={labelClassName}>Link value</label>
                <input id="sale-link-value" value={draft.link_value ?? ''} onChange={(event) => updateDraft('link_value', event.target.value)} className={inputClassName} />
                <p className="mt-1 font-body text-xs text-[#514B46]">For a custom link, use an http(s) URL or a site path beginning with /.</p>
              </div>
              <div>
                <label htmlFor="sale-image-url" className={labelClassName}>Image URL (optional)</label>
                <input id="sale-image-url" type="url" value={draft.image_url ?? ''} onChange={(event) => updateDraft('image_url', event.target.value)} placeholder="https://…" className={inputClassName} />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex min-h-10 cursor-pointer items-center border border-[#D0C9C0] px-3 font-body text-xs text-[#514B46] hover:bg-[#F8F5F0]">
                    {uploadingImage ? 'Uploading…' : 'Upload image'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} className="sr-only" onChange={(event) => { void handleSaleImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
                  </label>
                  <span className="font-body text-xs text-[#514B46]">JPG, PNG or WebP, up to 5 MB.</span>
                  {draft.image_url && <img src={draft.image_url} alt="Sale image preview" className="h-14 w-20 border border-[#E5E0D8] object-cover" />}
                </div>
              </div>
              <div>
                <label htmlFor="sale-starts-at" className={labelClassName}>Starts at (IST)</label>
                <input id="sale-starts-at" type="datetime-local" required value={draft.starts_at} onChange={(event) => updateDraft('starts_at', event.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="sale-ends-at" className={labelClassName}>Ends at (IST)</label>
                <input id="sale-ends-at" type="datetime-local" value={draft.ends_at} onChange={(event) => updateDraft('ends_at', event.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="sale-display-order" className={labelClassName}>Display order</label>
                <input id="sale-display-order" type="number" step="1" value={draft.display_order} onChange={(event) => updateDraft('display_order', Number(event.target.value))} className={inputClassName} />
              </div>
            </div>
            <p className="font-body text-xs text-[#514B46]">Schedule times are saved and displayed in India Standard Time.</p>

            <fieldset>
              <legend className={labelClassName}>Display and status</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {([
                  ['is_active', 'Active'],
                  ['show_in_bar', 'Show in announcement bar'],
                  ['show_as_card', 'Show as a card'],
                  ['show_countdown', 'Show countdown'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-2 font-body text-sm text-[#2C2C2C]">
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(event) => updateDraft(key, event.target.checked)}
                      className="h-4 w-4 accent-[#6B4F1D]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <section className="border-t border-[#E5E0D8] pt-5" aria-label="Live sale display preview">
              <h3 className="mb-3 font-display text-xl text-[#2C2C2C]">Live preview</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-[#514B46]">Announcement bar</p>
                  <div className="flex min-h-14 items-center justify-center gap-2 bg-[#2C2C2C] px-4 py-3 text-center text-white">
                    {draft.badge_text.trim() && <span className="border border-[#C9A96E] px-2 py-1 font-body text-[10px] uppercase tracking-wide text-[#E0C58A]">{draft.badge_text.trim()}</span>}
                    <span className="font-body text-sm font-medium">{draft.title.trim() || 'Sale title'}</span>
                    {draft.subtitle.trim() && <span className="hidden font-body text-xs text-white/80 sm:inline">{draft.subtitle.trim()}</span>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-[#514B46]">Sale card</p>
                  <div className="flex min-h-28 overflow-hidden border border-[#E5E0D8] bg-[#F8F5F0]">
                    {draft.image_url.trim() && <img src={draft.image_url} alt="" className="w-24 shrink-0 object-cover" />}
                    <div className="flex flex-1 flex-col items-start justify-center p-4">
                      {draft.badge_text.trim() && <span className="mb-1 font-body text-[10px] font-semibold uppercase tracking-wide text-[#6B4F1D]">{draft.badge_text.trim()}</span>}
                      <span className="font-display text-lg text-[#2C2C2C]">{draft.title.trim() || 'Sale title'}</span>
                      {draft.subtitle.trim() && <span className="mt-1 font-body text-xs text-[#514B46]">{draft.subtitle.trim()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#E5E0D8] pt-4">
              <button type="button" onClick={closeForm} disabled={isSaving} className="border border-[#D0C9C0] px-5 py-2.5 font-body text-sm text-[#2C2C2C] hover:bg-[#F8F5F0] disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 bg-[#2C2C2C] px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-[#514B46] disabled:opacity-60">
                {isSaving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {editingSale ? 'Save changes' : 'Create sale'}
              </button>
            </div>
          </form>
        </section>
      )}

      {isLoading ? (
        <div role="status" className="flex items-center justify-center gap-3 py-16 font-body text-sm text-[#514B46]">
          <Loader2 size={24} className="animate-spin text-[#6B4F1D]" aria-hidden="true" /> Loading sales…
        </div>
      ) : loadError ? (
        <div role="alert" className="border border-[#C4705A]/40 bg-[#FFF8F6] p-6 text-center">
          <p className="font-body text-sm font-medium text-[#7A382C]">Could not load sales.</p>
          <p className="mt-1 font-body text-sm text-[#514B46]">{loadError}</p>
          <button type="button" onClick={() => void loadSales()} className="mt-4 rounded border border-[#7A382C] px-4 py-2 font-body text-sm text-[#7A382C] hover:bg-[#7A382C] hover:text-white">Try again</button>
        </div>
      ) : sales.length === 0 ? (
        <div className="border border-dashed border-[#D0C9C0] bg-white px-6 py-14 text-center">
          <h2 className="font-display text-xl text-[#2C2C2C]">No sales yet</h2>
          <p className="mt-2 font-body text-sm text-[#514B46]">Create a sale to manage its announcement and card display.</p>
          {!showForm && (
            <button type="button" onClick={openAddForm} className="mt-5 inline-flex items-center gap-2 bg-[#2C2C2C] px-4 py-2.5 font-body text-sm text-white hover:bg-[#514B46]">
              <Plus size={16} aria-hidden="true" /> Add sale
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden border border-[#E5E0D8] bg-white">
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void handleSaleDragEnd(event)}>
              <SortableContext items={sales.map((sale) => sale.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#F8F5F0]">
                <tr>
                  <th scope="col" className="px-2 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Order</th>
                  <th scope="col" className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Sale</th>
                  <th scope="col" className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Status</th>
                  <th scope="col" className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Schedule</th>
                  <th scope="col" className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Display</th>
                  <th scope="col" className="px-4 py-3 text-right font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#514B46]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {sales.map((sale) => {
                  const status = statusFor(sale, serverNow)
                  return (
                    <SortableSaleRow key={sale.id} id={sale.id}>
                      <td className="px-4 py-4">
                        <p className="font-body text-sm font-semibold text-[#2C2C2C]">{sale.title}</p>
                        {sale.subtitle && <p className="mt-1 max-w-sm font-body text-xs text-[#514B46]">{sale.subtitle}</p>}
                        <p className="mt-1 font-body text-xs text-[#514B46]">Order {sale.display_order} · {sale.link_type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-body text-xs leading-relaxed text-[#514B46]">
                        <div>Starts: {formatDate(sale.starts_at)}</div>
                        <div className="mt-1">Ends: {formatDate(sale.ends_at)}</div>
                      </td>
                      <td className="px-4 py-4 font-body text-xs text-[#514B46]">
                        <div>{sale.show_in_bar ? 'Announcement bar' : '—'}</div>
                        <div className="mt-1">{sale.show_as_card ? 'Card' : '—'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditForm(sale)} aria-label={`Edit ${sale.title}`} className="rounded border border-[#D0C9C0] p-2 text-[#2C2C2C] hover:bg-[#F5F0E8]">
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => void handleDelete(sale)} disabled={deletingId === sale.id} aria-label={`Delete ${sale.title}`} className="rounded border border-[#C4705A]/50 p-2 text-[#7A382C] hover:bg-[#FFF1ED] disabled:opacity-50">
                            {deletingId === sale.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                          </button>
                        </div>
                      </td>
                    </SortableSaleRow>
                  )
                })}
              </tbody>
            </table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  )
}
