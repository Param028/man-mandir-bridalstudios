import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '@/lib/api'

export default function TrendingStyles() {
  const { data: products = [], isLoading } = useProducts()
  
  // Get explicitly marked trending products, fallback to first 4 if none
  const explicitlyTrending = products.filter((p: any) => p.is_trending)
  const displayItems = explicitlyTrending.length > 0 
    ? explicitlyTrending.slice(0, 4) 
    : products.slice(0, 4)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  if (isLoading) {
    return (
      <section className="py-20 px-6 md:px-12 bg-[#F8F5F0]">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="font-body text-[#C9A96E]">Loading trending styles...</p>
        </div>
      </section>
    )
  }

  if (displayItems.length === 0) {
    return null; // or you could return a fallback UI
  }

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F8F5F0]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em]"
          >
            Trending Styles
          </motion.h2>
          <Link
            to="/products?sort=trending"
            className="hidden md:flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((item: any, index: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/products/${item._id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-[#EDE6DA] mb-4">
                  <img
                    src={item.primaryImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-body text-base text-[#2C2C2C] mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="font-body text-sm text-[#C9A96E] font-medium">
                  {item.price ? formatCurrency(item.price) : 'Price on request'}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <Link
            to="/products?sort=trending"
            className="inline-flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
