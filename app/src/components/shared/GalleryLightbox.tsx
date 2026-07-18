import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxItem {
  id: number | string
  type: 'image' | 'video'
  url: string
  caption?: string
}

interface GalleryLightboxProps {
  items: LightboxItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function GalleryLightbox({ items, initialIndex, isOpen, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  const goNext = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length])
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length])

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, goNext, goPrev])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (items.length === 0) return null

  const item = items[index]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[4000] bg-[rgba(26,26,26,0.95)] backdrop-blur-[8px] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-white/80 hover:text-[#C9A96E] transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight size={28} />
          </button>

          {/* Content */}
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 120 }}
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] object-contain"
              />
            ) : (
              <img
                src={item.url}
                alt={item.caption || ''}
                className="max-w-full max-h-[75vh] object-contain"
              />
            )}
            <div className="mt-4 text-center">
              <p className="font-body text-sm text-white/60">
                {index + 1} / {items.length}
              </p>
              {item.caption && (
                <p className="font-body text-[13px] text-white/80 mt-1">{item.caption}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
