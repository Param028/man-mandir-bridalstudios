import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react'
import { useCategories, useSubcategories } from '@/lib/api'

export default function ShopByStyle() {
  const { data: categories = [], isLoading: loadingCat } = useCategories()
  const { data: allSubcategories = [], isLoading: loadingSub } = useSubcategories()
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const isLoading = loadingCat || loadingSub

  // Fallback to static styles if API fails or no categories yet
  const fallbackStyles = [
    { id: '1', name: 'Bridal Lehengas', cover_image: '/assets/photo-week-1.jpg', slug: 'lehengas' },
    { id: '2', name: 'Cocktail Gowns', cover_image: '/assets/photo-week-2.jpg', slug: 'cocktail' },
    { id: '3', name: 'Sarees', cover_image: '/assets/photo-week-3.jpg', slug: 'sarees' },
    { id: '4', name: 'Indo Western', cover_image: '/assets/photo-week-4.jpg', slug: 'indo-western' },
  ]

  const displayCategories = categories.length > 0 ? categories : fallbackStyles

  const handleCategoryClick = (categoryId: string) => {
    const subcats = allSubcategories.filter((s: any) => s.category_id === categoryId)
    if (subcats.length > 0) {
      setSelectedCategoryId(categoryId)
    } else {
      // If no subcategories, just navigate to products with this category
      window.location.href = `/products?category=${categoryId}`
    }
  }

  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId)
  const currentSubcategories = selectedCategoryId 
    ? allSubcategories.filter((s: any) => s.category_id === selectedCategoryId)
    : []

  if (isLoading) {
    return (
      <section className="py-20 px-6 md:px-12 bg-[#F5F0E8] min-h-[400px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C9A96E]" />
      </section>
    )
  }

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F5F0E8] overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {selectedCategoryId ? (
              <button 
                onClick={() => setSelectedCategoryId(null)}
                className="flex items-center gap-2 font-body text-sm tracking-[0.1em] uppercase text-[#6B6560] hover:text-[#2C2C2C] mb-4 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Categories
              </button>
            ) : null}
            <h2 className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em]">
              {selectedCategoryId ? selectedCategory?.name : 'Shop by Style'}
            </h2>
          </motion.div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!selectedCategoryId ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayCategories.map((style: any, index: number) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative overflow-hidden cursor-pointer"
                  onClick={() => handleCategoryClick(style.id)}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#E5E0D8]">
                    <img
                      src={style.cover_image || '/assets/photo-week-1.jpg'}
                      alt={style.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl text-white tracking-[0.08em] mb-2">
                      {style.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm font-body tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="subcategories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {currentSubcategories.map((sub: any, index: number) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  <Link to={`/products?category=${selectedCategoryId}&subcategory=${sub.id}`}>
                    <div className="aspect-[3/4] overflow-hidden bg-[#E5E0D8]">
                      <img
                        src={sub.cover_image || '/assets/photo-week-2.jpg'}
                        alt={sub.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display text-xl text-white tracking-[0.08em] mb-2">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm font-body tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Shop Now <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 md:hidden text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-body text-sm tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#B8985E] transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
