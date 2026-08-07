import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Star, ShoppingBag, Zap } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Product } from '@/lib/data'
import SizeGuideModal from './SizeGuideModal'
import { useCart } from '@/lib/cartContext'

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const navigate = useNavigate()
  const { addItem } = useCart()

  // Selection states
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  // Zoom states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState<'fabric' | 'care'>('fabric')

  // Size Guide state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  // Reset states when a new product is selected
  useEffect(() => {
    if (product) {
      setSelectedImage(product.primaryImage)

      // Set default size (first string or first object with stock > 0)
      const sizes = (product.sizes || []) as any[]
      const firstSize = sizes.find((s) =>
        typeof s === 'string' ? true : s.stock > 0
      )
      setSelectedSize(typeof firstSize === 'string' ? firstSize : firstSize?.size || '')

      // Set default available color
      const firstAvailableColor = (product.colors as any[])?.find((c: any) => c.stock > 0)?.name || ''
      setSelectedColor(firstAvailableColor)

      setIsZoomed(false)
      setActiveTab('fabric')
    }
  }, [product, open])

  if (!product) return null

  // Normalize sizes after null check
  // DB stores plain strings ['S','M'] or objects [{size,stock}] — unify to objects
  const normalizedSizes = ((product.sizes || []) as any[]).map((s: any) =>
    typeof s === 'string'
      ? { size: s, stock: (product as any).stock_quantity ?? (product as any).stockQuantity ?? 10 }
      : s
  )

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
          size={14}
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

  // Calculate current availability based on selected size/color
  const getStockCount = () => {
    // If we have normalized sizes, use them
    if (normalizedSizes.length > 0) {
      const sizeObj = normalizedSizes.find((s) => s.size === selectedSize)
      const colorObj = (product.colors as any[])?.find((c: any) => c.name === selectedColor)
      if (sizeObj && colorObj) return Math.min(sizeObj.stock, colorObj.stock)
      if (sizeObj) return sizeObj.stock
      if (colorObj) return colorObj.stock
      // No size selected but sizes exist — show stock of first available
      return normalizedSizes[0]?.stock ?? ((product as any).stock_quantity ?? (product as any).stockQuantity ?? 0)
    }
    // No sizes at all — fall back to stockQuantity
    return (product as any).stock_quantity ?? (product as any).stockQuantity ?? 0
  }

  const stockCount = getStockCount()

  // Track zoom position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

  // Gallery list
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.primaryImage, product.secondaryImage].filter(Boolean)

  const handleAddToCart = () => {
    if (normalizedSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor)
    toast.success(`${product.name} added to cart`, {
      action: { label: 'View Cart', onClick: () => { onOpenChange(false); navigate('/checkout') } },
    })
  }

  const handleBuyNow = () => {
    if (normalizedSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor)
    onOpenChange(false)
    navigate('/checkout')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
        showCloseButton={false}
        className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[1000px] w-full bg-white border-[#E5E0D8] p-0 overflow-hidden rounded-lg shadow-2xl"
      >
        {/* Elegant top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#C9A96E]/40 via-[#C9A96E] to-[#C9A96E]/40 z-10" />

        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-[#6B6560] hover:text-[#2C2C2C] hover:bg-neutral-100 rounded-full transition-all duration-300 z-10 border border-[#E5E0D8] bg-white/85"
        >
          <X size={18} />
        </button>

        {/* Main Content Area - Scrollable on small viewports */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
          
          {/* LEFT COLUMN: Gallery & Images (md: 7 cols) */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col md:flex-row gap-4 bg-[#F8F5F0]/50 border-r border-[#E5E0D8]">
            
            {/* Thumbnails list */}
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[120px] md:max-h-[480px] pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-neutral-200">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-18 md:w-16 md:h-20 shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-[#C9A96E] scale-[1.03]'
                        : 'border-[#E5E0D8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Viewport with Hover Zoom */}
            <div className="flex-1 order-1 md:order-2">
              <div
                className="relative overflow-hidden aspect-[3/4] w-full bg-[#F5F0E8] border border-[#E5E0D8] cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                  }}
                  loading="eager"
                />

                {/* Subtle instructions overlay */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[9px] tracking-wider uppercase px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-75">
                  Hover to Zoom
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Action Selectors (md: 5 cols) */}
          <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-white">
            
            {/* Upper half details */}
            <div className="space-y-6">
              
              {/* Category, Rating, and Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-body text-[10px] tracking-[0.2em] text-[#C9A96E] uppercase font-semibold">
                  {product.category === 'lehenga'
                    ? 'Bridal Lehenga'
                    : product.category === 'saree'
                    ? 'Pure Silk Saree'
                    : product.category === 'cocktail'
                    ? 'Designer Gown'
                    : 'Indo-Western Fusion'}
                </span>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5 bg-[#F8F5F0] px-2.5 py-1 border border-[#E5E0D8] rounded">
                  <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                  {product.rating && (
                    <span className="font-body text-[10px] text-[#6B6560] font-medium">
                      {product.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="font-display text-2xl md:text-3xl text-[#2C2C2C] tracking-[0.01em] leading-tight mb-2">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-3">
                  {product.discountedPrice ? (
                    <>
                      <span className="font-body text-lg md:text-xl font-semibold text-[#2C2C2C]">
                        {formatPrice(product.discountedPrice)}
                      </span>
                      <span className="font-body text-xs text-[#9B9590] line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="font-body text-[10px] font-semibold text-[#4A8C6F] tracking-wider uppercase bg-[rgba(74,140,111,0.1)] px-2 py-0.5 rounded">
                        Special Offer
                      </span>
                    </>
                  ) : (
                    <span className="font-body text-lg md:text-xl font-semibold text-[#2C2C2C]">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="font-body text-xs text-[#6B6560] leading-relaxed font-light">
                {product.description}. Exclusively designed and handcrafted for the modern bride, preserving heritage artisanal embroidery techniques.
              </p>

              {/* Colors selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-body text-[10px] tracking-wider uppercase text-[#6B6560] font-medium">
                      Select Color
                    </span>
                    <span className="font-body text-[11px] text-[#2C2C2C] font-semibold">
                      {selectedColor}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c) => {
                      const isColorAvailable = c.stock > 0
                      const isSelected = selectedColor === c.name
                      return (
                        <button
                          key={c.name}
                          disabled={!isColorAvailable}
                          onClick={() => setSelectedColor(c.name)}
                          className={`relative w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'border-[#C9A96E] ring-1 ring-[#C9A96E] scale-110'
                              : 'border-neutral-200 hover:border-neutral-400'
                          } ${!isColorAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title={c.name + (!isColorAvailable ? ' (Out of stock)' : '')}
                        >
                          <span
                            className="w-5.5 h-5.5 rounded-full block"
                            style={{ backgroundColor: c.hex }}
                          />
                          {!isColorAvailable && (
                            <span className="absolute inset-0 w-full h-[1px] bg-[#C4705A] rotate-45 top-[48%] pointer-events-none" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sizes selector */}
              {normalizedSizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-body text-[10px] tracking-wider uppercase text-[#6B6560] font-medium">
                        Select Size
                      </span>
                      <button
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="font-body text-[10px] tracking-wider uppercase text-[#C9A96E] hover:text-[#B8985E] font-semibold underline underline-offset-2 transition-colors"
                      >
                        Size Guide
                      </button>
                    </div>
                    <span className="font-body text-[11px] text-[#2C2C2C] font-semibold">
                      {selectedSize || 'None'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {normalizedSizes.map((s) => {
                      const isSizeAvailable = s.stock > 0
                      const isSelected = selectedSize === s.size
                      return (
                        <button
                          key={s.size}
                          disabled={!isSizeAvailable}
                          onClick={() => setSelectedSize(s.size)}
                          className={`w-10 h-10 border text-[11px] font-body transition-all relative ${
                            isSelected
                              ? 'border-[#C9A96E] bg-[#C9A96E]/5 text-[#C9A96E] font-semibold'
                              : 'border-[#E5E0D8] text-[#6B6560] hover:border-[#C9A96E] hover:text-[#C9A96E]'
                          } ${
                            !isSizeAvailable
                              ? 'opacity-40 cursor-not-allowed bg-neutral-50 text-neutral-400 border-dashed'
                              : ''
                          }`}
                        >
                          {s.size}
                          {!isSizeAvailable && (
                            <span className="absolute inset-0 w-full h-[1px] bg-neutral-300 rotate-45 top-[48%] pointer-events-none" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Fabric & Care Tabs Section */}
              <div className="border border-[#E5E0D8] rounded-md overflow-hidden bg-[#F8F5F0]/30 mt-4">
                {/* Tab buttons */}
                <div className="flex border-b border-[#E5E0D8] text-xs font-body">
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className={`flex-1 py-2 px-3 text-center border-r border-[#E5E0D8] transition-all font-medium ${
                      activeTab === 'fabric'
                        ? 'bg-white text-[#C9A96E] font-semibold'
                        : 'text-[#6B6560] hover:text-[#2C2C2C] hover:bg-[#F8F5F0]/60'
                    }`}
                  >
                    Fabric & Details
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`flex-1 py-2 px-3 text-center transition-all font-medium ${
                      activeTab === 'care'
                        ? 'bg-white text-[#C9A96E] font-semibold'
                        : 'text-[#6B6560] hover:text-[#2C2C2C] hover:bg-[#F8F5F0]/60'
                    }`}
                  >
                    Care Instructions
                  </button>
                </div>

                {/* Tab content panel */}
                <div className="p-4 font-body text-xs text-[#6B6560] space-y-3 leading-relaxed">
                  {activeTab === 'fabric' && product.fabricDetails ? (
                    <>
                      <div>
                        <span className="font-semibold text-[#2C2C2C] block">Material:</span>
                        <span>{product.fabricDetails.material}</span>
                      </div>
                      {product.fabricDetails.embroidery && (
                        <div>
                          <span className="font-semibold text-[#2C2C2C] block">Embroidery:</span>
                          <span>{product.fabricDetails.embroidery}</span>
                        </div>
                      )}
                      {product.fabricDetails.design && (
                        <div>
                          <span className="font-semibold text-[#2C2C2C] block">Design Silhouette:</span>
                          <span>{product.fabricDetails.design}</span>
                        </div>
                      )}
                    </>
                  ) : activeTab === 'care' && product.careInstructions ? (
                    <>
                      <div>
                        <span className="font-semibold text-[#2C2C2C] block">Washing:</span>
                        <span>{product.careInstructions.washing}</span>
                      </div>
                      {product.careInstructions.dryClean && (
                        <div>
                          <span className="font-semibold text-[#2C2C2C] block">Dry Cleaning:</span>
                          <span>{product.careInstructions.dryClean}</span>
                        </div>
                      )}
                      {product.careInstructions.storage && (
                        <div>
                          <span className="font-semibold text-[#2C2C2C] block">Storage recommendations:</span>
                          <span>{product.careInstructions.storage}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-2 text-[#9B9590]">
                      Specifications available on request during fitting.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom half: Stock Availability & Buy CTAs */}
            <div className="pt-6 mt-6 border-t border-[#F5F0E8] space-y-4">
              
              {/* Stock status indicator */}
              <div className="flex items-center justify-between">
                <span className="font-body text-[10px] tracking-wider uppercase text-[#9B9590]">
                  Availability
                </span>
                
                <div className="flex items-center gap-1.5">
                  {stockCount > 0 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#4A8C6F]" />
                      <span className="font-body text-xs font-semibold text-[#4A8C6F]">
                        In Stock
                      </span>
                      <span className="font-body text-[10px] text-[#4A8C6F] font-semibold bg-[rgba(74,140,111,0.1)] px-2 py-0.5 rounded ml-1">
                        {stockCount} available
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#C4705A]" />
                      <span className="font-body text-xs font-semibold text-[#C4705A]">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Buy Now */}
              <button
                disabled={stockCount <= 0}
                onClick={handleBuyNow}
                className="w-full font-body text-xs tracking-[0.18em] uppercase px-8 py-4 bg-[#C9A96E] text-white text-center hover:bg-[#B8985E] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed border border-transparent transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                {stockCount > 0 ? 'BUY NOW' : 'OUT OF STOCK'}
              </button>

              {/* Add to Cart */}
              <button
                disabled={stockCount <= 0}
                onClick={handleAddToCart}
                className="w-full font-body text-xs tracking-[0.18em] uppercase px-8 py-3.5 bg-transparent text-[#2C2C2C] text-center hover:bg-[#2C2C2C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-[#2C2C2C] transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} />
                ADD TO CART
              </button>
            </div>

          </div>

        </div>
        </DialogContent>
      </Dialog>
      <SizeGuideModal 
        product={product} 
        open={isSizeGuideOpen} 
        onOpenChange={setIsSizeGuideOpen}
        currentSelectedSize={selectedSize}
        onConfirmSize={setSelectedSize}
      />
    </>
  )
}
