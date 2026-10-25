import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { usePublicSiteSettings, isSafeHttpUrl } from '@/lib/siteSettings'

type StoryContent = {
  title?: string
  body?: string
  paragraphs?: string[]
  image_url?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export default function StudioIntroSection() {
  const { data: settings } = usePublicSiteSettings()
  const raw = settings?.craftsmanship
  const content = isRecord(raw) ? raw as StoryContent : {}
  const title = typeof content.title === 'string' && content.title.trim() ? content.title.trim() : 'The ManMandir studio story'
  const paragraphs = Array.isArray(content.paragraphs)
    ? content.paragraphs.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).slice(0, 3)
    : typeof content.body === 'string' && content.body.trim()
      ? [content.body.trim()]
      : ['A considered space for discovering bridal style, personal fittings, and the details that make an occasion feel entirely your own.']
  const image = isSafeHttpUrl(content.image_url) ? content.image_url : '/assets/studio-intro.jpg'

  return (
    <section id="story" className="bg-[#F5F0E8] px-6 py-20 md:px-12 md:py-28" aria-labelledby="studio-story-title">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }} className="aspect-[4/5] overflow-hidden bg-[#E5E0D8]">
              <img src={image} alt="ManMandir Bridal Studio" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>

          {/* Text Content */}
          <div>
            <p className="mb-4 font-body text-xs uppercase tracking-[0.18em] text-[#8C7045]">ABOUT THE STUDIO</p>
            <motion.h2 id="studio-story-title" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl leading-tight tracking-[0.03em] text-[#2C2C2C] md:text-5xl">{title}</motion.h2>
            <div className="mt-6 space-y-4 font-body leading-relaxed text-[#6B6560]">
              {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <Link
                to="/book-appointment"
                className="mt-8 inline-block bg-[#6B4F1D] px-8 py-3.5 font-body text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#51401F]"
              >
                BOOK AN APPOINTMENT
              </Link>
            </motion.div>
          </div>
        </div>
    </section>
  )
}
