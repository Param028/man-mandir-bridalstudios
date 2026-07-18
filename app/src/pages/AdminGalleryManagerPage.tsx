import { useParams, useNavigate } from 'react-router-dom'
import { UploadCloud, Trash2, ChevronLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/api'

interface GalleryItem {
  _id: string
  url: string
  caption: string
  type: 'image' | 'video'
  uploadedAt: string
}

interface PhotoOfWeek {
  _id: string
  title: string
  thumbnail: string
}

export default function AdminGalleryManagerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<PhotoOfWeek | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const getAuthHeader = () => {
    const adminInfo = localStorage.getItem('adminInfo')
    if (!adminInfo) return {}
    const { token } = JSON.parse(adminInfo)
    return { Authorization: `Bearer ${token}` }
  }

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [photoRes, galleryRes] = await Promise.all([
        supabase.from('photos_of_week').select('*').eq('id', id).single(),
        supabase.from('gallery_items').select('*').eq('photo_of_the_week_id', id).order('created_at', { ascending: false }),
      ])
      
      if (photoRes.error) throw photoRes.error;
      if (galleryRes.error) throw galleryRes.error;

      setPhoto({ ...photoRes.data, _id: photoRes.data.id })
      setItems(galleryRes.data.map((item: any) => ({ ...item, _id: item.id })))
    } catch (err: any) {
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !id) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))
    formData.append('photoOfTheWeekId', id)

    try {
      const newItems = [];
      const fileArray = Array.from(files);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileUrl = await uploadFile('gallery', file);
        
        const newItem = {
          photo_of_the_week_id: id,
          url: fileUrl,
          public_id: file.name,
          media_type: file.type.startsWith('video') ? 'video' : 'image',
          caption: ''
        };
        
        const { data, error } = await supabase.from('gallery_items').insert([newItem]).select().single();
        if (error) throw error;
        
        newItems.push({ ...data, _id: data.id, type: data.media_type });
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }

      setItems((prev) => [...newItems, ...prev])
      toast.success(`${newItems.length} file(s) uploaded!`)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this image/video?')) return
    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item._id !== itemId))
      toast.success('Deleted')
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#C9A96E]" />
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-[#6B6560]">Collection not found</p>
        <button onClick={() => navigate('/admin/photos-of-week')} className="text-[#C9A96E] hover:underline font-body text-sm mt-4">
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-body text-sm text-[#6B6560]">
        <button
          onClick={() => navigate('/admin/photos-of-week')}
          className="text-[#C9A96E] hover:underline flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Photos of the Week
        </button>
        <span>›</span>
        <span className="text-[#2C2C2C]">{photo.title}</span>
      </div>

      <div>
        <h2 className="font-body text-lg font-medium text-[#2C2C2C]">{photo.title} — Gallery</h2>
        <p className="font-body text-sm text-[#6B6560]">
          {items.length} {items.length === 1 ? 'item' : 'items'} · Upload images and videos for this collection
        </p>
      </div>

      {/* Upload Zone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`bg-white border border-dashed rounded p-8 text-center transition-all duration-200 ${
          uploading ? 'border-[#C9A96E] cursor-wait' : 'border-[#E5E0D8] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.02)] cursor-pointer'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 size={32} className="animate-spin text-[#C9A96E] mx-auto" />
            <p className="font-body text-sm text-[#6B6560]">Uploading...</p>
            <div className="max-w-[200px] mx-auto">
              <div className="w-full h-1.5 bg-[#E5E0D8] rounded overflow-hidden">
                <div
                  className="h-full bg-[#C9A96E] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="font-body text-xs text-[#9B9590] mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud size={36} className="text-[#9B9590] mx-auto mb-3" />
            <p className="font-body text-sm text-[#6B6560]">Drag and drop files here, or click to browse</p>
            <p className="font-body text-xs text-[#9B9590] mt-1">
              Images: JPG, PNG, WebP (max 50MB) · Videos: MP4, WebM (max 50MB)
            </p>
          </>
        )}
      </div>

      {/* Empty gallery */}
      {items.length === 0 && !loading && (
        <div className="text-center py-10 border border-dashed border-[#E5E0D8] rounded">
          <p className="font-body text-sm text-[#9B9590]">No images yet. Upload some files above.</p>
        </div>
      )}

      {/* Media Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded overflow-hidden bg-white border border-[#E5E0D8]"
            >
              <div className="relative aspect-[4/5]">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || ''}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23E5E0D8"/></svg>'
                    }}
                  />
                )}
                <span className="absolute top-2 right-2 bg-[rgba(26,26,26,0.7)] text-white text-[10px] font-body px-2 py-0.5 rounded uppercase">
                  {item.type}
                </span>
              </div>
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="font-body text-[12px] text-white truncate">{item.caption}</p>
                </div>
              )}
              {/* Delete button */}
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center bg-white/90 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                title="Delete"
              >
                <Trash2 size={12} className="text-[#C4705A]" />
              </button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
