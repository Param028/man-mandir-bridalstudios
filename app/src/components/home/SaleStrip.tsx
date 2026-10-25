import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type LinkType = 'category' | 'product' | 'booking' | 'custom'

type Sale = {
  id: string
  title: string
  subtitle: string | null
  badge_text: string | null
  link_type: LinkType
  link_value: string | null
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  show_countdown: boolean
  show_in_bar: boolean
  show_as_card: boolean
  is_active: boolean
  display_order: number
}

const DISMISSAL_KEY = 'sale-strip-dismissed-until'
const DISMISSAL_DURATION_MS = 24 * 60 * 60 * 1000
const SALE_COLUMNS = 'id,title,subtitle,badge_text,link_type,link_value,image_url,starts_at,ends_at,show_countdown,show_in_bar,show_as_card,is_active,display_order'

function isStripEnabled(value: unknown): boolean {
  if (value === true) return true
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
  if (value && typeof value === 'object' && 'enabled' in value) {
    return (value as { enabled?: unknown }).enabled === true
  }
  return false
}

function getSaleHref(sale: Sale): string | null {
  const value = sale.link_value?.trim()
  if (sale.link_type === 'booking') return '/book-appointment'
  if (!value) return null

  if (sale.link_type === 'category') return `/products?category=${encodeURIComponent(value)}`
  if (sale.link_type === 'product') return `/products?product=${encodeURIComponent(value)}`
  if (sale.link_type === 'custom') {
    if (value.startsWith('/') && !value.startsWith('//')) return value
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
    } catch {
      return null
    }
  }
  return null
}

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

function formatCountdown(endsAt: string, now: number): string {
  const remaining = Math.max(0, new Date(endsAt).getTime() - now)
  if (remaining === 0) return 'Ended'
  const seconds = Math.floor(remaining / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : `${hours}h ${minutes}m`
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

type SaleStripProps = { variant?: 'all' | 'announcement' | 'cards' }

export default function SaleStrip({ variant = 'all' }: SaleStripProps) {
  const barRef = useRef<HTMLElement>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [now, setNow] = useState(Date.now())
  const reducedMotion = useReducedMotion()
  const barSales = sales.filter((sale) => sale.show_in_bar)
  const cardSales = sales.filter((sale) => sale.show_as_card)
  const activeSale = barSales.length > 0 ? barSales[activeIndex % barSales.length] : null

  useEffect(() => {
    let isMounted = true

    const loadLiveSales = async () => {
      setIsLoading(true)
      try {
        const { data: setting, error: settingError } = await supabase
          .from('public_site_settings')
          .select('value')
          .eq('key', 'sale_strip_enabled')
          .maybeSingle()
        if (settingError) throw settingError

        const enabled = isStripEnabled(setting?.value)
        if (!enabled) {
          if (isMounted) {
            setIsEnabled(false)
            setSales([])
          }
          return
        }

        const { data, error } = await supabase
          .from('sale')
          .select(SALE_COLUMNS)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        // RLS applies the authoritative UTC live-window filter using database now().
        if (error) throw error

        if (isMounted) {
          setIsEnabled(true)
          setSales((data ?? []) as Sale[])
        }
      } catch (error) {
        console.error('Unable to load live sales:', error)
        if (isMounted) {
          setIsEnabled(false)
          setSales([])
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadLiveSales()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (variant === 'cards') return
    const root = document.documentElement
    const updateHeight = () => {
      const height = activeSale && !isAnnouncementDismissed ? barRef.current?.offsetHeight ?? 0 : 0
      root.style.setProperty('--sale-announcement-height', `${height}px`)
    }
    updateHeight()
    const observer = barRef.current && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateHeight)
      : null
    if (barRef.current && observer) observer.observe(barRef.current)
    window.addEventListener('resize', updateHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateHeight)
      root.style.setProperty('--sale-announcement-height', '0px')
    }
  }, [activeSale, isAnnouncementDismissed, variant])

  useEffect(() => {
    try {
      const storedExpiry = window.localStorage.getItem(DISMISSAL_KEY)
      if (storedExpiry && Number(storedExpiry) > Date.now()) {
        setIsAnnouncementDismissed(true)
      } else if (storedExpiry) {
        window.localStorage.removeItem(DISMISSAL_KEY)
      }
    } catch {
      // Storage may be unavailable; the close button still works for this visit.
    }
  }, [])

  useEffect(() => {
    if (!activeSale?.show_countdown || !activeSale.ends_at) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [activeSale?.id, activeSale?.show_countdown, activeSale?.ends_at])

  useEffect(() => {
    if (reducedMotion || isPaused || isAnnouncementDismissed || barSales.length < 2) return
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % barSales.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [barSales.length, isAnnouncementDismissed, isPaused, reducedMotion])

  const dismissAnnouncement = () => {
    setIsAnnouncementDismissed(true)
    try {
      window.localStorage.setItem(DISMISSAL_KEY, String(Date.now() + DISMISSAL_DURATION_MS))
    } catch {
      // Keep the dismissal in memory if persistent storage is unavailable.
    }
  }

  if (isLoading || !isEnabled || sales.length === 0) return null

  const showAnnouncement = variant !== 'cards'
  const showCards = variant !== 'announcement'

  return (
    <div className="w-full">
      {showAnnouncement && activeSale && !isAnnouncementDismissed && (
        <section
          ref={barRef}
          aria-label="Sale announcement"
          className="fixed inset-x-0 top-0 z-[1100] bg-[#2C2C2C] text-white"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
          }}
        >
          <div className="mx-auto flex min-h-12 max-w-[1440px] items-center justify-center gap-3 px-3 py-2 sm:px-6">
            {barSales.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index - 1 + barSales.length) % barSales.length)}
                aria-label="Previous sale announcement"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
            )}
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
              {activeSale.badge_text && (
                <span className="rounded-sm bg-[#F0D8A8] px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2C2C2C]">
                  {activeSale.badge_text}
                </span>
              )}
              {(() => {
                const href = getSaleHref(activeSale)
                const title = (
                  <span className="font-body text-sm font-semibold text-white underline decoration-white/60 underline-offset-2">
                    {activeSale.title}
                  </span>
                )
                return href ? (
                  <a
                    href={href}
                    target={isExternalHref(href) ? '_blank' : undefined}
                    rel={isExternalHref(href) ? 'noopener noreferrer' : undefined}
                    className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {title}
                  </a>
                ) : title
              })()}
              {activeSale.subtitle && <span className="font-body text-sm text-white/90">{activeSale.subtitle}</span>}
              {activeSale.show_countdown && activeSale.ends_at && (
                <span className="font-body text-xs font-medium tabular-nums text-[#F0D8A8]" aria-live="off">
                  {formatCountdown(activeSale.ends_at, now)}
                </span>
              )}
            </div>
            {barSales.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index + 1) % barSales.length)}
                aria-label="Next sale announcement"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={dismissAnnouncement}
              aria-label="Dismiss sale announcement for 24 hours"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {showCards && cardSales.length > 0 && (
        <section aria-label="Current sales" className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 lg:px-12">
          <div className="grid grid-flow-col auto-cols-[82%] snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
            {cardSales.map((sale) => {
              const href = getSaleHref(sale)
              const external = href ? isExternalHref(href) : false
              const content = (
                <>
                  {sale.image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-[#F5F0E8]">
                      <img src={sale.image_url} alt={sale.title} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex h-full flex-col items-start p-5">
                    {sale.badge_text && (
                      <span className="mb-3 rounded-sm bg-[#2C2C2C] px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                        {sale.badge_text}
                      </span>
                    )}
                    <h2 className="font-display text-xl font-medium text-[#2C2C2C]">{sale.title}</h2>
                    {sale.subtitle && <p className="mt-2 font-body text-sm leading-relaxed text-[#514B46]">{sale.subtitle}</p>}
                    {sale.show_countdown && sale.ends_at && (
                      <p className="mt-auto pt-4 font-body text-xs font-semibold tabular-nums text-[#6B4F1D]">
                        Time remaining: {formatCountdown(sale.ends_at, now)}
                      </p>
                    )}
                  </div>
                </>
              )

              const cardClass = 'flex h-full min-h-40 snap-start flex-col overflow-hidden border border-[#D0C9C0] bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]'

              return href ? (
                <a
                  key={sale.id}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  aria-label={`${sale.title}${external ? ' (opens in a new tab)' : ''}`}
                  className={cardClass}
                >
                  {content}
                </a>
              ) : (
                <article key={sale.id} className={cardClass}>
                  {content}
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
