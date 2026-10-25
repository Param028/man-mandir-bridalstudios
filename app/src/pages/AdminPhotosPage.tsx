import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, ExternalLink, Plus, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { isSafeHttpUrl } from '@/lib/siteSettings'

type Gallery = { id: string; name: string; description: string | null; created_at: string }
type Photo = { id: string; gallery_id: string; image_url: string; caption: string | null; display_order: number | null; is_active: boolean }
type PhotoDraft = { image_url: string; caption: string; display_order: number }

const inputClass = 'w-full border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#8C7045]'

export default function AdminPhotosPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [drafts, setDrafts] = useState<Record<string, PhotoDraft>>({})
  const [newGalleryName, setNewGalleryName] = useState('')
  const [newGalleryDescription, setNewGalleryDescription] = useState('')
  const [photoForms, setPhotoForms] = useState<Record<string, { image_url: string; caption: string }>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [galleryResult, photoResult] = await Promise.all([
        supabase.from('galleries').select('id,name,description,created_at').order('created_at', { ascending: false }),
        supabase.from('photos_of_week').select('id,gallery_id,image_url,caption,display_order,is_active').order('display_order', { ascending: true }),
      ])
      if (galleryResult.error) throw galleryResult.error
      if (photoResult.error) throw photoResult.error
      setGalleries(galleryResult.data ?? [])
      const rows = (photoResult.data ?? []) as Photo[]
      setPhotos(rows)
      setDrafts(Object.fromEntries(rows.map((row) => [row.id, {
        image_url: row.image_url,
        caption: row.caption ?? '',
        display_order: row.display_order ?? 0,
      }])))
    } catch (error) {
      console.error('Unable to load gallery management data:', error)
      setLoadError('Gallery content could not be loaded. Verify admin access and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const createGallery = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newGalleryName.trim()) return
    setBusy(true)
    try {
      const { error } = await supabase.from('galleries').insert({
        name: newGalleryName.trim(),
        description: newGalleryDescription.trim() || null,
      })
      if (error) throw error
      setNewGalleryName('')
      setNewGalleryDescription('')
      toast.success('Gallery created')
      await loadData()
    } catch (error) {
      console.error('Unable to create gallery:', error)
      toast.error('Could not create gallery. Check admin access and required fields.')
    } finally {
      setBusy(false)
    }
  }

  const addPhoto = async (event: React.FormEvent, galleryId: string) => {
    event.preventDefault()
    const form = photoForms[galleryId]
    if (!form?.image_url || !isSafeHttpUrl(form.image_url)) return toast.error('Enter a valid public HTTP(S) image URL.')
    const nextOrder = Math.max(-1, ...photos.filter((photo) => photo.gallery_id === galleryId).map((photo) => photo.display_order ?? 0)) + 1
    setBusy(true)
    try {
      const { error } = await supabase.from('photos_of_week').insert({
        gallery_id: galleryId,
        image_url: form.image_url.trim(),
        caption: form.caption.trim() || null,
        display_order: nextOrder,
        is_active: true,
      })
      if (error) throw error
      setPhotoForms((current) => ({ ...current, [galleryId]: { image_url: '', caption: '' } }))
      toast.success('Photo added')
      await loadData()
    } catch (error) {
      console.error('Unable to add photo:', error)
      toast.error('Could not add photo. Check admin access and fields.')
    } finally {
      setBusy(false)
    }
  }

  const savePhoto = async (photo: Photo) => {
    const draft = drafts[photo.id]
    if (!draft || !isSafeHttpUrl(draft.image_url)) return toast.error('Enter a valid public HTTP(S) image URL.')
    setBusy(true)
    try {
      const { error } = await supabase.from('photos_of_week').update({
        image_url: draft.image_url.trim(),
        caption: draft.caption.trim() || null,
        display_order: Number.isFinite(draft.display_order) ? draft.display_order : 0,
      }).eq('id', photo.id)
      if (error) throw error
      toast.success('Photo updated')
      await loadData()
    } catch (error) {
      console.error('Unable to update photo:', error)
      toast.error('Could not update photo. Check admin access and fields.')
    } finally {
      setBusy(false)
    }
  }

  const togglePhoto = async (photo: Photo) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('photos_of_week').update({ is_active: !photo.is_active }).eq('id', photo.id)
      if (error) throw error
      setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, is_active: !photo.is_active } : item))
    } catch (error) {
      console.error('Unable to change photo visibility:', error)
      toast.error('Could not update photo visibility.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="py-20 text-center font-body text-sm text-[#514B46]">Loading gallery content…</div>

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl font-light text-[#2C2C2C]">Photos of the Week &amp; Galleries</h2>
        <p className="mt-1 font-body text-sm text-[#514B46]">Manage live gallery albums and the photos shown on the public site. Existing catalog rows are not changed by these controls.</p>
      </div>

      {loadError && <div role="alert" className="flex items-center justify-between gap-3 border border-[#E8C9C3] bg-[#FFF8F6] p-4 font-body text-sm text-[#9E4A3E]">{loadError}<button type="button" onClick={() => void loadData()} className="underline">Retry</button></div>}

      <form onSubmit={createGallery} className="grid gap-3 border border-[#E5E0D8] bg-white p-5 md:grid-cols-[1fr_2fr_auto] md:items-end">
        <label className="font-body text-sm text-[#514B46]">Gallery name <span className="text-[#B14F42">*</span><input className={`${inputClass} mt-1`} value={newGalleryName} onChange={(event) => setNewGalleryName(event.target.value)} maxLength={120} required /></label>
        <label className="font-body text-sm text-[#514B46]">Description <span className="text-[#514B46]">(optional)</span><input className={`${inputClass} mt-1`} value={newGalleryDescription} onChange={(event) => setNewGalleryDescription(event.target.value)} maxLength={500} /></label>
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#6B4F1D] px-4 py-2 font-body text-xs uppercase tracking-wide text-white hover:bg-[#51401F] disabled:opacity-50"><Plus size={15} /> Add gallery</button>
      </form>

      {galleries.length === 0 ? (
        <div className="border border-dashed border-[#D0C9C0] py-12 text-center font-body text-sm text-[#514B46]">No galleries have been added yet.</div>
      ) : galleries.map((gallery) => {
        const galleryPhotos = photos.filter((photo) => photo.gallery_id === gallery.id)
        return (
          <section key={gallery.id} className="space-y-4 border border-[#E5E0D8] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-display text-xl text-[#2C2C2C]">{gallery.name}</h3>{gallery.description && <p className="mt-1 max-w-3xl font-body text-sm text-[#514B46]">{gallery.description}</p>}</div>
              <span className="font-body text-xs text-[#514B46]">{galleryPhotos.length} photo{galleryPhotos.length === 1 ? '' : 's'}</span>
            </div>

            <form onSubmit={(event) => void addPhoto(event, gallery.id)} className="grid gap-3 border-t border-[#F0ECE6] pt-4 md:grid-cols-[2fr_2fr_auto] md:items-end">
              <label className="font-body text-sm text-[#514B46]">Public image URL <span className="text-[#B14F42">*</span><input className={`${inputClass} mt-1`} type="url" value={photoForms[gallery.id]?.image_url ?? ''} onChange={(event) => setPhotoForms((current) => ({ ...current, [gallery.id]: { image_url: event.target.value, caption: current[gallery.id]?.caption ?? '' } }))} required /></label>
              <label className="font-body text-sm text-[#514B46]">Caption <span className="text-[#514B46]">(optional)</span><input className={`${inputClass} mt-1`} value={photoForms[gallery.id]?.caption ?? ''} onChange={(event) => setPhotoForms((current) => ({ ...current, [gallery.id]: { image_url: current[gallery.id]?.image_url ?? '', caption: event.target.value } }))} maxLength={240} /></label>
              <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#8C7045] px-4 py-2 font-body text-xs uppercase tracking-wide text-[#6B4F1D] hover:bg-[#F8F5F0] disabled:opacity-50"><Camera size={15} /> Add photo</button>
            </form>

            {galleryPhotos.length > 0 && <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">{galleryPhotos.map((photo) => {
              const draft = drafts[photo.id] ?? { image_url: photo.image_url, caption: photo.caption ?? '', display_order: photo.display_order ?? 0 }
              return (
                <article key={photo.id} className="border border-[#E5E0D8] p-3">
                  <img src={photo.image_url} alt={photo.caption || gallery.name} className="mb-3 aspect-[4/3] w-full bg-[#F5F0E8] object-cover" loading="lazy" />
                  <label className="font-body text-xs text-[#514B46]">Image URL<input className={`${inputClass} mt-1 text-xs`} value={draft.image_url} onChange={(event) => setDrafts((current) => ({ ...current, [photo.id]: { ...draft, image_url: event.target.value } }))} /></label>
                  <div className="mt-2 grid grid-cols-[1fr_90px] gap-2">
                    <label className="font-body text-xs text-[#514B46]">Caption<input className={`${inputClass} mt-1 text-xs`} value={draft.caption} onChange={(event) => setDrafts((current) => ({ ...current, [photo.id]: { ...draft, caption: event.target.value } }))} maxLength={240} /></label>
                    <label className="font-body text-xs text-[#514B46]">Order<input className={`${inputClass} mt-1 text-xs`} type="number" value={draft.display_order} onChange={(event) => setDrafts((current) => ({ ...current, [photo.id]: { ...draft, display_order: Number(event.target.value) } }))} /></label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button type="button" disabled={busy} onClick={() => void togglePhoto(photo)} className="inline-flex items-center gap-1 font-body text-xs text-[#514B46] underline underline-offset-2">{photo.is_active ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}</button>
                    <div className="flex items-center gap-3"><Link to={`/admin/gallery/${photo.id}`} className="inline-flex items-center gap-1 font-body text-xs text-[#6B4F1D] underline underline-offset-2">Media <ExternalLink size={12} /></Link><button type="button" disabled={busy} onClick={() => void savePhoto(photo)} className="inline-flex items-center gap-1 bg-[#6B4F1D] px-3 py-2 font-body text-xs text-white hover:bg-[#51401F] disabled:opacity-50"><Save size={13} /> Save</button></div>
                  </div>
                </article>
              )
            })}</div>}
          </section>
        )
      })}
    </div>
  )
}
