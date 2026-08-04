import { useState, useRef } from 'react'
import { Plus, Edit3, Trash2, UploadCloud, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useCategories, useSubcategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory, uploadFile } from '@/lib/api'

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCategories } = useCategories()
  const { data: subcategories = [], isLoading: loadingSubcategories, refetch: refetchSubcategories } = useSubcategories()

  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const createSubcategoryMutation = useCreateSubcategory()
  const updateSubcategoryMutation = useUpdateSubcategory()
  const deleteSubcategoryMutation = useDeleteSubcategory()

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState<'category' | 'subcategory'>('category')
  const [editItem, setEditItem] = useState<any>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLoading = loadingCategories || loadingSubcategories

  const resetForm = () => {
    setFormName('')
    setFormSlug('')
    setFormCategoryId('')
    setFile(null)
    setPreview('')
    setEditItem(null)
  }

  const openAdd = (type: 'category' | 'subcategory') => {
    resetForm()
    setMode(type)
    if (type === 'subcategory' && categories.length > 0) {
      setFormCategoryId(categories[0].id)
    }
    setShowModal(true)
  }

  const openEdit = (item: any, type: 'category' | 'subcategory') => {
    resetForm()
    setMode(type)
    setEditItem(item)
    setFormName(item.name)
    setFormSlug(item.slug)
    if (type === 'subcategory') setFormCategoryId(item.category_id)
    if (item.cover_image) setPreview(item.cover_image)
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    const filePreview = URL.createObjectURL(selectedFile)
    setFile(selectedFile)
    setPreview(filePreview)
  }

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Name is required')
    if (!formSlug.trim()) return toast.error('Slug is required')
    if (mode === 'subcategory' && !formCategoryId) return toast.error('Category is required')
    if (!editItem && !file) return toast.error('Cover image is required')

    setSaving(true)
    try {
      let coverImageUrl = editItem?.cover_image

      if (file) {
        try {
          coverImageUrl = await uploadFile('products', file) // Reusing products bucket for images
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr)
          toast.error('Image upload failed.')
          setSaving(false)
          return
        }
      }

      const payload = {
        name: formName,
        slug: formSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        cover_image: coverImageUrl,
        ...(mode === 'subcategory' ? { category_id: formCategoryId } : {})
      }

      if (mode === 'category') {
        if (editItem) {
          updateCategoryMutation.mutate({ id: editItem.id, categoryData: payload }, {
            onSuccess: () => { toast.success('Category updated'); closeAndRefetch() },
            onError: (err: any) => toast.error(err.message || 'Update failed')
          })
        } else {
          createCategoryMutation.mutate(payload, {
            onSuccess: () => { toast.success('Category created'); closeAndRefetch() },
            onError: (err: any) => toast.error(err.message || 'Create failed')
          })
        }
      } else {
        if (editItem) {
          updateSubcategoryMutation.mutate({ id: editItem.id, subcategoryData: payload }, {
            onSuccess: () => { toast.success('Subcategory updated'); closeAndRefetch() },
            onError: (err: any) => toast.error(err.message || 'Update failed')
          })
        } else {
          createSubcategoryMutation.mutate(payload, {
            onSuccess: () => { toast.success('Subcategory created'); closeAndRefetch() },
            onError: (err: any) => toast.error(err.message || 'Create failed')
          })
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
      setSaving(false)
    }
  }

  const closeAndRefetch = () => {
    setShowModal(false)
    setSaving(false)
    refetchCategories()
    refetchSubcategories()
  }

  const handleDelete = (id: string, type: 'category' | 'subcategory') => {
    if (!confirm(`Delete this ${type}? This cannot be undone.`)) return
    if (type === 'category') {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => { toast.success('Category deleted'); refetchCategories() },
        onError: (err: any) => toast.error(err.message || 'Delete failed')
      })
    } else {
      deleteSubcategoryMutation.mutate(id, {
        onSuccess: () => { toast.success('Subcategory deleted'); refetchSubcategories() },
        onError: (err: any) => toast.error(err.message || 'Delete failed')
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#C9A96E]" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#2C2C2C]">Categories</h1>
          <p className="font-body text-sm text-[#6B6560]">Manage categories and subcategories</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-[#E5E0D8]">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger 
              value="categories" 
              className="font-body tracking-[0.1em] uppercase text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#C9A96E] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A96E] rounded-none px-0 pb-3"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="subcategories"
              className="font-body tracking-[0.1em] uppercase text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#C9A96E] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A96E] rounded-none px-0 pb-3"
            >
              Subcategories
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="categories" className="mt-0">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => openAdd('category')}
              className="flex items-center gap-2 bg-[#2C2C2C] text-white px-5 py-2.5 hover:bg-[#C9A96E] transition-colors font-body text-sm tracking-[0.1em] uppercase"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <div key={cat.id} className="bg-white border border-[#E5E0D8] p-4 flex flex-col gap-4 group">
                <div className="aspect-[4/3] bg-[#F5F0E8] relative overflow-hidden">
                  {cat.cover_image ? (
                    <img src={cat.cover_image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B6560]">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => openEdit(cat, 'category')} className="p-2 bg-white text-[#2C2C2C] hover:bg-[#C9A96E] hover:text-white transition-colors rounded-full">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id, 'category')} className="p-2 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-lg text-[#2C2C2C]">{cat.name}</h3>
                  <p className="font-body text-xs text-[#6B6560]">/{cat.slug}</p>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#6B6560] font-body">
                No categories found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subcategories" className="mt-0">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => openAdd('subcategory')}
              className="flex items-center gap-2 bg-[#2C2C2C] text-white px-5 py-2.5 hover:bg-[#C9A96E] transition-colors font-body text-sm tracking-[0.1em] uppercase"
            >
              <Plus size={16} /> Add Subcategory
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subcategories.map((sub: any) => {
              const parentCat = categories.find((c: any) => c.id === sub.category_id)
              return (
                <div key={sub.id} className="bg-white border border-[#E5E0D8] p-4 flex flex-col gap-4 group">
                  <div className="aspect-[4/3] bg-[#F5F0E8] relative overflow-hidden">
                    {sub.cover_image ? (
                      <img src={sub.cover_image} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6560]">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(sub, 'subcategory')} className="p-2 bg-white text-[#2C2C2C] hover:bg-[#C9A96E] hover:text-white transition-colors rounded-full">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(sub.id, 'subcategory')} className="p-2 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-full">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-[#2C2C2C]">{sub.name}</h3>
                    <p className="font-body text-xs text-[#6B6560]">in {parentCat?.name || 'Unknown'}</p>
                    <p className="font-body text-xs text-[#6B6560]">/{sub.slug}</p>
                  </div>
                </div>
              )
            })}
            {subcategories.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#6B6560] font-body">
                No subcategories found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl p-0 bg-white border-none rounded-none">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-[#2C2C2C]">
                {editItem ? `Edit ${mode === 'category' ? 'Category' : 'Subcategory'}` : `Add ${mode === 'category' ? 'Category' : 'Subcategory'}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6560] hover:text-[#2C2C2C]">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Cover Image *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E0D8] bg-[#F9F8F6] hover:bg-[#F5F0E8] transition-colors aspect-video flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-body text-sm tracking-[0.1em] uppercase">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <UploadCloud size={32} className="mx-auto mb-3 text-[#C9A96E]" />
                      <p className="font-body text-sm text-[#2C2C2C]">Click to upload cover image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      if (!editItem) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                      }
                    }}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent focus:outline-none focus:border-[#C9A96E] font-body text-[#2C2C2C]"
                    placeholder={`e.g. ${mode === 'category' ? 'Bridal' : 'Lehengas'}`}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full border-b border-[#E5E0D8] py-2 bg-transparent focus:outline-none focus:border-[#C9A96E] font-body text-[#2C2C2C]"
                    placeholder="e.g. bridal-collection"
                  />
                </div>

                {mode === 'subcategory' && (
                  <div className="col-span-2">
                    <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Parent Category *</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full border-b border-[#E5E0D8] py-2 bg-transparent focus:outline-none focus:border-[#C9A96E] font-body text-[#2C2C2C]"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 font-body text-sm tracking-[0.1em] uppercase text-[#6B6560] hover:text-[#2C2C2C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#2C2C2C] text-white px-8 py-2.5 hover:bg-[#C9A96E] transition-colors font-body text-sm tracking-[0.1em] uppercase disabled:opacity-70 flex items-center gap-2"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
