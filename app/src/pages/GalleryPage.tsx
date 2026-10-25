import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GalleryLightbox from '@/components/shared/GalleryLightbox'
import CustomerReviews from '@/components/home/CustomerReviews'
import { supabase } from '@/lib/supabase'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  url: string
  caption?: string | null
}

interface PhotoOfWeek {
  id: string
  gallery_id: string | null
  image_url: string
  caption: string | null
  display_order: number | null
  galleries?: { name?: string | null; description?: string | null } | null
}

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<PhotoOfWeek | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)
    setNotFound(false)

    const fetchData = async () => {
      try {
        const [photoResult, itemsResult] = await Promise.all([
          supabase
            .from('photos_of_week')
            .select('id,gallery_id,image_url,caption,display_order,is_active,galleries(name,description)')
            .eq('id', id)
            .eq('is_active', true)
            .maybeSingle(),
          supabase
            .from('gallery_items')
            .select('id,url,caption,media_type,created_at')
            .eq('photo_of_the_week_id', id)
            .order('created_at', { ascending: true }),
        ])
        if (photoResult.error) throw photoResult.error
        if (itemsResult.error) throw itemsResult.error
        if (!mounted) return
        if (!photoResult.data) {
          setNotFound(true)
          setPhoto(null)
        } else {
          setPhoto(photoResult.data as PhotoOfWeek)
          setItems((itemsResult.data ?? []).map((item: any) => ({
            id: item.id,
            type: item.media_type === 'video' ? 'video' : 'image',
            url: item.url,
            caption: item.caption,
          })))
        }
      } catch (error) {
        console.error('Unable to load gallery:', error)
        if (mounted) setNotFound(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchData()
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]"><Loader2 size={32} className="animate-spin text-[#8C7045]" /></div>
  }

  if (notFound || !photo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <h1 className="mb-4 font-display text-3xl text-[#2C2C2C]">Gallery Not Found</h1>
          <button onClick={() => navigate('/')} className="font-body text-sm text-[#6B4F1D] underline underline-offset-2">Back to Home</button>
        </div>
      </div>
    )
  }

  const title = photo.galleries?.name || photo.caption || 'Gallery'
  const lightboxItems = items.map((item) => ({ id: item.id, type: item.type, url: item.url, caption: item.caption || undefined }))

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <main className="pt-[80px]">
        <div className="bg-[#F5F0E8] px-6 pb-10 pt-12 md:px-12 md:pt-16">
          <div className="mx-auto max-w-[1440px]">
            <button onClick={() => navigate('/#gallery')} className="mb-6 inline-flex items-center gap-2 font-body text-sm text-[#514B46] transition-colors hover:text-[#6B4F1D]"><ArrowLeft size={16} aria-hidden="true" />Back to Photos of the Week</button>
            <h1 className="font-display text-[32px] leading-tight text-[#2C2C2C] md:text-[48px]">{title}</h1>
            {photo.galleries?.description && <p className="mt-3 max-w-[700px] font-body text-[15px] text-[#514B46]">{photo.galleries.description}</p>}
          </div>
        </div>

        {photo.image_url && (
          <div className="mx-auto max-w-[1440px] px-4 md:px-12">
            <img src={photo.image_url} alt={photo.caption || title} className="max-h-[760px] w-full bg-[#EDE6DA] object-contain" fetchPriority="high" />
          </div>
        )}

        <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-12" aria-label="Gallery photos">
          {items.length === 0 ? (
            <p className="py-10 text-center font-body text-[#514B46]">More gallery images will be added here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="cursor-pointer overflow-hidden bg-[#EDE6DA] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]"
                  onClick={() => { setLightboxIndex(index); setLightboxOpen(true) }}
                >
                  {item.type === 'video' ? (
                    <video src={item.url} className="aspect-[4/5] w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={item.url} alt={item.caption || ''} className="aspect-[4/5] w-full object-cover" loading="lazy" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </section>

        <CustomerReviews targetType="gallery" targetId={photo.id} />
      </main>
      <Footer />
      <GalleryLightbox items={lightboxItems} initialIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </div>
  )
}
