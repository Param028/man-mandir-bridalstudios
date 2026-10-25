import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Product } from '@/lib/data'

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const hasAlternate = Boolean(product.primaryImage && product.secondaryImage && product.secondaryImage !== product.primaryImage)
  const rating = typeof product.rating === 'number' && product.rating >= 1 && product.rating <= 5 ? product.rating : null
  const price = typeof product.price === 'number' && product.price > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
    : null

  return (
    <button
      type="button"
      className="group flex cursor-pointer flex-col overflow-hidden border border-[#E5E0D8] bg-white text-left transition-shadow duration-500 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative block aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
        {product.primaryImage && (
          <img
            src={product.primaryImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ opacity: hasAlternate && isHovered ? 0 : 1, transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
            loading="lazy"
          />
        )}
        {hasAlternate && (
          <img
            src={product.secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'scale(1)' : 'scale(1.03)' }}
            loading="lazy"
          />
        )}
        {(product.isNew || product.isBestSeller) && (
          <span className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5">
            {product.isNew && <span className="bg-[#2C2C2C] px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-white">New</span>}
            {product.isBestSeller && <span className="bg-[#6B4F1D] px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-white">Best seller</span>}
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/10 pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="border border-[#E5E0D8] bg-white px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.2em] text-[#2C2C2C] shadow-md">Preview design</span>
        </span>
      </span>

      <span className="flex flex-grow flex-col border-t border-[#F5F0E8] bg-white p-5">
        {product.category && <span className="font-body text-[10px] font-medium uppercase tracking-[0.15em] text-[#6B4F1D]">{product.category}</span>}
        <span className="mt-2 mb-1 truncate font-display text-lg text-[#2C2C2C] transition-colors duration-300 group-hover:text-[#6B4F1D]">{product.name}</span>
        {product.description && <span className="mb-4 line-clamp-1 font-body text-xs font-light leading-relaxed text-[#514B46]">{product.description}</span>}
        <span className="mt-auto flex items-center justify-between border-t border-[#F5F0E8] pt-3">
          {rating !== null ? <span className="inline-flex items-center gap-1 font-body text-xs text-[#514B46]"><Star size={13} aria-hidden="true" className="fill-[#8C7045] text-[#8C7045]" />{rating.toFixed(1)}</span> : <span />}
          <span className="ml-auto font-body text-[13px] font-semibold text-[#2C2C2C]">{price ?? 'Price on request'}</span>
        </span>
      </span>
    </button>
  )
}
