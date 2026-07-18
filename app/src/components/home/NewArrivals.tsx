import { useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import ProductDetailDialog from './ProductDetailDialog'
import { useProducts } from '@/lib/api'
import type { Product } from '@/lib/data'
import { Loader2 } from 'lucide-react'

export default function NewArrivals() {
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useProducts()

  // Filter active new arrivals
  const newArrivals = products.filter((p: any) => p.active && p.isNew)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A96E]" size={28} />
      </div>
    )
  }

  if (newArrivals.length === 0) return null

  return (
    <section id="new-arrivals" className="bg-white py-24 md:py-32 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] block mb-3"
          >
            LATEST CREATIONS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-[28px] md:text-[42px] text-[#2C2C2C] font-light tracking-[0.02em]"
          >
            New Arrivals
          </motion.h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mt-6" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.map((product: any, i: number) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <ProductCard product={product} onClick={() => handleProductClick(product)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Consultation Modal */}
      <ProductDetailDialog
        product={selectedProduct}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </section>
  )
}
