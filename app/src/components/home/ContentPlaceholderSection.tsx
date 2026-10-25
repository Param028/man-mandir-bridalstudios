import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type ContentPlaceholderSectionProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  images: string[]
  href?: string
  ctaLabel?: string
  tone?: 'cream' | 'sand' | 'white'
}

export default function ContentPlaceholderSection({
  id,
  eyebrow,
  title,
  description = 'New content will appear here as it is added from the studio admin.',
  images,
  href = '/products',
  ctaLabel = 'Explore the collection',
  tone = 'cream',
}: ContentPlaceholderSectionProps) {
  const background = tone === 'sand' ? 'bg-[#EDE6DA]' : tone === 'white' ? 'bg-white' : 'bg-[#F8F5F0]'

  return (
    <section id={id} className={`${background} border-t border-[#EDE6DA] px-6 py-20 md:px-12 md:py-28`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow && <p className="mb-3 font-body text-xs uppercase tracking-[0.18em] text-[#8C7045]">{eyebrow}</p>}
            <h2 id={id ? `${id}-title` : undefined} className="font-display text-4xl tracking-[0.06em] text-[#2C2C2C] md:text-5xl">{title}</h2>
            <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-[#6B6560]">{description}</p>
          </div>
          {href && (
            <Link to={href} className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.15em] text-[#6B4F1D] hover:text-[#51401F]">
              {ctaLabel} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.slice(0, 4).map((image, index) => (
            <motion.div key={`${image}-${index}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.06 }} className="aspect-[3/4] overflow-hidden bg-[#E5E0D8]">
              <img src={image} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
