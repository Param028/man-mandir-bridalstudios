import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { usePublicProducts } from '@/lib/api'
import ContentPlaceholderSection from '@/components/home/ContentPlaceholderSection'

export default function TrendingStyles() {
  const { data: products = [], isLoading } = usePublicProducts()
  const displayItems = products.filter((product: any) => product.is_trending).slice(0, 4)

  if (isLoading) return null
  if (displayItems.length === 0) return <ContentPlaceholderSection eyebrow="The collection" title="Trending Styles" images={['/assets/photo-week-1.jpg', '/assets/photo-week-2.jpg', '/assets/photo-week-3.jpg', '/assets/photo-week-4.jpg']} />

  return (
    <section className="bg-[#F8F5F0] px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex items-center justify-between">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl tracking-[0.06em] text-[#2C2C2C] md:text-5xl">
            Trending Styles
          </motion.h2>
          <Link to="/products?sort=trending" className="hidden items-center gap-2 font-body text-sm uppercase tracking-[0.15em] text-[#6B4F1D] transition-colors hover:text-[#51401F] md:flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((item: any, index: number) => {
            const id = String(item._id || item.id)
            const price = typeof item.discountedPrice === 'number' && item.discountedPrice > 0
              ? item.discountedPrice
              : typeof item.price === 'number' && item.price > 0 ? item.price : null
            return (
              <motion.article key={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.08 }} className="group">
                <Link to={`/products?product=${encodeURIComponent(id)}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]">
                  <div className="mb-4 aspect-[3/4] overflow-hidden bg-[#EDE6DA]">
                    {item.primaryImage && <img src={item.primaryImage} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <h3 className="mb-1 line-clamp-2 font-body text-base text-[#2C2C2C]">{item.name}</h3>
                  {price !== null && <p className="font-body text-sm font-medium text-[#6B4F1D]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)}</p>}
                </Link>
              </motion.article>
            )
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/products?sort=trending" className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-[0.15em] text-[#6B4F1D]">View All <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}
