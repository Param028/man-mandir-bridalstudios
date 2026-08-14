import { useState, useRef } from 'react'
import { Plus, Edit3, Trash2, UploadCloud, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useProducts, useDeleteProduct, uploadFile, useCategories, useSubcategories } from '@/lib/api'

export default function AdminProductsPage() {
  const { data: allProducts = [], isLoading: loadingProducts, refetch } = useProducts()
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: allSubcategories = [], isLoading: loadingSubcategories } = useSubcategories()
  const deleteProductMutation = useDeleteProduct()

  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [formName, setFormName] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formSubcategoryId, setFormSubcategoryId] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('10')
  const [formSizes, setFormSizes] = useState<string[]>([])
  const [formIsTrending, setFormIsTrending] = useState(false)

  // Image state
  const [images, setImages] = useState<{ file?: File; preview: string; isExisting?: boolean }[]>([])

  const [saving, setSaving] = useState(false)
  const primaryInputRef = useRef<HTMLInputElement>(null)

  const isLoading = loadingProducts || loadingCategories || loadingSubcategories

  const availableSubcategories = formCategoryId 
    ? allSubcategories.filter((s: any) => s.category_id === formCategoryId)
    : []

  const resetForm = () => {
    setFormName('')
    setFormCategoryId('')
    setFormSubcategoryId('')
    setFormDesc('')
    setFormPrice('')
    setFormStock('10')
    setFormSizes([])
    setFormIsTrending(false)
    setImages([])
    setEditProduct(null)
  }

  const openAdd = (categoryId?: string) => {
    resetForm()
    if (categoryId) setFormCategoryId(categoryId)
    else if (categories.length > 0) setFormCategoryId(categories[0].id)
    setShowModal(true)
  }

  const openEdit = (product: any) => {
    resetForm()
    setEditProduct(product)
    setFormName(product.title || product.name || '')
    setFormCategoryId(product.category_id || '')
    setFormSubcategoryId(product.subcategory_id || '')
    setFormDesc(product.description || '')
    setFormPrice(String(product.price || ''))
    setFormIsTrending(product.is_trending || false)
    const existingSizes: string[] = (product.size || product.sizes || []).map((s: any) =>
      typeof s === 'string' ? s : String(s.size || s)
    )
    const stockSize = existingSizes.find((s: string) => s.startsWith('STOCK:'))
    if (stockSize) {
      setFormStock(stockSize.split(':')[1])
    } else {
      setFormStock(product.is_available ? '10' : '0')
    }
    setFormSizes(existingSizes.filter((s: string) => !s.startsWith('STOCK:')))
    
    let existingImages: string[] = [];
    if (product.images && product.images.length > 0) {
      existingImages = product.images.map((img: any) => typeof img === 'string' ? img : img.url);
    } else if (product.image_url) {
      existingImages = [product.image_url];
    } else if (product.primaryImage) {
      existingImages = [product.primaryImage];
    }
    setImages(existingImages.map(url => ({ preview: url, isExisting: true })));
    
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newImages = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      isExisting: false
    }))
    setImages(prev => [...prev, ...newImages])
    // clear input value so the same file can be selected again
    if (e.target) e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Product name is required')
    if (!formPrice || isNaN(Number(formPrice))) return toast.error('Valid price is required')
    if (!formCategoryId) return toast.error('Category is required')
    if (!editProduct && images.length === 0) return toast.error('At least one image is required')

    setSaving(true)
    try {
      const uploadedImageUrls: string[] = [];

      for (const img of images) {
        if (img.isExisting) {
          uploadedImageUrls.push(img.preview);
        } else if (img.file) {
          try {
            const url = await uploadFile('products', img.file);
            uploadedImageUrls.push(url);
          } catch (uploadErr: any) {
            console.error('Image upload failed:', uploadErr);
            toast.error(`Image upload failed. Using placeholder URL.`);
          }
        }
      }

      const primaryImageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : '/assets/photo-week-1.jpg';

      const categoryObj = categories.find((c: any) => c.id === formCategoryId)
      const categorySlug = categoryObj ? categoryObj.slug : formCategoryId

      const sizePayload = [...formSizes]
      if (formStock) {
        sizePayload.push(`STOCK:${formStock}`)
      }

      const productData = {
        title: formName,
        category: categorySlug, // Fallback string for legacy components
        category_id: formCategoryId,
        subcategory_id: formSubcategoryId || null,
        description: formDesc.trim(),
        price: Number(formPrice),
        is_trending: formIsTrending,
        material: '',
        color: '',
        size: sizePayload,
        occasion: [],
        fabric: '',
        designer: '',
        image_url: primaryImageUrl,
        images: uploadedImageUrls,
        is_available: Number(formStock) > 0
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
      console.error('Save error:', err);
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

  const firstCategoryId = categories.length > 0 ? categories[0].id : 'all'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#2C2C2C]">Products</h1>
          <p className="font-body text-sm text-[#6B6560]">Manage products displayed in the category showcase section</p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 bg-[#2C2C2C] text-white px-5 py-2.5 hover:bg-[#C9A96E] transition-colors font-body text-sm tracking-[0.1em] uppercase whitespace-nowrap"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <Tabs defaultValue={firstCategoryId} className="w-full">
        <TabsList className="bg-white border border-[#E5E0D8] rounded mb-6 flex-wrap h-auto p-1">
          <TabsTrigger
            value="all"
            className="font-body text-sm data-[state=active]:text-[#C9A96E] data-[state=active]:bg-[#F5F0E8] rounded px-4 py-2 flex-1 md:flex-none"
          >
            All Products
          </TabsTrigger>
          {categories.map((cat: any) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="font-body text-sm data-[state=active]:text-[#C9A96E] data-[state=active]:bg-[#F5F0E8] rounded px-4 py-2 flex-1 md:flex-none"
            >
              {cat.name}
            </TabsTrigger>
          ))}
          {categories.length === 0 && (
             <div className="p-4 text-sm text-gray-500">Please create a category first in the Categories tab.</div>
          )}
        </TabsList>

        {/* All Products Tab */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <button
              onClick={() => openAdd()}
              className="border border-dashed border-[#E5E0D8] rounded p-6 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.03)] transition-all"
            >
              <Plus size={24} className="text-[#9B9590]" />
              <span className="font-body text-sm text-[#6B6560]">Add Product</span>
            </button>

            <AnimatePresence>
              {allProducts.map((product: any, i: number) => {
                const imgSrc = product.primaryImage || product.images?.[0]?.url || product.image_url || ''
                const subcat = allSubcategories.find((s: any) => s.id === product.subcategory_id)
                const cat = categories.find((c: any) => c.id === product.category_id) || { name: product.category || 'Uncategorized' }
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-[#E5E0D8] rounded shadow-card overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#F8F5F0] relative">
                      {imgSrc ? (
                        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D0C9C0]">
                          <UploadCloud size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="font-body text-sm font-medium text-[#2C2C2C] truncate">{product.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="inline-block font-body text-[10px] px-2 py-0.5 rounded-sm bg-[#F5F0E8] text-[#6B6560]">
                          {cat.name}
                        </span>
                        {subcat && (
                          <span className="inline-block font-body text-[10px] px-2 py-0.5 rounded-sm bg-[rgba(201,169,110,0.12)] text-[#C9A96E]">
                            {subcat.name}
                          </span>
                        )}
                      </div>
                      {product.price && (
                        <p className="font-body text-xs text-[#6B6560] mt-auto pt-2">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F5F0E8]">
                        <button
                          onClick={() => openEdit(product)}
                          className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded hover:bg-[#F8F5F0] text-[#6B6560] hover:text-[#C9A96E] transition-colors text-xs"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <div className="w-px h-4 bg-[#E5E0D8]" />
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded hover:bg-[rgba(196,112,90,0.08)] text-[#6B6560] hover:text-[#C4705A] transition-colors text-xs"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {categories.map((cat: any) => {
          const catProducts = allProducts.filter((p: any) => 
            p.category_id === cat.id || 
            (!p.category_id && p.category && cat.slug && p.category.toLowerCase() === cat.slug.toLowerCase()) ||
            (!p.category_id && p.category && cat.name && p.category.toLowerCase() === cat.name.toLowerCase())
          )
          
          return (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <button
                  onClick={() => openAdd(cat.id)}
                  className="border border-dashed border-[#E5E0D8] rounded p-6 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.03)] transition-all"
                >
                  <Plus size={24} className="text-[#9B9590]" />
                  <span className="font-body text-sm text-[#6B6560]">Add Product</span>
                </button>

                <AnimatePresence>
                  {catProducts.map((product: any, i: number) => {
                    const imgSrc = product.primaryImage || product.images?.[0]?.url || product.image_url || ''
                    const subcat = allSubcategories.find((s: any) => s.id === product.subcategory_id)
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-[#E5E0D8] rounded shadow-card overflow-hidden flex flex-col"
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-[#F8F5F0] relative">
                          {imgSrc ? (
                            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#D0C9C0]">
                              <UploadCloud size={32} />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <p className="font-body text-sm font-medium text-[#2C2C2C] truncate">{product.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="inline-block font-body text-[10px] px-2 py-0.5 rounded-sm bg-[#F5F0E8] text-[#6B6560]">
                              {cat.name}
                            </span>
                            {subcat && (
                              <span className="inline-block font-body text-[10px] px-2 py-0.5 rounded-sm bg-[rgba(201,169,110,0.12)] text-[#C9A96E]">
                                {subcat.name}
                              </span>
                            )}
                          </div>
                          {product.price && (
                            <p className="font-body text-xs text-[#6B6560] mt-auto pt-2">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F5F0E8]">
                            <button
                              onClick={() => openEdit(product)}
                              className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded hover:bg-[#F8F5F0] text-[#6B6560] hover:text-[#C9A96E] transition-colors text-xs"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <div className="w-px h-4 bg-[#E5E0D8]" />
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded hover:bg-[rgba(196,112,90,0.08)] text-[#6B6560] hover:text-[#C4705A] transition-colors text-xs"
                            >
                              <Trash2 size={14} /> Delete
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
        <DialogContent className="max-w-xl bg-white border-[#E5E0D8] max-h-[90vh] overflow-y-auto rounded-none p-0">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-[#2C2C2C]">
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm() }} className="text-[#6B6560] hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Product Images */}
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">
                  Product Images {!editProduct && '*'}
                </label>
                <input
                  ref={primaryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square border border-[#E5E0D8] rounded overflow-hidden group">
                      <img src={img.preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] uppercase tracking-wider text-center py-1">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div
                    onClick={() => primaryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-[#E5E0D8] rounded bg-[#F9F8F6] hover:border-[#C9A96E] transition-colors cursor-pointer flex flex-col items-center justify-center p-4 text-center"
                  >
                    <UploadCloud size={24} className="text-[#C9A96E] mb-2" />
                    <p className="font-body text-xs text-[#2C2C2C]">Add Image</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border-b border-[#E5E0D8] py-2 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] transition-colors"
                  placeholder="e.g., Royal Red Zardozi Lehenga"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => { setFormCategoryId(e.target.value); setFormSubcategoryId('') }}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] transition-colors"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Subcategory</label>
                  <select
                    value={formSubcategoryId}
                    onChange={(e) => setFormSubcategoryId(e.target.value)}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] transition-colors"
                    disabled={!formCategoryId || availableSubcategories.length === 0}
                  >
                    <option value="">None</option>
                    {availableSubcategories.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] transition-colors"
                    placeholder="85000"
                  />
                </div>
                <div>
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Stock Qty</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] transition-colors"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Trending */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsTrending}
                    onChange={(e) => setFormIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E0D8] text-[#C9A96E] focus:ring-[#C9A96E]"
                  />
                  <span className="font-body text-sm text-[#2C2C2C]">Show in Trending Styles section</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Description <span className="normal-case tracking-normal text-[#9B9590]">(optional)</span></label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-[#E5E0D8] p-3 bg-transparent outline-none focus:border-[#C9A96E] font-body text-sm text-[#2C2C2C] resize-y transition-colors"
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
                        className={`px-4 py-2 font-body text-xs tracking-wide transition-colors ${
                          selected
                            ? 'bg-[#2C2C2C] text-white'
                            : 'bg-[#F9F8F6] text-[#6B6560] hover:bg-[#F5F0E8]'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#E5E0D8]">
                <button
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="px-6 py-2.5 font-body text-sm tracking-[0.1em] uppercase text-[#6B6560] hover:text-[#2C2C2C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#2C2C2C] text-white px-8 py-2.5 hover:bg-[#C9A96E] transition-colors font-body text-sm tracking-[0.1em] uppercase disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
