import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Product } from '@/lib/data'

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

const categoryLabels: Record<Product['category'], string> = {
  lehenga: 'Bridal Lehenga',
  saree: 'Saree',
  cocktail: 'Gown',
  'indo-western': 'Reception Wear',
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format currency in Indian Rupees
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Generate stars
  const renderStars = (rating: number = 5) => {
    const stars = []
    const floor = Math.floor(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          className={`${
            i <= floor
              ? 'fill-[#C9A96E] text-[#C9A96E]'
              : i - 0.5 <= rating
              ? 'fill-[#C9A96E]/50 text-[#C9A96E]'
              : 'text-neutral-300'
          }`}
        />
      )
    }
    return stars
  }

  return (
    <div
      className="group cursor-pointer flex flex-col bg-white border border-[#E5E0D8] overflow-hidden transition-all duration-500 hover:shadow-card-hover"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 bg-[#2C2C2C] text-white">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 bg-[#C9A96E] text-white">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Primary Image */}
        <img
          src={product.primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
          loading="lazy"
        />

        {/* Secondary Image */}
        <img
          src={product.secondaryImage}
          alt={`${product.name} alternate`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(1.05)',
          }}
          loading="lazy"
        />

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 bg-white text-[#2C2C2C] shadow-md border border-[#E5E0D8] hover:bg-[#C9A96E] hover:text-white hover:border-[#C9A96E] transition-all duration-300">
            PREVIEW DESIGN
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5 flex flex-col flex-grow bg-white border-t border-[#F5F0E8]">
        {/* Category */}
        <span className="font-body text-[10px] tracking-[0.15em] text-[#C9A96E] uppercase font-medium">
          {categoryLabels[product.category]}
        </span>

        {/* Name */}
        <h3 className="font-display text-lg text-[#2C2C2C] mt-2 mb-1 group-hover:text-[#C9A96E] transition-colors duration-300 truncate">
          {product.name}
        </h3>

        {/* Description Snippet */}
        <p className="font-body text-xs text-[#6B6560] line-clamp-1 mb-4 font-light leading-relaxed">
          {product.description}
        </p>

        {/* Rating and Price Footer */}
        <div className="mt-auto pt-3 border-t border-[#F5F0E8] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
            {product.rating && (
              <span className="font-body text-[10px] text-[#9B9590] ml-1">
                ({product.rating.toFixed(1)})
              </span>
            )}
          </div>
          <span className="font-body text-[13px] font-semibold text-[#2C2C2C]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
}
