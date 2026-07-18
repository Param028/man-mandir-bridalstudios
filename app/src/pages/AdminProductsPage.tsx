import { useState, useRef } from 'react'
import { Plus, Edit3, Trash2, UploadCloud, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useProducts, useDeleteProduct, uploadFile } from '@/lib/api'

const categories = [
  { id: 'lehenga', label: 'Bridal Lehengas' },
  { id: 'saree', label: 'Sarees' },
  { id: 'cocktail', label: 'Gowns' },
  { id: 'indo-western', label: 'Reception Wear' },
]

export default function AdminProductsPage() {
  const { data: allProducts = [], isLoading, refetch } = useProducts()
  const deleteProductMutation = useDeleteProduct()

  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('lehenga')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('10')
  const [formSizes, setFormSizes] = useState<string[]>([])

  // Image state
  const [primaryFile, setPrimaryFile] = useState<File | null>(null)
  const [primaryPreview, setPrimaryPreview] = useState<string>('')
  const [hoverFile, setHoverFile] = useState<File | null>(null)
  const [hoverPreview, setHoverPreview] = useState<string>('')

  const [saving, setSaving] = useState(false)
  const primaryInputRef = useRef<HTMLInputElement>(null)
  const hoverInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormName('')
    setFormCategory('lehenga')
    setFormDesc('')
    setFormPrice('')
    setFormStock('10')
    setFormSizes([])
    setPrimaryFile(null)
    setPrimaryPreview('')
    setHoverFile(null)
    setHoverPreview('')
    setEditProduct(null)
  }

  const openAdd = (category?: string) => {
    resetForm()
    if (category) setFormCategory(category)
    setShowModal(true)
  }

  const openEdit = (product: any) => {
    resetForm()
    setEditProduct(product)
    setFormName(product.name || '')
    setFormCategory(product.category || 'lehenga')
    setFormDesc(product.description || '')
    setFormPrice(String(product.price || ''))
    setFormStock(String(product.stockQuantity || '10'))
    // Restore sizes — schema stores plain strings e.g. ['S','M','L']
    const existingSizes: string[] = (product.sizes || []).map((s: any) =>
      typeof s === 'string' ? s : String(s.size || s)
    )
    setFormSizes(existingSizes)
    // Show existing images as previews
    if (product.primaryImage) setPrimaryPreview(product.primaryImage)
    else if (product.images?.[0]?.url) setPrimaryPreview(product.images[0].url)
    if (product.images?.[1]?.url) setHoverPreview(product.images[1].url)
    setShowModal(true)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'primary' | 'hover'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (type === 'primary') {
      setPrimaryFile(file)
      setPrimaryPreview(preview)
    } else {
      setHoverFile(file)
      setHoverPreview(preview)
    }
  }

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Product name is required')
    if (!formPrice || isNaN(Number(formPrice))) return toast.error('Valid price is required')
    if (!editProduct && !primaryFile) return toast.error('Primary image is required')

    setSaving(true)
    try {
      let primaryImageUrl = editProduct?.images?.[0]?.url;
      let hoverImageUrl = editProduct?.images?.[1]?.url;

      if (primaryFile) {
        primaryImageUrl = await uploadFile('gallery', primaryFile); // Using a generic 'gallery' bucket for now
      }
      if (hoverFile) {
        hoverImageUrl = await uploadFile('gallery', hoverFile);
      }

      const images = [];
      if (primaryImageUrl) images.push({ url: primaryImageUrl, isCover: true });
      if (hoverImageUrl) images.push({ url: hoverImageUrl, isCover: false });

      const productData = {
        name: formName,
        category: formCategory,
        description: formDesc.trim(),
        price: Number(formPrice),
        stock_quantity: Number(formStock),
        sku: editProduct?.sku || `SKU-${Date.now()}`,
        product_code: editProduct?.product_code || editProduct?.productCode || `PC-${Date.now()}`,
        gst: 0,
        status: 'Active',
        sizes: formSizes,
        images: images
      };

      if (editProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editProduct._id || editProduct.id);
        if (error) throw error;
        toast.success('Product updated!')
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success('Product created!')
      }
      refetch()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string | number) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    deleteProductMutation.mutate(id as string, {
      onSuccess: () => toast.success('Product deleted'),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#C9A96E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-[#6B6560]">Manage products displayed in the category showcase section</p>

      <Tabs defaultValue="lehenga" className="w-full">
        <TabsList className="bg-white border border-[#E5E0D8] rounded mb-6">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="font-body text-sm data-[state=active]:text-[#C9A96E] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A96E] data-[state=active]:bg-transparent px-5 py-2.5"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const catProducts = allProducts.filter((p: any) => p.category === cat.id)
          return (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Add Product Card */}
                <button
                  onClick={() => openAdd(cat.id)}
                  className="border border-dashed border-[#E5E0D8] rounded p-6 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.03)] transition-all"
                >
                  <Plus size={24} className="text-[#9B9590]" />
                  <span className="font-body text-sm text-[#6B6560]">Add Product</span>
                </button>

                <AnimatePresence>
                  {catProducts.map((product: any, i: number) => {
                    const imgSrc = product.primaryImage || product.images?.[0]?.url || ''
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-[#E5E0D8] rounded shadow-card overflow-hidden"
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-[#F8F5F0]">
                          {imgSrc ? (
                            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#D0C9C0]">
                              <UploadCloud size={32} />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-body text-sm font-medium text-[#2C2C2C] truncate">{product.name}</p>
                          <span className="inline-block mt-1.5 font-body text-[11px] px-2.5 py-0.5 rounded-full bg-[rgba(201,169,110,0.12)] text-[#C9A96E]">
                            {product.category}
                          </span>
                          {product.price && (
                            <p className="font-body text-xs text-[#6B6560] mt-1">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F5F0E8]">
                            <button
                              onClick={() => openEdit(product)}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F8F5F0] text-[#6B6560] hover:text-[#C9A96E] transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(196,112,90,0.08)] text-[#6B6560] hover:text-[#C4705A] transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) { setShowModal(false); resetForm() } else setShowModal(true) }}>
        <DialogContent className="max-w-lg bg-white border-[#E5E0D8] max-h-[90vh] overflow-y-auto">
          <h3 className="font-display text-xl text-[#2C2C2C] mb-4">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Product Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] transition-colors"
                placeholder="e.g., Royal Red Zardozi Lehenga"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Category *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] transition-colors"
                  placeholder="85000"
                />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Stock Qty</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] transition-colors"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Description <span className="normal-case tracking-normal text-[#9B9590]">(optional)</span></label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] resize-y transition-colors"
                placeholder="Brief product description"
              />
            </div>

            {/* Sizes Available */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">
                Sizes Available
              </label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((size) => {
                  const selected = formSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setFormSizes((prev) =>
                          prev.includes(size)
                            ? prev.filter((s) => s !== size)
                            : [...prev, size]
                        )
                      }
                      className={`px-3 py-1.5 rounded border font-body text-xs tracking-wide transition-all duration-150 ${
                        selected
                          ? 'bg-[#C9A96E] border-[#C9A96E] text-white'
                          : 'bg-white border-[#D0C9C0] text-[#6B6560] hover:border-[#C9A96E] hover:text-[#C9A96E]'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {formSizes.length > 0 && (
                <p className="font-body text-[11px] text-[#9B9590] mt-2">
                  Selected: {formSizes.join(', ')}
                </p>
              )}
            </div>

            {/* Primary Image */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">
                Primary Image {!editProduct && '*'}
              </label>
              <input
                ref={primaryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, 'primary')}
                className="hidden"
              />
              <div
                onClick={() => primaryInputRef.current?.click()}
                className="border border-dashed border-[#E5E0D8] rounded overflow-hidden hover:border-[#C9A96E] transition-colors cursor-pointer"
              >
                {primaryPreview ? (
                  <div className="relative">
                    <img src={primaryPreview} alt="Primary" className="w-full h-40 object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrimaryFile(null); setPrimaryPreview('') }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1.5 text-center">
                      <p className="font-body text-[11px] text-white">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <UploadCloud size={24} className="text-[#9B9590] mx-auto mb-2" />
                    <p className="font-body text-xs text-[#9B9590]">Click to upload primary image</p>
                    <p className="font-body text-[11px] text-[#C0BAB4] mt-1">JPG, PNG, WebP · Max 20MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Image */}
            <div>
              <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Hover Image (optional)</label>
              <input
                ref={hoverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, 'hover')}
                className="hidden"
              />
              <div
                onClick={() => hoverInputRef.current?.click()}
                className="border border-dashed border-[#E5E0D8] rounded overflow-hidden hover:border-[#C9A96E] transition-colors cursor-pointer"
              >
                {hoverPreview ? (
                  <div className="relative">
                    <img src={hoverPreview} alt="Hover" className="w-full h-40 object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setHoverFile(null); setHoverPreview('') }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1.5 text-center">
                      <p className="font-body text-[11px] text-white">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <UploadCloud size={24} className="text-[#9B9590] mx-auto mb-2" />
                    <p className="font-body text-xs text-[#9B9590]">Click to upload hover image</p>
                    <p className="font-body text-[11px] text-[#C0BAB4] mt-1">Shown on product card hover</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="px-4 py-2 border border-[#E5E0D8] rounded font-body text-xs text-[#2C2C2C] hover:bg-[#F8F5F0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#C9A96E] text-white rounded font-body text-xs hover:bg-[#B8985E] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
