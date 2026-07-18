import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function HeroVideoSection() {
  const [muted, setMuted] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [videoUrl, setVideoUrl] = useState('/assets/hero-video.mp4')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('canplaythrough', () => setVideoReady(true))
    }
  }, [])

  useEffect(() => {
    const fetchActiveVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_videos')
          .select('url')
          .eq('is_active', true)
          .limit(1)
          .single();
        
        if (error) throw error;
        setVideoUrl(data.url)
      } catch (error) {
        console.log('Using default video')
      }
    }
    fetchActiveVideo()
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/assets/photo-week-1.jpg"
        src={videoUrl}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Poster fade-out */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: 'url(/assets/photo-week-1.jpg)',
          opacity: videoReady ? 0 : 1,
        }}
      />

      {/* Text Content */}
      <div className="absolute bottom-[15%] left-6 md:left-12 z-10 max-w-[600px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="font-display text-white text-[36px] md:text-[56px] lg:text-[80px] font-light tracking-[0.08em] leading-[1.1]"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
        >
          Bridal Couture 2024
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="font-display text-white/90 text-lg md:text-2xl font-light tracking-[0.06em] mt-4"
        >
          Where Tradition Meets Modern Elegance
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="mt-8"
        >
          <a
            href="#collections"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-block font-body text-[12px] md:text-[13px] tracking-[0.15em] uppercase px-8 py-3.5 border border-white/80 text-white hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300"
          >
            EXPLORE COLLECTION
          </a>
        </motion.div>
      </div>

      {/* Mute Toggle */}
      <button
        onClick={() => {
          setMuted(!muted)
          if (videoRef.current) {
            videoRef.current.muted = !muted
          }
        }}
        className="absolute bottom-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 text-white"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </section>
  )
}
