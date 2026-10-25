import { usePublicSiteSettings } from '@/lib/siteSettings'

type CraftsmanshipContent = {
  title?: string
  paragraphs?: string[]
  body?: string
  image_url?: string
}

type Stat = { label: string; value: string | number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeStats(value: unknown): Stat[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Stat =>
      isRecord(item) && typeof item.label === 'string' && (typeof item.value === 'string' || typeof item.value === 'number')
    )
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([, stat]) => isRecord(stat) && typeof stat.label === 'string' && (typeof stat.value === 'string' || typeof stat.value === 'number'))
      .map(([, stat]) => stat as Stat)
  }
  return []
}

export default function CraftsmanshipHeritage() {
  const { data: settings } = usePublicSiteSettings()
  const raw = settings?.craftsmanship
  const content = isRecord(raw) ? raw as CraftsmanshipContent : null
  const paragraphs = Array.isArray(content?.paragraphs)
    ? content.paragraphs.filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
    : typeof content?.body === 'string' && content.body.trim()
      ? [content.body]
      : []
  const stats = normalizeStats(settings?.stats)
  const title = typeof content?.title === 'string' ? content.title.trim() : ''

  if (!title && paragraphs.length === 0 && stats.length === 0) return null

  return (
    <section className="bg-[#F8F5F0] px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-4xl">
          {title && <h2 className="mb-6 font-display text-4xl tracking-[0.04em] text-[#2C2C2C] md:text-5xl">{title}</h2>}
          {paragraphs.length > 0 && (
            <div className="space-y-4 font-body leading-relaxed text-[#514B46]">
              {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
            </div>
          )}
          {stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[#DDD6CC] pt-6 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`}>
                  <dt className="font-body text-sm text-[#514B46]">{stat.label}</dt>
                  <dd className="mt-1 font-display text-3xl text-[#8C7045]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
