import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'

const categories = [
  {
    id: 'lehenga',
    label: 'BRIDAL LEHENGAS',
    primaryImage: '/assets/lehenga-primary.jpg',
    secondaryImage: '/assets/lehenga-secondary.jpg',
  },
  {
    id: 'saree',
    label: 'SAREES',
    primaryImage: '/assets/saree-primary.jpg',
    secondaryImage: '/assets/saree-secondary.jpg',
  },
  {
    id: 'cocktail',
    label: 'GOWNS',
    primaryImage: '/assets/cocktail-primary.jpg',
    secondaryImage: '/assets/cocktail-secondary.jpg',
  },
  {
    id: 'indo-western',
    label: 'RECEPTION WEAR',
    primaryImage: '/assets/indo-western-primary.jpg',
    secondaryImage: '/assets/indo-western-secondary.jpg',
  },
]

export default function CategoryShowcase() {
  const navigate = useNavigate()

  return (
    <section id="collections" className="bg-[#EDE6DA] py-24 md:py-32 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] text-center mb-12 md:mb-16"
        >
          OUR COLLECTIONS
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <CategoryCard
                primaryImage={cat.primaryImage}
                secondaryImage={cat.secondaryImage}
                label={cat.label}
                onClick={() => {
                  navigate(`/products?category=${cat.id}`)
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
