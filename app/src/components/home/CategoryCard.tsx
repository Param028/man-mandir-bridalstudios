import { useState, useRef, useEffect } from 'react'

interface CategoryCardProps {
  primaryImage: string
  secondaryImage: string
  label: string
  onClick?: () => void
}

export default function CategoryCard({ primaryImage, secondaryImage, label, onClick }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Mobile scroll-reveal: auto-swap when card center is in viewport
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    if (!isTouchDevice) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.5 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const showSecondary = isHovered || isVisible

  return (
    <div
      ref={cardRef}
      className="relative aspect-[3/4] overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Preload secondary image */}
      <link rel="preload" as="image" href={secondaryImage} />

      {/* Primary Image */}
      <img
        src={primaryImage}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ opacity: showSecondary ? 0 : 1 }}
        loading="eager"
      />

      {/* Secondary Image */}
      <img
        src={secondaryImage}
        alt={`${label} alternate view`}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          opacity: showSecondary ? 1 : 0,
          transform: showSecondary ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 0.5s cubic-bezier(0.25,0.1,0.25,1), transform 0.8s cubic-bezier(0.25,0.1,0.25,1)',
        }}
        loading="eager"
      />

      {/* Label Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black/50 to-transparent">
        <span
          className="font-body text-white text-xs md:text-[13px] uppercase tracking-[0.15em] inline-block transition-transform duration-300 ease-out"
          style={{ transform: showSecondary ? 'translateY(-4px)' : 'translateY(0)' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
