import { useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type PhotoRow = {
  id: string
  gallery_id: string | null
  image_url: string
  caption: string | null
  display_order: number | null
  galleries?: { name?: string | null; description?: string | null } | null
}

export default function PhotosOfWeekCarousel() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['photos-of-week-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos_of_week')
        .select('id,gallery_id,image_url,caption,display_order,is_active,galleries(name,description)')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []).filter((row: any) => typeof row.image_url === 'string' && row.image_url.trim()) as PhotoRow[]
    },
    staleTime: 60_000,
    retry: false,
  })
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' })
  const photos = useMemo(() => data, [data])

  if (isLoading || photos.length === 0) return null

  return (
    <section id="gallery" className="bg-[#F5F0E8] py-20 md:py-28 lg:py-32" aria-labelledby="photos-of-week-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex items-end justify-between px-4 md:mb-16 md:px-12">
          <h2 id="photos-of-week-title" className="font-display text-3xl tracking-[0.06em] text-[#2C2C2C] md:text-4xl">Photos of the Week</h2>
          {photos.length > 1 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous photos" className="flex h-10 w-10 items-center justify-center border border-[#8C7045] text-[#6B4F1D] hover:bg-[#8C7045] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Next photos" className="flex h-10 w-10 items-center justify-center border border-[#8C7045] text-[#6B4F1D] hover:bg-[#8C7045] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5 px-4 md:px-12">
            {photos.map((photo, index) => (
              <motion.article key={photo.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className="group flex-none w-[240px] md:w-[280px]">
                <Link to={`/gallery/${encodeURIComponent(photo.id)}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]">
                  <div className="aspect-[3/4] overflow-hidden bg-[#EDE6DA]">
                    <img src={photo.image_url} alt={photo.caption || photo.galleries?.name || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-3">
                    {photo.galleries?.name && <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#6B4F1D]">{photo.galleries.name}</p>}
                    {photo.caption && <p className="mt-1 line-clamp-2 font-body text-sm text-[#2C2C2C]">{photo.caption}</p>}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
