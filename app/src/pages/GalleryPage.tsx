import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GalleryLightbox from '@/components/shared/GalleryLightbox'
import { supabase } from '@/lib/supabase'

interface GalleryItem {
  _id: string
  type: 'image' | 'video'
  url: string
  caption?: string
}

interface PhotoOfWeek {
  _id: string
  title: string
  thumbnail: string
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
    setLoading(true)
    setNotFound(false)

    const fetchData = async () => {
      try {
        const [photoRes, galleryRes] = await Promise.all([
          supabase.from('photos_of_week').select('*').eq('id', id).single(),
          supabase.from('gallery_items').select('*').eq('photo_of_the_week_id', id)
        ]);
        
        if (photoRes.error) throw photoRes.error;
        if (galleryRes.error) throw galleryRes.error;

        setPhoto({ ...photoRes.data, _id: photoRes.data.id });
        setItems(galleryRes.data.map((item: any) => ({ ...item, _id: item.id, type: item.media_type })));
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C9A96E]" />
      </div>
    )
  }

  if (notFound || !photo) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#2C2C2C] mb-4">Gallery Not Found</h1>
          <button onClick={() => navigate('/')} className="text-[#C9A96E] hover:underline font-body text-sm">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Map to lightbox-compatible format
  const lightboxItems = items.map((item) => ({
    id: item._id,
    type: item.type,
    url: item.url,
    caption: item.caption,
  }))

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <main className="pt-[72px]">
        {/* Header */}
        <div className="bg-[#F5F0E8] pt-16 md:pt-24 pb-10 md:pb-12 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto">
            <button
              onClick={() => navigate('/#gallery')}
              className="flex items-center gap-2 font-body text-sm text-[#6B6560] hover:text-[#C9A96E] transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Photos of the Week
            </button>
            <h1 className="font-display text-[32px] md:text-[48px] text-[#2C2C2C] leading-[1.2]">
              {photo.title}
            </h1>
            <p className="font-body text-[15px] text-[#6B6560] mt-3 max-w-[640px]">
              A curated collection showcasing the finest pieces from our {photo.title.toLowerCase()} line.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 pb-20 md:pb-28">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-[#9B9590]">No images in this collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="cursor-pointer overflow-hidden"
                  onClick={() => {
                    setLightboxIndex(i)
                    setLightboxOpen(true)
                  }}
                >
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full aspect-[4/5] object-cover hover:scale-[1.02] transition-transform duration-300"
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || ''}
                      className="w-full aspect-[4/5] object-cover hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <GalleryLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
