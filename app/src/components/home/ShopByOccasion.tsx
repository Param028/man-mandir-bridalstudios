import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

type Occasion = {
  label: string
  filter: string
  image: string
  description: string
}

const OCCASIONS: Occasion[] = [
  { label: 'Wedding', filter: 'Wedding', image: '/assets/lehenga-primary.jpg', description: 'Statement bridal silhouettes' },
  { label: 'Engagement', filter: 'Engagement', image: '/assets/cocktail-primary.jpg', description: 'Polished looks for the ring ceremony' },
  { label: 'Reception', filter: 'Reception', image: '/assets/indo-western-primary.jpg', description: 'Evening-ready celebration style' },
  { label: 'Haldi', filter: 'Haldi', image: '/assets/photo-week-1.jpg', description: 'Bright, joyful ceremony dressing' },
  { label: 'Mehendi', filter: 'Mehendi', image: '/assets/photo-week-2.jpg', description: 'Colourful looks for every ritual' },
  { label: 'Indian Celebrations', filter: 'Festive', image: '/assets/saree-primary.jpg', description: 'Sarees and occasion favourites' },
]

export default function ShopByOccasion() {
  return (
    <section className="bg-[#F5F0E8] px-6 py-20 md:px-12" aria-labelledby="shop-by-occasion-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 font-body text-xs uppercase tracking-[0.22em] text-[#8A672B]">For every celebration</p>
            <h2 id="shop-by-occasion-title" className="font-display text-4xl tracking-[0.06em] text-[#2C2C2C] md:text-5xl">Shop by Occasion</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 font-body text-sm uppercase tracking-[0.15em] text-[#6B4F1D] hover:text-[#51401F] md:flex">
            View all styles <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {OCCASIONS.map((occasion, index) => (
            <motion.article
              key={occasion.filter}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -60px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <Link to={`/products?occasion=${encodeURIComponent(occasion.filter)}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]">
                <div className="relative mb-3 aspect-[4/5] overflow-hidden bg-[#EDE6DA]">
                  <img src={occasion.image} alt={`${occasion.label} occasion styles`} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 font-display text-xl tracking-[0.04em] text-white md:text-2xl">{occasion.label}</span>
                </div>
                <p className="font-body text-xs leading-relaxed text-[#6B6560]">{occasion.description}</p>
              </Link>
            </motion.article>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-[0.15em] text-[#6B4F1D]">View all styles <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
