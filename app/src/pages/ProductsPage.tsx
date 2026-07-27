import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/home/ProductCard'
import ProductDetailDialog from '@/components/home/ProductDetailDialog'
import { useProducts } from '@/lib/api'
import type { Product } from '@/lib/data'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'

// Categories matching options
const CATEGORY_OPTIONS = [
  { id: 'lehenga', label: 'Bridal Lehenga' },
  { id: 'saree', label: 'Saree' },
  { id: 'cocktail', label: 'Gown' },
  { id: 'indo-western', label: 'Reception Wear' },
]

// Size options
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Color options with hex codes
const COLOR_OPTIONS = [
  { id: 'Red/Maroon', label: 'Red & Maroon', hex: '#B80F0A' },
  { id: 'Pink/Blush', label: 'Pink & Blush', hex: '#F1C0B9' },
  { id: 'Gold/Ivory', label: 'Ivory & Gold', hex: '#E8DCC8' },
  { id: 'Green', label: 'Green & Emerald', hex: '#004B49' },
]

// Occasion options
const OCCASION_OPTIONS = ['Wedding', 'Engagement', 'Reception', 'Haldi', 'Mehendi']

// Fabric options
const FABRIC_OPTIONS = ['Silk', 'Net', 'Velvet', 'Georgette', 'Satin', 'Cotton', 'Other']

// Designer options
const DESIGNER_OPTIONS = ['Sabyasachi', 'Manish Malhotra', 'Anita Dongre', 'Tarun Tahiliani']

// Helper to categorize product material
const getFabricGroup = (material: string): string => {
  const mat = material.toLowerCase()
  if (mat.includes('silk') || mat.includes('chanderi') || mat.includes('kanjeevaram') || mat.includes('katan') || mat.includes('banarasi')) return 'Silk'
  if (mat.includes('net') || mat.includes('tulle') || mat.includes('organza')) return 'Net'
  if (mat.includes('velvet')) return 'Velvet'
  if (mat.includes('georgette')) return 'Georgette'
  if (mat.includes('satin')) return 'Satin'
  if (mat.includes('cotton')) return 'Cotton'
  return 'Other'
}

// Helper to categorize product color
const getColorFamily = (colorName: string): string => {
  const name = colorName.toLowerCase()
  if (name.includes('red') || name.includes('maroon') || name.includes('crimson') || name.includes('coral') || name.includes('velvet')) return 'Red/Maroon'
  if (name.includes('pink') || name.includes('blush') || name.includes('rose') || name.includes('paradise')) return 'Pink/Blush'
  if (name.includes('gold') || name.includes('ivory') || name.includes('white') || name.includes('champagne')) return 'Gold/Ivory'
  if (name.includes('green') || name.includes('emerald')) return 'Green'
  return 'Other'
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const { data: products = [], isLoading } = useProducts()

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 250000])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([])

  // Collapsible sections state (desktop sidebar)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    sizes: true,
    colors: true,
    occasions: true,
    fabrics: true,
    designers: true,
  })

  // Product detail dialog state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Mobile drawer filter open state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Sync category from URL search query on mount and query changes
  useEffect(() => {
    const categoryQuery = searchParams.get('category')
    if (categoryQuery) {
      // If the category matches a valid category, set it
      const categoryExists = CATEGORY_OPTIONS.some((c) => c.id === categoryQuery)
      if (categoryExists) {
        setSelectedCategories([categoryQuery])
      }
    } else {
      setSelectedCategories([])
    }
  }, [searchParams])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Handle category selection and update URL search params accordingly
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
      
      // Update search params to keep URL in sync
      if (updated.length === 1) {
        setSearchParams({ category: updated[0] })
      } else {
        const params = new URLSearchParams(searchParams)
        params.delete('category')
        setSearchParams(params)
      }
      return updated
    })
  }

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const handleColorToggle = (colorFamilyId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorFamilyId) ? prev.filter((c) => c !== colorFamilyId) : [...prev, colorFamilyId]
    )
  }

  const handleOccasionToggle = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    )
  }

  const handleFabricToggle = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    )
  }

  const handleDesignerToggle = (designer: string) => {
    setSelectedDesigners((prev) =>
      prev.includes(designer) ? prev.filter((d) => d !== designer) : [...prev, designer]
    )
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceRange([0, 250000])
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedOccasions([])
    setSelectedFabrics([])
    setSelectedDesigners([])
    setSearchParams({})
  }

  const handleRemoveTag = (type: string, value: string) => {
    switch (type) {
      case 'search':
        setSearchQuery('')
        break
      case 'category':
        handleCategoryToggle(value)
        break
      case 'size':
        handleSizeToggle(value)
        break
      case 'color':
        handleColorToggle(value)
        break
      case 'occasion':
        handleOccasionToggle(value)
        break
      case 'fabric':
        handleFabricToggle(value)
        break
      case 'designer':
        handleDesignerToggle(value)
        break
      case 'price':
        setPriceRange([0, 250000])
        break
    }
  }

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return (products as any[]).filter((product: any) => {
      // Must be active to show to customers
      if (!product.active) return false

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesCategory = product.category.toLowerCase().includes(query)
        const matchesDesigner = product.designer?.toLowerCase().includes(query) || false
        if (!matchesName && !matchesCategory && !matchesDesigner) return false
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) return false
      }

      // Price filter (actual price paid, check discountedPrice first)
      const actualPrice = product.discountedPrice ?? product.price ?? 0
      if (actualPrice < priceRange[0]) return false
      // If priceRange[1] is at max (250000), treat it as 'no upper limit'
      if (priceRange[1] < 250000 && actualPrice > priceRange[1]) return false

      // Size filter (must have at least one selected size in stock)
      if (selectedSizes.length > 0) {
        const hasAvailableSize = (product.sizes as any[])?.some(
          (s: any) => selectedSizes.includes(typeof s === 'string' ? s : s.size)
        )
        if (!hasAvailableSize) return false
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasAvailableColor = (product.colors as any[])?.some(
          (c: any) => selectedColors.includes(getColorFamily(c.name)) && c.stock > 0
        )
        if (!hasAvailableColor) return false
      }

      // Occasion filter
      if (selectedOccasions.length > 0) {
        const matchesOccasion = (product.occasions as any[])?.some((o: any) => selectedOccasions.includes(o))
        if (!matchesOccasion) return false
      }

      // Fabric filter
      if (selectedFabrics.length > 0) {
        const fabricGroup = getFabricGroup(product.fabricDetails?.material || '')
        if (!selectedFabrics.includes(fabricGroup)) return false
      }

      // Brand/Designer filter
      if (selectedDesigners.length > 0) {
        if (!selectedDesigners.includes(product.designer || '')) return false
      }

      return true
    })
  }, [
    searchQuery,
    selectedCategories,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedOccasions,
    selectedFabrics,
    selectedDesigners,
  ])

  // Active filter tags helper
  const activeTags = useMemo(() => {
    const tags: { type: string; label: string; value: string }[] = []

    if (searchQuery) {
      tags.push({ type: 'search', label: `Search: "${searchQuery}"`, value: searchQuery })
    }

    selectedCategories.forEach((catId) => {
      const label = CATEGORY_OPTIONS.find((c) => c.id === catId)?.label || catId
      tags.push({ type: 'category', label: `Category: ${label}`, value: catId })
    })

    if (priceRange[0] > 0 || priceRange[1] < 250000) {
      tags.push({
        type: 'price',
        label: `Price: ₹${(priceRange[0] / 1000).toFixed(0)}k - ₹${(priceRange[1] / 1000).toFixed(0)}k`,
        value: 'price',
      })
    }

    selectedSizes.forEach((size) => {
      tags.push({ type: 'size', label: `Size: ${size}`, value: size })
    })

    selectedColors.forEach((colorId) => {
      const label = COLOR_OPTIONS.find((c) => c.id === colorId)?.label || colorId
      tags.push({ type: 'color', label: `Color: ${label}`, value: colorId })
    })

    selectedOccasions.forEach((occ) => {
      tags.push({ type: 'occasion', label: `Occasion: ${occ}`, value: occ })
    })

    selectedFabrics.forEach((fabric) => {
      tags.push({ type: 'fabric', label: `Fabric: ${fabric}`, value: fabric })
    })

    selectedDesigners.forEach((des) => {
      tags.push({ type: 'designer', label: `Designer: ${des}`, value: des })
    })

    return tags
  }, [
    searchQuery,
    selectedCategories,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedOccasions,
    selectedFabrics,
    selectedDesigners,
  ])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Shared Filter UI Component (used on both sidebar and drawer)
  const FilterContent = () => (
    <div className="space-y-6 pr-2">
      {/* Category Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Collections</span>
          {openSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2.5"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(opt.id)}
                    onChange={() => handleCategoryToggle(opt.id)}
                    className="w-4 h-4 rounded border-[#D0C9C0] text-[#C9A96E] focus:ring-[#C9A96E]"
                  />
                  <span className="font-body text-xs text-[#6B6560] group-hover:text-[#2C2C2C] transition-colors">
                    {opt.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-4 pt-1"
            >
              <Slider
                value={[priceRange[0], priceRange[1]]}
                min={0}
                max={250000}
                step={5000}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                className="w-full py-1 text-[#C9A96E]"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <span className="font-body text-[9px] tracking-wider text-[#9B9590] uppercase block mb-1">
                    Min Price
                  </span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full border border-[#D0C9C0] rounded px-3 py-1.5 font-body text-xs outline-none focus:border-[#C9A96E] bg-white text-[#2C2C2C]"
                  />
                </div>
                <div className="h-6 w-[1px] bg-[#EDE6DA] mt-4" />
                <div className="flex-1">
                  <span className="font-body text-[9px] tracking-wider text-[#9B9590] uppercase block mb-1">
                    Max Price
                  </span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full border border-[#D0C9C0] rounded px-3 py-1.5 font-body text-xs outline-none focus:border-[#C9A96E] bg-white text-[#2C2C2C]"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="font-body text-[10px] text-[#C9A96E] font-medium">
                  {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('sizes')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Sizes</span>
          {openSections.sizes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.sizes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-2 pt-1">
                {SIZE_OPTIONS.map((size) => {
                  const isSelected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`h-9 border text-xs font-body transition-all font-medium ${
                        isSelected
                          ? 'border-[#C9A96E] bg-[#C9A96E]/5 text-[#C9A96E] font-semibold'
                          : 'border-[#E5E0D8] text-[#6B6560] hover:border-[#C9A96E] hover:text-[#C9A96E] bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Colors</span>
          {openSections.colors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.colors && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2.5 pt-1"
            >
              {COLOR_OPTIONS.map((opt) => {
                const isSelected = selectedColors.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleColorToggle(opt.id)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    <span
                      className={`w-5 h-5 rounded-full border transition-all ${
                        isSelected
                          ? 'border-[#C9A96E] ring-1 ring-[#C9A96E] scale-110'
                          : 'border-neutral-300 group-hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: opt.hex }}
                    />
                    <span
                      className={`font-body text-xs transition-colors ${
                        isSelected
                          ? 'text-[#C9A96E] font-medium'
                          : 'text-[#6B6560] group-hover:text-[#2C2C2C]'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Occasion Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('occasions')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Occasions</span>
          {openSections.occasions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.occasions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2.5"
            >
              {OCCASION_OPTIONS.map((occ) => (
                <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(occ)}
                    onChange={() => handleOccasionToggle(occ)}
                    className="w-4 h-4 rounded border-[#D0C9C0] text-[#C9A96E] focus:ring-[#C9A96E]"
                  />
                  <span className="font-body text-xs text-[#6B6560] group-hover:text-[#2C2C2C] transition-colors">
                    {occ}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fabric Filter */}
      <div className="border-b border-[#EDE6DA] pb-5">
        <button
          onClick={() => toggleSection('fabrics')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Fabric Types</span>
          {openSections.fabrics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.fabrics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2.5"
            >
              {FABRIC_OPTIONS.map((fabric) => (
                <label key={fabric} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFabrics.includes(fabric)}
                    onChange={() => handleFabricToggle(fabric)}
                    className="w-4 h-4 rounded border-[#D0C9C0] text-[#C9A96E] focus:ring-[#C9A96E]"
                  />
                  <span className="font-body text-xs text-[#6B6560] group-hover:text-[#2C2C2C] transition-colors">
                    {fabric}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brand/Designer Filter */}
      <div>
        <button
          onClick={() => toggleSection('designers')}
          className="w-full flex items-center justify-between font-body text-xs tracking-wider uppercase text-[#2C2C2C] font-semibold text-left mb-3 hover:text-[#C9A96E] transition-colors"
        >
          <span>Designers</span>
          {openSections.designers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {openSections.designers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2.5"
            >
              {DESIGNER_OPTIONS.map((des) => (
                <label key={des} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedDesigners.includes(des)}
                    onChange={() => handleDesignerToggle(des)}
                    className="w-4 h-4 rounded border-[#D0C9C0] text-[#C9A96E] focus:ring-[#C9A96E]"
                  />
                  <span className="font-body text-xs text-[#6B6560] group-hover:text-[#2C2C2C] transition-colors">
                    {des}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navbar />

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center py-40">
          <Loader2 className="animate-spin text-[#C9A96E]" size={36} />
        </div>
      ) : (
        <main className="pt-[72px] flex-grow">
        {/* Editorial Header */}
        <div className="relative overflow-hidden bg-[#EDE6DA] border-b border-[#DDD6CC] py-16 md:py-24 px-6 md:px-12">
          {/* Subtle floral/mandala background pattern details could go here */}
          <div className="max-w-[1440px] mx-auto text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#C9A96E] block mb-3 font-semibold"
            >
              ManMandir Bridal Studio
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-4xl md:text-6xl text-[#2C2C2C] font-light tracking-[0.02em] leading-tight"
            >
              The Couture Catalog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-body text-xs md:text-sm text-[#6B6560] mt-4 max-w-[640px] mx-auto leading-relaxed"
            >
              Browse our handcrafted collection of bespoke bridal lehengas, pure silk sarees, evening gowns, and contemporary reception silhouettes.
            </motion.p>
            <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mt-8" />
          </div>
        </div>

        {/* Catalog Content */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Desktop Filters Sidebar (Hidden on Mobile) */}
            <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[96px] h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
              <div className="flex items-center justify-between pb-5 border-b border-[#EDE6DA] mb-6">
                <span className="font-body text-xs tracking-[0.15em] uppercase text-[#2C2C2C] font-bold">
                  Filter Couture
                </span>
                {activeTags.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 font-body text-[11px] text-[#C9A96E] hover:text-[#B8985E] transition-colors"
                  >
                    <RotateCcw size={11} />
                    Reset All
                  </button>
                )}
              </div>
              <FilterContent />
            </aside>

            {/* Product Listing Area */}
            <div className="flex-1 space-y-6">
              
              {/* Controls bar: Search & Mobile Filter Toggle */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search Input */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Search by product, category, or designer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#D0C9C0] focus:border-[#C9A96E] rounded-md pl-11 pr-4 py-3 font-body text-xs md:text-sm outline-none transition-colors duration-300"
                  />
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9590]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9590] hover:text-[#2C2C2C]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Button & Count Display */}
                <div className="flex items-center justify-between gap-4">
                  {/* Matching products count */}
                  <span className="font-body text-xs text-[#6B6560] font-light">
                    Showing <strong className="font-medium text-[#2C2C2C]">{filteredProducts.length}</strong> of{' '}
                    {(products as any[]).filter((p: any) => p.active).length} creations
                  </span>

                  {/* Filter Trigger on Mobile */}
                  <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <button className="lg:hidden flex items-center gap-2 px-5 py-3 border border-[#D0C9C0] bg-white hover:border-[#C9A96E] text-[#2C2C2C] text-xs font-body tracking-wider uppercase font-semibold transition-all">
                        <SlidersHorizontal size={14} />
                        Filters
                        {activeTags.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#C9A96E] text-white rounded-full">
                            {activeTags.length}
                          </span>
                        )}
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#F5F0E8] overflow-y-auto p-6 pt-12 border-r border-[#DDD6CC]">
                      <SheetHeader className="pb-5 border-b border-[#EDE6DA] mb-6 flex flex-row items-center justify-between p-0">
                        <SheetTitle className="font-body text-sm tracking-[0.15em] uppercase text-[#2C2C2C] font-bold">
                          Filter Couture
                        </SheetTitle>
                        {activeTags.length > 0 && (
                          <button
                            onClick={() => {
                              handleClearAll()
                              setIsMobileFiltersOpen(false)
                            }}
                            className="flex items-center gap-1.5 font-body text-[11px] text-[#C9A96E]"
                          >
                            <RotateCcw size={11} />
                            Reset All
                          </button>
                        )}
                      </SheetHeader>
                      <div className="pb-10">
                        <FilterContent />
                      </div>
                      
                      {/* Apply Button in Mobile Drawer */}
                      <div className="sticky bottom-0 left-0 right-0 bg-[#F5F0E8] pt-4 border-t border-[#EDE6DA] flex justify-end">
                        <SheetClose asChild>
                          <button className="w-full font-body text-xs tracking-wider uppercase py-3.5 bg-[#2C2C2C] text-white hover:bg-[#C9A96E] transition-all font-semibold">
                            Apply Filters
                          </button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-[#EDE6DA]/40 p-4 border border-[#EDE6DA]/60 rounded-md">
                  <span className="font-body text-[10px] tracking-wider uppercase text-[#6B6560] font-semibold mr-1">
                    Active Filters:
                  </span>
                  {activeTags.map((tag) => (
                    <span
                      key={`${tag.type}-${tag.value}`}
                      className="inline-flex items-center gap-1.5 font-body text-[11px] bg-white border border-[#E5E0D8] text-[#2C2C2C] px-3 py-1.5 rounded-full"
                    >
                      {tag.label}
                      <button
                        onClick={() => handleRemoveTag(tag.type, tag.value)}
                        className="w-4 h-4 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#9B9590] hover:text-[#2C2C2C]"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleClearAll}
                    className="font-body text-[11px] text-[#C9A96E] hover:underline font-semibold ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Product Grid */}
              <div className="pt-2">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.length > 0 ? (
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    >
                      {filteredProducts.map((product: any) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <ProductCard
                            product={product}
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsDetailOpen(true)
                            }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-20 px-6 border border-dashed border-[#DDD6CC] rounded-lg bg-white/40"
                    >
                      <span className="font-display text-2xl text-[#2C2C2C] block mb-3">
                        No Couture Pieces Match Your Criteria
                      </span>
                      <p className="font-body text-xs md:text-sm text-[#6B6560] max-w-md mx-auto leading-relaxed mb-8">
                        Our collections are constantly evolving. Reset the filters or speak with our master designer to request a custom made bespoke outfit.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                          onClick={handleClearAll}
                          className="font-body text-xs tracking-wider uppercase px-6 py-3.5 border border-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all font-semibold"
                        >
                          Reset All Filters
                        </button>
                        <button
                          onClick={() => navigate('/book-appointment')}
                          className="font-body text-xs tracking-wider uppercase px-6 py-3.5 bg-[#C9A96E] hover:bg-[#B8985E] text-white transition-all font-semibold"
                        >
                          Book Studio Consultation
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </main>
      )}

      <Footer />

      {/* Product Detail Modal */}
      <ProductDetailDialog
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
