import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProducts } from '@/lib/api'
import type { Product } from '@/lib/data'
import ProductDetailDialog from './ProductDetailDialog'
import { getFeaturedIds } from '@/lib/featuredProducts'

const categoryLabels: Record<Product['category'], string> = {
  lehenga: 'Bridal Lehenga',
  saree: 'Saree',
  cocktail: 'Gown',
  'indo-western': 'Reception Wear',
}

export default function PhotosOfWeekCarousel() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: allProducts = [] } = useProducts()

  // Determine which products to show:
  // — If the admin has curated a list, show only those (in the order they appear in products)
  // — Otherwise fall back to all active products
  const featuredIds = getFeaturedIds()

  // Sort all active products by updatedAt descending (newest first)
  const activeProducts = (allProducts as Product[])
    .filter((p) => p.active)
    .sort((a, b) => {
      const aTime = new Date((a as any).updatedAt || 0).getTime()
      const bTime = new Date((b as any).updatedAt || 0).getTime()
      return bTime - aTime
    })

  const products: Product[] =
    featuredIds.length > 0
      ? activeProducts.filter((p) => featuredIds.includes(String((p as any)._id || p.id)))
      : activeProducts

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Auto-advance every 5 s
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => emblaApi.scrollNext(), 5000)
    return () => clearInterval(interval)
  }, [emblaApi])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (products.length === 0) return null

  return (
    <>
      <section id="gallery" className="bg-[#F5F0E8] py-20 md:py-28 lg:py-32">
        <div className="max-w-[1440px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] text-center mb-12 md:mb-16"
          >
            PHOTOS OF THE WEEK
          </motion.h2>

          <div className="relative group">
            {/* Navigation Arrows — Desktop */}
            <button
              onClick={scrollPrev}
              className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-[#C9A96E] items-center justify-center text-[#C9A96E] bg-transparent hover:bg-[#C9A96E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-[#C9A96E] items-center justify-center text-[#C9A96E] bg-transparent hover:bg-[#C9A96E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5 px-4 md:px-12">
                {products.map((product, i) => (
                  <motion.div
                    key={(product as any)._id || product.id}
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex-none w-[240px] md:w-[280px] cursor-pointer group/card"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/card:scale-[1.04]"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        {product.isNew && (
                          <span className="font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-0.5 bg-[#2C2C2C] text-white">
                            NEW
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-0.5 bg-[#C9A96E] text-white">
                            BEST SELLER
                          </span>
                        )}
                      </div>

                      {/* "View & Buy" hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
                        <span className="font-body text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 bg-white text-[#2C2C2C] border border-[#E5E0D8] hover:bg-[#C9A96E] hover:text-white hover:border-[#C9A96E] transition-all duration-300 shadow-md">
                          VIEW &amp; BUY
                        </span>
                      </div>

                      {/* Border highlight */}
                      <div className="absolute inset-0 border border-transparent group-hover/card:border-[#C9A96E] transition-colors duration-300 pointer-events-none" />
                    </div>

                    {/* Info */}
                    <div className="mt-3 pb-2">
                      <span className="font-body text-[10px] tracking-[0.15em] text-[#C9A96E] uppercase font-medium block mb-1">
                        {categoryLabels[product.category]}
                      </span>
                      <p className="font-body text-xs tracking-[0.08em] text-[#2C2C2C] group-hover/card:text-[#C9A96E] transition-colors duration-300 truncate">
                        {product.name}
                      </p>
                      <p className="font-body text-xs text-[#6B6560] mt-0.5 font-semibold">
                        {formatPrice(product.discountedPrice || product.price)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
