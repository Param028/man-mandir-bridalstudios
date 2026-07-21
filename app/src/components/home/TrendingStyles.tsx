import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const trendingItems = [
  {
    id: 1,
    title: 'Embroidered Bridal Lehenga',
    price: '₹1,85,000',
    image: '/assets/photo-week-1.jpg',
    href: '/products',
  },
  {
    id: 2,
    title: 'Silk Banarasi Saree',
    price: '₹45,000',
    image: '/assets/photo-week-2.jpg',
    href: '/products',
  },
  {
    id: 3,
    title: 'Cocktail Gown with Sequins',
    price: '₹78,000',
    image: '/assets/photo-week-3.jpg',
    href: '/products',
  },
  {
    id: 4,
    title: 'Indo Western Sharara Set',
    price: '₹52,000',
    image: '/assets/photo-week-4.jpg',
    href: '/products',
  },
]

export default function TrendingStyles() {
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
          {trendingItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={item.href}>
                <div className="aspect-[3/4] overflow-hidden bg-[#EDE6DA] mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-body text-base text-[#2C2C2C] mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-[#C9A96E] font-medium">
                  {item.price}
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
