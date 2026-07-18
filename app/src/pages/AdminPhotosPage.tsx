import { useState, useEffect } from 'react'
import { Check, Loader2, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useProducts } from '@/lib/api'
import type { Product } from '@/lib/data'
import { getFeaturedIds, setFeaturedIds } from '@/lib/featuredProducts'

const categoryLabels: Record<string, string> = {
  lehenga: 'Bridal Lehenga',
  saree: 'Saree',
  cocktail: 'Gown',
  'indo-western': 'Reception Wear',
}

export default function AdminPhotosPage() {
  const { data: allProducts = [], isLoading } = useProducts()

  const products = (allProducts as Product[])
    .filter((p) => p.active)
    .sort((a, b) => {
      const aTime = new Date((a as any).updatedAt || 0).getTime()
      const bTime = new Date((b as any).updatedAt || 0).getTime()
      return bTime - aTime
    })

  // IDs currently selected as "Photos of the Week"
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getFeaturedIds())

  // Keep in sync if localStorage was updated elsewhere
  useEffect(() => {
    setSelectedIds(getFeaturedIds())
  }, [])

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    setFeaturedIds(selectedIds)
    toast.success(
      selectedIds.length === 0
        ? 'Cleared — carousel will show all active products'
        : `${selectedIds.length} product${selectedIds.length !== 1 ? 's' : ''} featured in Photos of the Week`
    )
  }

  const handleClearAll = () => {
    setSelectedIds([])
  }

  const handleSelectAll = () => {
    setSelectedIds(products.map((p) => String((p as any)._id || p.id)))
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-[#C9A96E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-body text-sm text-[#6B6560]">
            Select which products appear in the <span className="text-[#C9A96E] font-medium">"Photos of the Week"</span> carousel on the homepage.
          </p>
          <p className="font-body text-xs text-[#9B9590] mt-1">
            {selectedIds.length === 0
              ? 'Nothing selected — all active products will be shown.'
              : `${selectedIds.length} of ${products.length} products selected.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearAll}
            className="px-3 py-2 border border-[#E5E0D8] rounded font-body text-xs text-[#6B6560] hover:bg-[#F8F5F0] transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 border border-[#E5E0D8] rounded font-body text-xs text-[#6B6560] hover:bg-[#F8F5F0] transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] text-white rounded font-body text-xs tracking-[0.1em] uppercase hover:bg-[#B8985E] transition-colors"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>

      {/* Instruction banner */}
      <div className="bg-[#FFF9F0] border border-[#E8D9B8] rounded px-4 py-3 font-body text-xs text-[#7A6540]">
        Click any product card to toggle it in/out of the carousel. Hit <strong>Save</strong> when you're done.
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#E5E0D8] rounded">
          <p className="font-body text-sm text-[#6B6560]">No active products found.</p>
          <p className="font-body text-xs text-[#9B9590] mt-1">Add products first from the Products section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, i) => {
            const id = String((product as any)._id || product.id)
            const isSelected = selectedIds.includes(id)

            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleProduct(id)}
                className={`relative text-left rounded overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                  isSelected
                    ? 'border-[#C9A96E] shadow-md ring-1 ring-[#C9A96E]/30'
                    : 'border-[#E5E0D8] hover:border-[#C9A96E]/50'
                }`}
              >
                {/* Selected checkmark badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#C9A96E] flex items-center justify-center shadow">
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Product image */}
                <div className="relative aspect-[3/4] bg-[#F8F5F0] overflow-hidden">
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />

                  {/* Dimming overlay when not selected */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-200" />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                    {product.isNew && (
                      <span className="font-body text-[8px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5 bg-[#2C2C2C] text-white">
                        NEW
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="font-body text-[8px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5 bg-[#C9A96E] text-white">
                        BESTSELLER
                      </span>
                    )}
                  </div>
                </div>

                {/* Product info */}
                <div className="p-3 bg-white">
                  <span className="font-body text-[9px] tracking-[0.12em] text-[#C9A96E] uppercase font-medium block">
                    {categoryLabels[product.category] || product.category}
                  </span>
                  <p className="font-body text-xs font-medium text-[#2C2C2C] mt-0.5 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="font-body text-[11px] text-[#6B6560]">
                      {product.rating && (
                        <span className="flex items-center gap-0.5">
                          <Star size={9} className="fill-[#C9A96E] text-[#C9A96E]" />
                          {product.rating.toFixed(1)}
                        </span>
                      )}
                    </p>
                    <p className="font-body text-[11px] font-semibold text-[#2C2C2C]">
                      {formatPrice(product.discountedPrice || product.price)}
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
