import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const styles = [
  {
    id: 1,
    title: 'Bridal Lehengas',
    image: '/assets/photo-week-1.jpg',
    href: '/lehengas',
  },
  {
    id: 2,
    title: 'Cocktail Gowns',
    image: '/assets/photo-week-2.jpg',
    href: '/products?category=cocktail',
  },
  {
    id: 3,
    title: 'Sarees',
    image: '/assets/photo-week-3.jpg',
    href: '/sarees',
  },
  {
    id: 4,
    title: 'Indo Western',
    image: '/assets/photo-week-4.jpg',
    href: '/products?category=indo-western',
  },
]

export default function ShopByStyle() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#F5F0E8]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em]"
          >
            Shop by Style
          </motion.h2>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {styles.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link to={style.href}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl text-white tracking-[0.08em] mb-2">
                    {style.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm font-body tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
