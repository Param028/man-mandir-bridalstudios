import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '@/lib/api'

export default function ShopByOccasion() {
  const { data: categories = [], isLoading } = useCategories()

  // Get explicitly marked featured categories, fallback to first 4 if none
  const explicitlyFeatured = categories.filter((c: any) => c.is_featured)
  const displayItems = explicitlyFeatured.length > 0 
    ? explicitlyFeatured.slice(0, 4) 
    : categories.slice(0, 4)

  if (isLoading) {
    return (
      <section className="py-20 px-6 md:px-12 bg-[#F5F0E8]">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="font-body text-[#C9A96E]">Loading occasions...</p>
        </div>
      </section>
    )
  }

  if (displayItems.length === 0) {
    return null; // Handle empty state
  }

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F5F0E8]">
      <div className="max-w-[1440px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em] mb-12 text-center"
        >
          Shop by Occasion
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((occasion: any, index: number) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/products?category=${occasion.slug}`}>
                <div className="aspect-square overflow-hidden bg-[#EDE6DA] mb-4 relative">
                  <img
                    src={occasion.cover_image || `/assets/photo-week-${(index % 4) + 1}.jpg`}
                    alt={occasion.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
                <h3 className="font-display text-2xl text-[#2C2C2C] tracking-[0.08em] mb-1">
                  {occasion.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
