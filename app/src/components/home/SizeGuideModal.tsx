import { useState, useEffect } from 'react'
import { X, Phone, MessageCircle, Mail, Ruler } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/data'

interface SizeGuideModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSelectedSize: string
  onConfirmSize: (size: string) => void
}

const womenSizeChart = [
  { size: 'XS', us: 2, bust: 32, waist: 26, hip: 36, shoulder: 13.5, armhole: 16 },
  { size: 'S', us: 4, bust: 34, waist: 28, hip: 38, shoulder: 14, armhole: 17 },
  { size: 'M', us: 6, bust: 36, waist: 30, hip: 40, shoulder: 14.5, armhole: 18 },
  { size: 'L', us: 8, bust: 38, waist: 32, hip: 42, shoulder: 15, armhole: 19 },
  { size: 'XL', us: 10, bust: 40, waist: 34, hip: 44, shoulder: 15.5, armhole: 20 },
  { size: 'XXL', us: 12, bust: 42, waist: 36, hip: 46, shoulder: 16, armhole: 21 },
  { size: '3XL', us: 14, bust: 44, waist: 38, hip: 48, shoulder: 16.5, armhole: 22 },
]

export default function SizeGuideModal({
  product,
  open,
  onOpenChange,
  currentSelectedSize,
  onConfirmSize,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'measure'>('guide')
  const [localSize, setLocalSize] = useState(currentSelectedSize)
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  useEffect(() => {
    if (open) {
      setLocalSize(currentSelectedSize)
    }
  }, [open, currentSelectedSize])

  if (!product) return null

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleConfirm = () => {
    onConfirmSize(localSize)
    onOpenChange(false)
  }

  // Conversion helper
  const convert = (val: number) => (unit === 'cm' ? (val * 2.54).toFixed(1) : val)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-[100vw] h-[100dvh] sm:h-auto sm:max-w-[90vw] md:max-w-[1200px] w-full bg-white border-[#E5E0D8] p-0 sm:rounded-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E0D8] flex items-center justify-between p-4 md:px-8 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className={`font-body text-xs md:text-sm tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'guide'
                  ? 'text-[#C9A96E] font-bold border-b-2 border-[#C9A96E] pb-1'
                  : 'text-[#6B6560] hover:text-[#2C2C2C]'
              }`}
            >
              Size Guide
            </button>
            <button
              onClick={() => setActiveTab('measure')}
              className={`font-body text-xs md:text-sm tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'measure'
                  ? 'text-[#C9A96E] font-bold border-b-2 border-[#C9A96E] pb-1'
                  : 'text-[#6B6560] hover:text-[#2C2C2C]'
              }`}
            >
              How to Measure
            </button>
          </div>
          
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center text-[#6B6560] hover:text-[#2C2C2C] hover:bg-neutral-100 rounded-full transition-all duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 bg-[#FDFCFB] custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'guide' ? (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 md:p-8"
              >
                {/* Product Summary & Action Area */}
                <div className="flex flex-col lg:flex-row gap-8 mb-10">
                  
                  {/* Left: Product Info & Size Selection */}
                  <div className="flex-1 flex gap-6">
                    <img 
                      src={product.primaryImage} 
                      alt={product.name} 
                      className="w-24 h-32 md:w-32 md:h-44 object-cover rounded shadow-sm border border-[#E5E0D8]" 
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="font-display text-xl md:text-2xl text-[#2C2C2C] mb-2">{product.name}</h3>
                      <div className="flex items-center gap-3 mb-1">
                        {product.discountedPrice ? (
                          <>
                            <span className="font-body text-lg font-semibold text-[#2C2C2C]">
                              {formatPrice(product.discountedPrice)}
                            </span>
                            <span className="font-body text-xs text-[#9B9590] line-through">
                              {formatPrice(product.price)}
                            </span>
                            <span className="font-body text-[10px] font-semibold text-white tracking-wider uppercase bg-[#C4705A] px-2 py-0.5 rounded">
                              Sale
                            </span>
                          </>
                        ) : (
                          <span className="font-body text-lg font-semibold text-[#2C2C2C]">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-[10px] text-[#9B9590] uppercase tracking-wider mb-5">
                        Inclusive of all taxes
                      </p>
                      
                      {/* Available Sizes */}
                      <div className="space-y-3">
                        <span className="font-body text-[10px] tracking-wider uppercase text-[#6B6560] font-medium block">
                          Select Your Size
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => {
                            const isAvailable = product.sizes?.some((ps: any) => {
                              if (typeof ps === 'string') return ps === s
                              return ps.size === s && ps.stock > 0
                            })
                            const isSelected = localSize === s
                            
                            return (
                              <button
                                key={s}
                                disabled={!isAvailable}
                                onClick={() => setLocalSize(s)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border text-xs md:text-sm font-body transition-all relative flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#C9A96E] bg-[#C9A96E] text-white font-semibold shadow-md scale-105'
                                    : 'border-[#E5E0D8] text-[#2C2C2C] hover:border-[#C9A96E] bg-white'
                                } ${
                                  !isAvailable
                                    ? 'opacity-40 cursor-not-allowed bg-neutral-50 text-neutral-400 hover:border-[#E5E0D8]'
                                    : 'hover:-translate-y-0.5'
                                }`}
                                title={!isAvailable ? 'Out of Stock' : `Select ${s}`}
                              >
                                {s}
                                {!isAvailable && (
                                  <span className="absolute inset-0 w-full h-[1px] bg-neutral-300 rotate-45 top-[48%] pointer-events-none" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                        
                        {localSize && (
                          <button
                            onClick={handleConfirm}
                            className="mt-4 font-body text-xs tracking-wider uppercase px-8 py-3 bg-[#2C2C2C] text-white text-center hover:bg-[#C9A96E] transition-all duration-300 font-semibold rounded shadow-md w-full sm:w-auto"
                          >
                            Confirm Size: {localSize}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Contact Support Card */}
                  <div className="w-full lg:w-72 bg-[#F8F5F0] border border-[#E5E0D8] rounded p-6 flex flex-col justify-center text-center">
                    <h4 className="font-display text-lg text-[#2C2C2C] mb-2">Need help with sizing?</h4>
                    <p className="font-body text-xs text-[#6B6560] mb-5">
                      Our bridal stylists are here to assist you with custom measurements and fit queries.
                    </p>
                    <div className="space-y-3">
                      <a href="tel:+919876543210" className="flex items-center gap-3 text-[#2C2C2C] hover:text-[#C9A96E] transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center group-hover:border-[#C9A96E]">
                          <Phone size={14} />
                        </div>
                        <span className="font-body text-xs font-semibold">+91 98765 43210</span>
                      </a>
                      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#2C2C2C] hover:text-[#4A8C6F] transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center group-hover:border-[#4A8C6F]">
                          <MessageCircle size={14} />
                        </div>
                        <span className="font-body text-xs font-semibold">WhatsApp Us</span>
                      </a>
                      <a href="mailto:support@manmandir.com" className="flex items-center gap-3 text-[#2C2C2C] hover:text-[#C9A96E] transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center group-hover:border-[#C9A96E]">
                          <Mail size={14} />
                        </div>
                        <span className="font-body text-xs font-semibold">Email Support</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Size Table Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display text-xl text-[#2C2C2C]">Women's Apparel Size Guide</h4>
                    
                    {/* Unit Toggle */}
                    <div className="flex items-center bg-[#F8F5F0] rounded-full p-1 border border-[#E5E0D8]">
                      <button
                        onClick={() => setUnit('in')}
                        className={`font-body text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full transition-all ${
                          unit === 'in' ? 'bg-white text-[#2C2C2C] shadow-sm font-semibold' : 'text-[#9B9590] hover:text-[#2C2C2C]'
                        }`}
                      >
                        Inches
                      </button>
                      <button
                        onClick={() => setUnit('cm')}
                        className={`font-body text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full transition-all ${
                          unit === 'cm' ? 'bg-white text-[#2C2C2C] shadow-sm font-semibold' : 'text-[#9B9590] hover:text-[#2C2C2C]'
                        }`}
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded border border-[#E5E0D8]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#F8F5F0]">
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Size</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">US Size</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Bust</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Waist</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Hip</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Shoulder</th>
                          <th className="font-body text-[11px] tracking-wider uppercase text-[#6B6560] p-4 font-semibold border-b border-[#E5E0D8]">Armhole</th>
                        </tr>
                      </thead>
                      <tbody>
                        {womenSizeChart.map((row, idx) => (
                          <tr 
                            key={row.size} 
                            className={`transition-colors ${
                              localSize === row.size 
                                ? 'bg-[#C9A96E]/10' 
                                : idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                            } hover:bg-[#F8F5F0]`}
                          >
                            <td className="p-4 border-b border-[#E5E0D8]">
                              <span className={`font-body text-xs font-bold ${localSize === row.size ? 'text-[#C9A96E]' : 'text-[#2C2C2C]'}`}>
                                {row.size}
                              </span>
                            </td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{row.us}</td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{convert(row.bust)}</td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{convert(row.waist)}</td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{convert(row.hip)}</td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{convert(row.shoulder)}</td>
                            <td className="p-4 border-b border-[#E5E0D8] font-body text-xs text-[#6B6560]">{convert(row.armhole)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-4 font-body text-[11px] text-[#9B9590] leading-relaxed italic bg-[#F8F5F0] p-4 rounded border border-[#E5E0D8]">
                    * This size guide is based on standard body measurements. Measurements may vary slightly depending on the garment design. If you need assistance, please contact our customer support.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="measure"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 md:p-8"
              >
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start max-w-5xl mx-auto">
                  {/* Left: Illustration */}
                  <div className="w-full md:w-1/2 flex justify-center relative bg-[#F8F5F0] p-8 rounded-lg border border-[#E5E0D8]">
                    <Ruler className="absolute top-4 right-4 text-[#C9A96E] opacity-50" size={32} />
                    <svg viewBox="0 0 200 500" className="w-full max-w-[250px] h-auto drop-shadow-md">
                      {/* Abstract Female Silhouette */}
                      <path d="M100 20 C85 20 75 35 75 50 C75 65 85 75 100 75 C115 75 125 65 125 50 C125 35 115 20 100 20 Z" fill="#E5E0D8" />
                      <path d="M75 80 C60 85 45 100 40 120 L30 250 L55 250 L65 150 L75 220 L75 480 L95 480 L100 250 L105 480 L125 480 L125 220 L135 150 L145 250 L170 250 L160 120 C155 100 140 85 125 80 C110 95 90 95 75 80 Z" fill="#E5E0D8" />
                      
                      {/* Measurement Lines */}
                      {/* Shoulder */}
                      <line x1="45" y1="100" x2="155" y2="100" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="45" cy="100" r="4" fill="#2C2C2C" />
                      <circle cx="155" cy="100" r="4" fill="#2C2C2C" />
                      <text x="165" y="104" fontSize="12" fill="#2C2C2C" fontFamily="sans-serif" fontWeight="bold">1</text>
                      
                      {/* Bust */}
                      <line x1="60" y1="140" x2="140" y2="140" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="60" cy="140" r="4" fill="#2C2C2C" />
                      <circle cx="140" cy="140" r="4" fill="#2C2C2C" />
                      <text x="150" y="144" fontSize="12" fill="#2C2C2C" fontFamily="sans-serif" fontWeight="bold">2</text>
                      
                      {/* Waist */}
                      <line x1="68" y1="190" x2="132" y2="190" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="68" cy="190" r="4" fill="#2C2C2C" />
                      <circle cx="132" cy="190" r="4" fill="#2C2C2C" />
                      <text x="142" y="194" fontSize="12" fill="#2C2C2C" fontFamily="sans-serif" fontWeight="bold">3</text>
                      
                      {/* Hip */}
                      <line x1="55" y1="240" x2="145" y2="240" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="55" cy="240" r="4" fill="#2C2C2C" />
                      <circle cx="145" cy="240" r="4" fill="#2C2C2C" />
                      <text x="155" y="244" fontSize="12" fill="#2C2C2C" fontFamily="sans-serif" fontWeight="bold">4</text>

                      {/* Armhole */}
                      <path d="M45 100 Q 35 120 60 140" fill="none" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="20" y="125" fontSize="12" fill="#2C2C2C" fontFamily="sans-serif" fontWeight="bold">5</text>
                    </svg>
                  </div>

                  {/* Right: Instructions */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <h4 className="font-display text-2xl text-[#2C2C2C]">Measuring Guide</h4>
                    <p className="font-body text-sm text-[#6B6560] leading-relaxed">
                      For the most accurate measurements, keep the tape measure comfortably snug, not tight. Measure over undergarments similar to those you plan to wear with your outfit.
                    </p>
                    
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                        <div>
                          <h5 className="font-body text-sm font-bold text-[#2C2C2C] mb-1">Shoulder</h5>
                          <p className="font-body text-xs text-[#6B6560] leading-relaxed">Measure across the back from the edge of one shoulder bone to the edge of the other.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                        <div>
                          <h5 className="font-body text-sm font-bold text-[#2C2C2C] mb-1">Bust</h5>
                          <p className="font-body text-xs text-[#6B6560] leading-relaxed">Measure under your arms, around the fullest part of your chest.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                        <div>
                          <h5 className="font-body text-sm font-bold text-[#2C2C2C] mb-1">Waist</h5>
                          <p className="font-body text-xs text-[#6B6560] leading-relaxed">Measure around your natural waistline, keeping the tape a bit loose.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                        <div>
                          <h5 className="font-body text-sm font-bold text-[#2C2C2C] mb-1">Hip</h5>
                          <p className="font-body text-xs text-[#6B6560] leading-relaxed">Measure around the fullest part of your body at the top of your leg.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</div>
                        <div>
                          <h5 className="font-body text-sm font-bold text-[#2C2C2C] mb-1">Armhole</h5>
                          <p className="font-body text-xs text-[#6B6560] leading-relaxed">Measure from the top of the shoulder down through the armpit and back up to the shoulder.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
