import { useEffect, useMemo, useState } from 'react'
import { Edit3, ExternalLink, Loader2, MapPin, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type Store = {
  id: string
  name: string
  city: string | null
  address: string | null
  phone: string | null
  email: string | null
  timings: string | null
  maps_url: string | null
  display_order: number
  is_active: boolean
}

type StoreDraft = Omit<Store, 'id'>
type VisibilityFilter = 'all' | 'active' | 'inactive'

const STORE_COLUMNS = 'id,name,city,address,phone,email,timings,maps_url,display_order,is_active'
const EMPTY_DRAFT: StoreDraft = {
  name: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  timings: '',
  maps_url: '',
  display_order: 0,
  is_active: true,
}

function draftFromStore(store?: Store): StoreDraft {
  if (!store) return { ...EMPTY_DRAFT }
  return {
    name: store.name,
    city: store.city ?? '',
    address: store.address ?? '',
    phone: store.phone ?? '',
    email: store.email ?? '',
    timings: store.timings ?? '',
    maps_url: store.maps_url ?? '',
    display_order: store.display_order,
    is_active: store.is_active,
  }
}

function normalizeOptional(value: string): string | null {
  return value.trim() || null
}

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState<VisibilityFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [draft, setDraft] = useState<StoreDraft>({ ...EMPTY_DRAFT })
  const [isSaving, setIsSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadStores = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase
        .from('store')
        .select(STORE_COLUMNS)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw error
      setStores((data ?? []) as Store[])
    } catch (error) {
      setLoadError(errorMessage(error, 'Unable to load stores.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStores()
  }, [])

  const visibleStores = useMemo(() => {
    if (filter === 'active') return stores.filter((store) => store.is_active)
    if (filter === 'inactive') return stores.filter((store) => !store.is_active)
    return stores
  }, [filter, stores])

  const openAddForm = () => {
    setEditingStore(null)
    setDraft({ ...EMPTY_DRAFT })
    setShowForm(true)
  }

  const openEditForm = (store: Store) => {
    setEditingStore(store)
    setDraft(draftFromStore(store))
    setShowForm(true)
  }

  const closeForm = () => {
    if (isSaving) return
    setShowForm(false)
    setEditingStore(null)
    setDraft({ ...EMPTY_DRAFT })
  }

  const updateDraft = <K extends keyof StoreDraft>(key: K, value: StoreDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    const address = draft.address?.trim() ?? ''
    const mapsUrl = draft.maps_url?.trim() ?? ''

    if (!name) {
      toast.error('Store name is required.')
      return
    }
    if (!address) {
      toast.error('Store address is required.')
      return
    }
    if (!Number.isInteger(Number(draft.display_order))) {
      toast.error('Display order must be a whole number.')
      return
    }
    if (mapsUrl && !validHttpUrl(mapsUrl)) {
      toast.error('Map URL must be a valid http:// or https:// URL.')
      return
    }

    const payload = {
      name,
      city: normalizeOptional(draft.city ?? ''),
      address,
      phone: normalizeOptional(draft.phone ?? ''),
      email: normalizeOptional(draft.email ?? ''),
      timings: normalizeOptional(draft.timings ?? ''),
      maps_url: mapsUrl || null,
      display_order: Number(draft.display_order),
      is_active: draft.is_active,
    }

    setIsSaving(true)
    try {
      const result = editingStore
        ? await supabase.from('store').update(payload).eq('id', editingStore.id)
        : await supabase.from('store').insert(payload)
      if (result.error) throw result.error
      toast.success(editingStore ? 'Store updated.' : 'Store created.')
      setShowForm(false)
      setEditingStore(null)
      setDraft({ ...EMPTY_DRAFT })
      await loadStores()
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to save store.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (store: Store) => {
    if (!window.confirm(`Delete “${store.name}”? This cannot be undone.`)) return
    setBusyId(store.id)
    try {
      const { error } = await supabase.from('store').delete().eq('id', store.id)
      if (error) throw error
      toast.success('Store deleted.')
      await loadStores()
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to delete store.'))
    } finally {
      setBusyId(null)
    }
  }

  const toggleActive = async (store: Store) => {
    setBusyId(store.id)
    try {
      const { error } = await supabase.from('store').update({ is_active: !store.is_active }).eq('id', store.id)
      if (error) throw error
      toast.success(store.is_active ? 'Store deactivated.' : 'Store activated.')
      await loadStores()
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to update store visibility.'))
    } finally {
      setBusyId(null)
    }
  }

  const inputClassName = 'w-full rounded border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#8A672B] focus:ring-2 focus:ring-[#8A672B]/20'
  const labelClassName = 'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-[#514B46]'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl text-[#2C2C2C]">Stores</h1>
          <p className="mt-1 font-body text-sm text-[#514B46]">Manage store locations and their public visibility.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadStores()}
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
            <Plus size={16} aria-hidden="true" /> Add store
          </button>
        </div>
      </header>

      <aside className="border border-[#D0C9C0] bg-[#F8F5F0] p-4" role="note">
        <p className="font-body text-sm font-medium text-[#2C2C2C]">Admin access required</p>
        <p className="mt-1 font-body text-sm text-[#514B46]">
          Store management requires an authenticated admin JWT whose user ID matches an active <code className="font-mono text-xs">public.admins.id</code> row. If access is denied, ask the site owner to configure that admin access; the database error is shown when an operation fails.
        </p>
      </aside>

      {showForm && (
        <section className="border border-[#D0C9C0] bg-white p-5 shadow-sm md:p-7" aria-labelledby="store-form-title">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="store-form-title" className="font-display text-2xl text-[#2C2C2C]">
              {editingStore ? 'Edit store' : 'Add store'}
            </h2>
            <button type="button" onClick={closeForm} disabled={isSaving} aria-label="Close store form" className="rounded p-2 text-[#514B46] hover:bg-[#F5F0E8]">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="store-name" className={labelClassName}>Name <span aria-hidden="true">*</span></label>
                <input id="store-name" required maxLength={200} value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} className={inputClassName} autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="store-city" className={labelClassName}>City</label>
                <input id="store-city" value={draft.city ?? ''} onChange={(event) => updateDraft('city', event.target.value)} className={inputClassName} autoComplete="address-level2" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="store-address" className={labelClassName}>Address <span aria-hidden="true">*</span></label>
                <textarea id="store-address" required rows={2} value={draft.address ?? ''} onChange={(event) => updateDraft('address', event.target.value)} className={inputClassName} autoComplete="street-address" />
              </div>
              <div>
                <label htmlFor="store-phone" className={labelClassName}>Phone</label>
                <input id="store-phone" type="tel" value={draft.phone ?? ''} onChange={(event) => updateDraft('phone', event.target.value)} className={inputClassName} autoComplete="tel" />
              </div>
              <div>
                <label htmlFor="store-email" className={labelClassName}>Email</label>
                <input id="store-email" type="email" value={draft.email ?? ''} onChange={(event) => updateDraft('email', event.target.value)} className={inputClassName} autoComplete="email" />
              </div>
              <div>
                <label htmlFor="store-timings" className={labelClassName}>Timings</label>
                <input id="store-timings" value={draft.timings ?? ''} onChange={(event) => updateDraft('timings', event.target.value)} className={inputClassName} />
              </div>
              <div>
                <label htmlFor="store-maps-url" className={labelClassName}>Map URL</label>
                <input id="store-maps-url" type="url" inputMode="url" value={draft.maps_url ?? ''} onChange={(event) => updateDraft('maps_url', event.target.value)} className={inputClassName} placeholder="https://…" />
                <p className="mt-1 font-body text-xs text-[#514B46]">Optional; must begin with http:// or https://.</p>
              </div>
              <div>
                <label htmlFor="store-display-order" className={labelClassName}>Display order</label>
                <input id="store-display-order" type="number" step="1" value={draft.display_order} onChange={(event) => updateDraft('display_order', Number(event.target.value))} className={inputClassName} />
              </div>
            </div>

            <fieldset>
              <legend className={labelClassName}>Visibility</legend>
              <label className="inline-flex items-center gap-2 font-body text-sm text-[#2C2C2C]">
                <input type="checkbox" checked={draft.is_active} onChange={(event) => updateDraft('is_active', event.target.checked)} className="h-4 w-4 accent-[#6B4F1D]" />
                Active — visible to site visitors
              </label>
            </fieldset>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#E5E0D8] pt-4">
              <button type="button" onClick={closeForm} disabled={isSaving} className="border border-[#D0C9C0] px-5 py-2.5 font-body text-sm text-[#2C2C2C] hover:bg-[#F8F5F0] disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 bg-[#2C2C2C] px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-[#514B46] disabled:opacity-60">
                {isSaving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {editingStore ? 'Save changes' : 'Create store'}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter stores by visibility">
          {([
            ['all', `All (${stores.length})`],
            ['active', `Active (${stores.filter((store) => store.is_active).length})`],
            ['inactive', `Inactive (${stores.filter((store) => !store.is_active).length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`border px-3 py-2 font-body text-sm ${filter === value ? 'border-[#2C2C2C] bg-[#2C2C2C] text-white' : 'border-[#D0C9C0] bg-white text-[#514B46] hover:bg-[#F8F5F0]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div role="status" className="flex items-center justify-center gap-3 py-16 font-body text-sm text-[#514B46]">
          <Loader2 size={24} className="animate-spin text-[#6B4F1D]" aria-hidden="true" /> Loading stores…
        </div>
      ) : loadError ? (
        <div role="alert" className="border border-[#C4705A]/40 bg-[#FFF8F6] p-6">
          <p className="font-body text-sm font-medium text-[#7A382C]">Could not load stores.</p>
          <p className="mt-1 break-words font-body text-sm text-[#514B46]">{loadError}</p>
          <p className="mt-2 font-body text-xs text-[#514B46]">Confirm you are signed in and that your authenticated user matches an active row in <code className="font-mono">public.admins</code>.</p>
          <button type="button" onClick={() => void loadStores()} className="mt-4 border border-[#7A382C] px-4 py-2 font-body text-sm text-[#7A382C] hover:bg-[#7A382C] hover:text-white">Try again</button>
        </div>
      ) : visibleStores.length === 0 ? (
        <div className="border border-dashed border-[#D0C9C0] bg-white px-6 py-14 text-center">
          <MapPin size={28} className="mx-auto text-[#9B9590]" aria-hidden="true" />
          <p className="mt-3 font-body text-sm font-medium text-[#514B46]">{stores.length === 0 ? 'No stores yet.' : `No ${filter} stores.`}</p>
          <p className="mt-1 font-body text-xs text-[#6B6560]">{stores.length === 0 ? 'Add a store to get started.' : 'Choose another visibility filter to see more stores.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#D0C9C0] bg-white shadow-sm">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="bg-[#EDE6DA]">
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Store</th>
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Contact</th>
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Timings</th>
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Order</th>
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Visibility</th>
                <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStores.map((store) => (
                <tr key={store.id} className="border-t border-[#F0ECE6] align-top hover:bg-[#FCFAF7]">
                  <td className="max-w-[350px] px-4 py-3.5">
                    <p className="font-body text-sm font-medium text-[#2C2C2C]">{store.name}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words font-body text-sm text-[#6B6560]">{store.address || '—'}{store.city ? ` · ${store.city}` : ''}</p>
                    {store.maps_url && validHttpUrl(store.maps_url) && (
                      <a href={store.maps_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-body text-xs text-[#6B4F1D] underline">
                        Map <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-body text-sm text-[#514B46]">
                    {store.phone && <a className="block hover:underline" href={`tel:${store.phone}`}>{store.phone}</a>}
                    {store.email && <a className="block break-all hover:underline" href={`mailto:${store.email}`}>{store.email}</a>}
                    {!store.phone && !store.email && '—'}
                  </td>
                  <td className="max-w-[220px] whitespace-pre-wrap px-4 py-3.5 font-body text-sm text-[#514B46]">{store.timings || '—'}</td>
                  <td className="px-4 py-3.5 font-body text-sm text-[#514B46]">{store.display_order}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs ${store.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-[#D0C9C0] bg-[#F5F0E8] text-[#514B46]'}`}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <button type="button" onClick={() => openEditForm(store)} aria-label={`Edit ${store.name}`} className="flex h-8 items-center gap-1 rounded px-2 text-[#6B6560] hover:bg-[#F8F5F0] hover:text-[#8A672B]">
                        <Edit3 size={14} aria-hidden="true" /><span className="font-body text-xs">Edit</span>
                      </button>
                      <button type="button" onClick={() => void toggleActive(store)} disabled={busyId === store.id} aria-label={`${store.is_active ? 'Deactivate' : 'Activate'} ${store.name}`} className="h-8 rounded px-2 font-body text-xs text-[#514B46] hover:bg-[#F8F5F0] disabled:opacity-50">
                        {store.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" onClick={() => void handleDelete(store)} disabled={busyId === store.id} aria-label={`Delete ${store.name}`} className="flex h-8 items-center gap-1 rounded px-2 text-[#9E4A3E] hover:bg-[#FFF4F1] disabled:opacity-50">
                        <Trash2 size={14} aria-hidden="true" /><span className="font-body text-xs">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
