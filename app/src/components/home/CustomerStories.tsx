import { motion } from 'framer-motion'
import CustomerReviews from '@/components/home/CustomerReviews'

const stories = [
  { image: '/assets/photo-week-1.jpg', quote: 'A thoughtful space to discover a look that feels entirely your own.', label: 'A bride’s studio story' },
  { image: '/assets/photo-week-2.jpg', quote: 'The details, fitting, and styling come together with care.', label: 'A fitting-room story' },
  { image: '/assets/photo-week-3.jpg', quote: 'A memorable experience from the first conversation to the final look.', label: 'A celebration story' },
]

export default function CustomerStories() {
  return (
    <section id="customer-stories" className="bg-[#F8F5F0] px-6 py-20 md:px-12 md:py-28" aria-labelledby="customer-stories-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 text-center">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.18em] text-[#8C7045]">From the studio</p>
          <h2 id="customer-stories-title" className="font-display text-4xl tracking-[0.06em] text-[#2C2C2C] md:text-5xl">Customer Stories</h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-[#6B6560]">Personal moments, considered styling, and the people who make every fitting memorable.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map((story, index) => (
            <motion.article key={story.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="border border-[#DDD6CC] bg-white">
              <div className="aspect-[4/3] overflow-hidden bg-[#E5E0D8]"><img src={story.image} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover" /></div>
              <div className="p-6"><p className="font-body text-sm leading-relaxed text-[#514B46]">“{story.quote}”</p><p className="mt-4 font-body text-xs uppercase tracking-[0.14em] text-[#8C7045]">{story.label}</p></div>
            </motion.article>
          ))}
        </div>
        <CustomerReviews targetType="general" featuredOnly />
      </div>
    </section>
  )
}
