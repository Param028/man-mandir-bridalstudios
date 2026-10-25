import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Play, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCategories } from '@/lib/api'
import { supabase } from '@/lib/supabase'

type HeroContent = {
  videoUrl: string | null
  posterUrl: string | null
  headline: string
  subtitle: string
  primaryLabel: string
  primaryLink: string
  secondaryLabel: string
  secondaryLink: string
  showMuteButton: boolean
}

type Category = { id: string; name: string; slug?: string | null; is_active?: boolean }

function getRoute(link: string, fallback: string): string {
  const value = link.trim()
  return value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

export default function HeroVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [dataSaver, setDataSaver] = useState(false)
  const [playRequested, setPlayRequested] = useState(false)
  const [muted, setMuted] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [portraitVideo, setPortraitVideo] = useState(false)
  const [content, setContent] = useState<HeroContent>({
    videoUrl: null,
    posterUrl: null,
    headline: 'Bridal Couture',
    subtitle: '',
    primaryLabel: 'Explore Collection',
    primaryLink: '/products',
    secondaryLabel: 'Book Appointment',
    secondaryLink: '/book-appointment',
    showMuteButton: true,
  })
  const { data: categories = [] } = useCategories()

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    setDataSaver(Boolean(connection?.saveData))
  }, [])

  useEffect(() => {
    let mounted = true
    const loadHero = async () => {
      try {
        const { data: video, error } = await supabase
          .from('hero_videos')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error) throw error

        let posterUrl = typeof video?.poster_url === 'string' ? video.poster_url : null
        if (!posterUrl) {
          const { data: photo } = await supabase
            .from('photos_of_week')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          posterUrl = photo?.thumbnail_url || photo?.image_url || photo?.cover_image || null
        }
        if (!mounted) return

        setContent({
          videoUrl: typeof video?.url === 'string' && video.url.trim() ? video.url : null,
          posterUrl: typeof posterUrl === 'string' && posterUrl.trim() ? posterUrl : null,
          headline: typeof video?.headline === 'string' && video.headline.trim() ? video.headline.trim() : 'Bridal Couture',
          subtitle: typeof video?.subtitle === 'string' ? video.subtitle.trim() : '',
          primaryLabel: typeof video?.primary_label === 'string' && video.primary_label.trim() ? video.primary_label.trim() : 'Explore Collection',
          primaryLink: getRoute(typeof video?.primary_link === 'string' ? video.primary_link : '', '/products'),
          secondaryLabel: typeof video?.secondary_label === 'string' && video.secondary_label.trim() ? video.secondary_label.trim() : 'Book Appointment',
          secondaryLink: getRoute(typeof video?.secondary_link === 'string' ? video.secondary_link : '', '/book-appointment'),
          showMuteButton: video?.show_mute_button !== false,
        })
      } catch (error) {
        console.error('Unable to load hero content:', error)
        if (mounted) {
          setContent((current) => ({ ...current, videoUrl: null }))
        }
      }
    }
    void loadHero()
    return () => { mounted = false }
  }, [])

  const posterOnly = Boolean(prefersReducedMotion || dataSaver) && !playRequested
  const canShowVideo = Boolean(content.videoUrl && !videoFailed && !posterOnly)

  useEffect(() => {
    const hero = heroRef.current
    const video = videoRef.current
    if (!hero || !video || !canShowVideo) return

    let isVisible = true
    const syncPlayback = () => {
      if (document.visibilityState !== 'visible' || !isVisible) {
        video.pause()
      } else if (!videoFailed) {
        void video.play().catch(() => setVideoFailed(true))
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      syncPlayback()
    }, { threshold: 0.15 })
    observer.observe(hero)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [canShowVideo, videoFailed, content.videoUrl])

  useEffect(() => {
    if (!content.posterUrl) return
    const preload = document.createElement('link')
    preload.rel = 'preload'
    preload.as = 'image'
    preload.href = content.posterUrl
    preload.fetchPriority = 'high'
    document.head.appendChild(preload)
    return () => { preload.remove() }
  }, [content.posterUrl])

  const categoryList = (categories as Category[])
    .filter((category) => category.is_active !== false && category.name?.trim())
    .filter((category) => /lehenga|saree|cocktail|indo[\s-]?west/i.test(`${category.slug ?? ''} ${category.name}`))
    .slice(0, 4)

  const renderLink = (label: string, to: string, secondary = false) => (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center border px-7 py-3 font-body text-xs font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${secondary ? 'border-white/90 bg-black/15 text-white hover:bg-white hover:text-[#2C2C2C]' : 'border-[#F1DCA8] bg-[#F1DCA8] text-[#2C2C2C] hover:border-white hover:bg-white'}`}
    >
      {label}
    </Link>
  )

  return (
    <>
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[620px] h-[100svh] w-full items-end overflow-hidden bg-[#F5F0E8]"
        aria-label="ManMandir Bridal Studio"
      >
        {content.posterUrl && (
          <img
            src={content.posterUrl}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady && canShowVideo ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {canShowVideo && (
          <>
            {portraitVideo && content.posterUrl && (
              <div className="absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
                <img src={content.posterUrl} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload={window.matchMedia('(min-width: 768px)').matches ? 'auto' : 'metadata'}
              poster={content.posterUrl ?? undefined}
              src={content.videoUrl ?? undefined}
              onLoadedMetadata={(event) => {
                const video = event.currentTarget
                setPortraitVideo(video.videoHeight > video.videoWidth)
              }}
              onCanPlayThrough={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 h-full w-full ${portraitVideo ? 'object-contain' : 'object-cover'}`}
              aria-label={content.headline}
            />
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-32 text-center md:px-12 md:pb-28 md:text-left">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-[760px]"
          >
            <h1 className="max-w-[16ch] break-words font-display text-[clamp(2.5rem,6vw,5.75rem)] font-light leading-[1.02] tracking-[0.035em] text-white [text-wrap:balance]">
              {content.headline}
            </h1>
            {content.subtitle && <p className="mt-4 max-w-[48ch] font-body text-base font-light leading-relaxed text-white/95 md:text-xl">{content.subtitle}</p>}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              {renderLink(content.primaryLabel, content.primaryLink)}
              {renderLink(content.secondaryLabel, content.secondaryLink, true)}
            </div>
          </motion.div>
        </div>

        {posterOnly && content.videoUrl && (
          <button
            type="button"
            onClick={() => setPlayRequested(true)}
            aria-label="Play hero video"
            className="absolute right-6 top-24 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/80 bg-black/40 px-4 text-sm text-white backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Play size={16} aria-hidden="true" /> Play video
          </button>
        )}

        {content.showMuteButton && canShowVideo && (
          <button
            type="button"
            onClick={() => {
              const nextMuted = !muted
              setMuted(nextMuted)
              if (videoRef.current) videoRef.current.muted = nextMuted
            }}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="absolute bottom-6 right-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
          </button>
        )}

        <a href="#shop-style" aria-label="Scroll to collections" className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <span className="font-body text-[10px] uppercase tracking-[0.18em]">Scroll to explore</span>
          <ChevronDown size={17} aria-hidden="true" />
        </a>
      </section>

      {categoryList.length > 0 && (
        <nav aria-label="Shop by category" className="border-b border-[#DDD6CC] bg-[#F5F0E8]">
          <ul className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-7 gap-y-2 px-6 py-4 md:gap-x-12">
            {categoryList.map((category) => (
              <li key={category.id}>
                <Link to={`/products?category=${encodeURIComponent(category.slug || category.id)}`} className="font-body text-xs uppercase tracking-[0.13em] text-[#514B46] underline-offset-4 transition-colors hover:text-[#6B4F1D] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6B4F1D]">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
