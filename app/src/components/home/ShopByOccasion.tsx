import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const occasions = [
  {
    id: 1,
    title: 'Mehendi',
    description: 'Vibrant & Comfortable',
    image: '/assets/photo-week-1.jpg',
    href: '/products?occasion=mehendi',
  },
  {
    id: 2,
    title: 'Haldi',
    description: 'Yellow & Radiant',
    image: '/assets/photo-week-2.jpg',
    href: '/products?occasion=haldi',
  },
  {
    id: 3,
    title: 'Sangeet',
    description: 'Glamorous & Sparkling',
    image: '/assets/photo-week-3.jpg',
    href: '/products?occasion=sangeet',
  },
  {
    id: 4,
    title: 'Wedding',
    description: 'Regal & Timeless',
    image: '/assets/photo-week-4.jpg',
    href: '/products?occasion=wedding',
  },
]

export default function ShopByOccasion() {
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
          {occasions.map((occasion, index) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={occasion.href}>
                <div className="aspect-square overflow-hidden bg-[#EDE6DA] mb-4 relative">
                  <img
                    src={occasion.image}
                    alt={occasion.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
                <h3 className="font-display text-2xl text-[#2C2C2C] tracking-[0.08em] mb-1">
                  {occasion.title}
                </h3>
                <p className="font-body text-sm text-[#6B6560]">
                  {occasion.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
