import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UploadCloud, Trash2, ChevronLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { uploadWithSignedUrl } from '@/lib/api'

interface GalleryItem {
  id: string
  url: string
  caption: string | null
  type: 'image' | 'video'
  created_at: string
}

interface PhotoOfWeek {
  id: string
  image_url: string
  caption: string | null
  galleries?: { name?: string | null; description?: string | null } | null
}

const MAX_MEDIA_BYTES = 50 * 1024 * 1024

export default function AdminGalleryManagerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<PhotoOfWeek | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [photoResult, galleryResult] = await Promise.all([
        supabase.from('photos_of_week').select('id,image_url,caption,is_active,galleries(name,description)').eq('id', id).maybeSingle(),
        supabase.from('gallery_items').select('id,url,caption,media_type,created_at').eq('photo_of_the_week_id', id).order('created_at', { ascending: false }),
      ])
      if (photoResult.error) throw photoResult.error
      if (galleryResult.error) throw galleryResult.error
      setPhoto(photoResult.data as PhotoOfWeek | null)
      setItems((galleryResult.data ?? []).map((item: any) => ({ ...item, type: item.media_type === 'video' ? 'video' : 'image' })))
    } catch (error) {
      console.error('Unable to load gallery media:', error)
      toast.error('Gallery could not be loaded. Check admin access and try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0 || !id) return
    const supported = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
    const invalid = files.find((file) => !supported.has(file.type) || file.size > MAX_MEDIA_BYTES)
    if (invalid) {
      toast.error('Choose JPG, PNG, WebP, MP4 or WebM files no larger than 50 MB each.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const newItems: GalleryItem[] = []
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        const fileUrl = await uploadWithSignedUrl('gallery', file)
        const { data, error } = await supabase.from('gallery_items').insert({
          photo_of_the_week_id: id,
          url: fileUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'image',
          caption: '',
        }).select('id,url,caption,media_type,created_at').single()
        if (error) throw error
        newItems.unshift({ ...data, type: data.media_type === 'video' ? 'video' : 'image' })
        setUploadProgress(Math.round(((index + 1) / files.length) * 100))
      }
      setItems((current) => [...newItems, ...current])
      toast.success(`${newItems.length} media item${newItems.length === 1 ? '' : 's'} added`)
    } catch (error) {
      console.error('Unable to upload gallery media:', error)
      toast.error(error instanceof Error ? error.message : 'Media upload failed. Verify admin access and storage configuration.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm('Delete this media record from the gallery?')) return
    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', item.id)
      if (error) throw error
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      toast.success('Gallery item removed')
    } catch (error) {
      console.error('Unable to remove gallery item:', error)
      toast.error('Gallery item could not be removed.')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#8C7045]" /></div>
  if (!photo) return <div className="py-20 text-center"><p className="font-body text-[#514B46]">Collection not found.</p><button onClick={() => navigate('/admin/photos-of-week')} className="mt-4 font-body text-sm text-[#6B4F1D] underline">Back to photos</button></div>

  const title = photo.galleries?.name || photo.caption || 'Gallery'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-body text-sm text-[#514B46]">
        <button onClick={() => navigate('/admin/photos-of-week')} className="inline-flex items-center gap-1 text-[#6B4F1D] underline underline-offset-2"><ChevronLeft size={14} /> Photos of the Week</button>
        <span aria-hidden="true">›</span><span className="text-[#2C2C2C]">{title}</span>
      </div>
      <div className="flex flex-wrap items-start gap-5">
        <img src={photo.image_url} alt={photo.caption || title} className="h-28 w-24 bg-[#F5F0E8] object-cover" />
        <div><h2 className="font-display text-xl text-[#2C2C2C]">{title} — Gallery</h2><p className="mt-1 font-body text-sm text-[#514B46]">{items.length} media item{items.length === 1 ? '' : 's'}</p></div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => void handleFileSelect(event)} className="sr-only" aria-label="Choose gallery images or videos" />
      <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className={`w-full border border-dashed bg-white p-8 text-center transition-colors ${uploading ? 'cursor-wait border-[#8C7045]' : 'border-[#D0C9C0] hover:border-[#8C7045]'}`}>
        {uploading ? <><Loader2 size={28} className="mx-auto mb-3 animate-spin text-[#8C7045]" /><span className="font-body text-sm text-[#514B46]">Uploading selected media… {uploadProgress}%</span></> : <><UploadCloud size={34} className="mx-auto mb-3 text-[#8C7045]" /><span className="block font-body text-sm text-[#514B46]">Add images or videos to this gallery</span><span className="mt-1 block font-body text-xs text-[#514B46]">JPG, PNG, WebP, MP4 or WebM. Maximum 50 MB per file.</span></>}
      </button>

      {items.length === 0 && <div className="border border-dashed border-[#D0C9C0] py-10 text-center font-body text-sm text-[#514B46]">No gallery media has been added.</div>}
      <AnimatePresence>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <motion.article key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.025 }} className="group relative overflow-hidden border border-[#E5E0D8] bg-white">
              <div className="relative aspect-[4/5] bg-[#F5F0E8]">
                {item.type === 'video' ? <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" controls /> : <img src={item.url} alt={item.caption || ''} className="h-full w-full object-cover" loading="lazy" />}
                <span className="absolute right-2 top-2 bg-[#2C2C2C]/80 px-2 py-0.5 font-body text-[10px] uppercase text-white">{item.type}</span>
                <button type="button" onClick={() => void handleDelete(item)} aria-label={`Delete ${item.type} from gallery`} className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center bg-white text-[#B14F42] opacity-90 hover:bg-[#FFF4F1]"><Trash2 size={14} /></button>
              </div>
              {item.caption && <p className="p-2 font-body text-xs text-[#514B46]">{item.caption}</p>}
            </motion.article>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
