import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Download, Eye, EyeOff, MessageSquare, Search, Star, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent } from '@/components/ui/dialog'

type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden'
type ReviewTargetType = 'product' | 'gallery' | 'general'

type AdminReview = {
  id: string
  target_type: ReviewTargetType
  target_id: string | null
  name: string
  city: string | null
  email: string | null
  rating: number
  comment: string
  photo_url: string | null
  status: ReviewStatus
  is_featured: boolean
  admin_reply: string | null
  replied_at: string | null
  reported_count: number
  consent: boolean
  created_at: string
}

const statuses: ReviewStatus[] = ['pending', 'approved', 'rejected', 'hidden']
const statusClasses: Record<ReviewStatus, string> = {
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#9A792C]',
  approved: 'bg-[rgba(74,140,111,0.12)] text-[#3F7455]',
  rejected: 'bg-[rgba(196,112,90,0.12)] text-[#B14F42]',
  hidden: 'bg-[rgba(139,157,195,0.16)] text-[#687CA6]',
}
const inputClass = 'rounded border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#C9A96E]'
const reviewFields = 'id,target_type,target_id,name,city,email,rating,comment,photo_url,status,is_featured,admin_reply,replied_at,reported_count,consent,created_at'

function csvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function containsLink(value: string) {
  return /(?:https?:\/\/|www\.)\S+|\[[^\]]+\]\([^)]+\)/i.test(value)
}

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all')
  const [targetFilter, setTargetFilter] = useState<'all' | ReviewTargetType>('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [photoFilter, setPhotoFilter] = useState<'all' | 'with' | 'without'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [savingReply, setSavingReply] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) {
        setReviews([])
        setLoadError('Sign in with an admin account to manage customer reviews.')
        return
      }

      const { data, error } = await supabase
        .from('review')
        .select(reviewFields)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReviews((data ?? []) as AdminReview[])
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setLoadError('Reviews could not be loaded. Check your admin access and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return reviews.filter((review) => {
      if (statusFilter !== 'all' && review.status !== statusFilter) return false
      if (targetFilter !== 'all' && review.target_type !== targetFilter) return false
      if (ratingFilter !== 'all' && review.rating !== Number(ratingFilter)) return false
      if (photoFilter === 'with' && !review.photo_url) return false
      if (photoFilter === 'without' && review.photo_url) return false
      const createdDay = review.created_at.slice(0, 10)
      if (dateFrom && createdDay < dateFrom) return false
      if (dateTo && createdDay > dateTo) return false
      if (!query) return true
      return [review.name, review.city, review.comment, review.target_id]
        .some((value) => value?.toLocaleLowerCase().includes(query))
    })
  }, [reviews, search, statusFilter, targetFilter, ratingFilter, photoFilter, dateFrom, dateTo])

  const bulkSetStatus = async (status: ReviewStatus) => {
    const ids = selectedIds.filter((id) => filteredReviews.some((review) => review.id === id))
    if (!ids.length) { toast.error('Select one or more visible reviews first.'); return }
    setBusyId('bulk')
    try {
      const { error } = await supabase.from('review').update({ status }).in('id', ids)
      if (error) throw error
      setReviews((current) => current.map((review) => ids.includes(review.id) ? { ...review, status } : review))
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)))
      toast.success(`${ids.length} review${ids.length === 1 ? '' : 's'} ${status}`)
    } catch (error) {
      console.error('Bulk review moderation failed:', error)
      toast.error('Could not update the selected reviews')
    } finally {
      setBusyId(null)
    }
  }

  const allVisibleSelected = filteredReviews.length > 0 && filteredReviews.every((review) => selectedIds.includes(review.id))
  const toggleVisibleSelection = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !filteredReviews.some((review) => review.id === id))
      : Array.from(new Set([...current, ...filteredReviews.map((review) => review.id)])))
  }

  const setReviewStatus = async (review: AdminReview, status: ReviewStatus) => {
    setBusyId(review.id)
    try {
      const { error } = await supabase.from('review').update({ status }).eq('id', review.id)
      if (error) throw error
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, status } : item))
      setSelectedReview((current) => current?.id === review.id ? { ...current, status } : current)
      toast.success(`Review ${status}`)
    } catch (error) {
      console.error('Failed to update review status:', error)
      toast.error('Could not update the review status')
    } finally {
      setBusyId(null)
    }
  }

  const toggleFeatured = async (review: AdminReview) => {
    setBusyId(review.id)
    try {
      const isFeatured = !review.is_featured
      const { error } = await supabase.from('review').update({ is_featured: isFeatured }).eq('id', review.id)
      if (error) throw error
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, is_featured: isFeatured } : item))
      setSelectedReview((current) => current?.id === review.id ? { ...current, is_featured: isFeatured } : current)
      toast.success(isFeatured ? 'Review featured' : 'Review unfeatured')
    } catch (error) {
      console.error('Failed to update featured review:', error)
      toast.error('Could not update the featured setting')
    } finally {
      setBusyId(null)
    }
  }

  const deleteReview = async (review: AdminReview) => {
    if (!window.confirm(`Permanently delete the review from ${review.name}?`)) return
    setBusyId(review.id)
    try {
      const { error } = await supabase.functions.invoke('delete-review', { body: { review_id: review.id } })
      if (error) throw error
      setReviews((current) => current.filter((item) => item.id !== review.id))
      setSelectedReview((current) => current?.id === review.id ? null : current)
      toast.success('Review deleted')
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error('Could not delete the review')
    } finally {
      setBusyId(null)
    }
  }

  const saveReply = async () => {
    if (!selectedReview) return
    const reply = replyDraft.trim()
    if (reply && containsLink(reply)) {
      toast.error('Please remove links from the public reply')
      return
    }
    setSavingReply(true)
    try {
      const replyAt = reply ? new Date().toISOString() : null
      const { error } = await supabase.from('review').update({ admin_reply: reply || null, replied_at: replyAt }).eq('id', selectedReview.id)
      if (error) throw error
      const updated = { ...selectedReview, admin_reply: reply || null, replied_at: replyAt }
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelectedReview(updated)
      toast.success(reply ? 'Public reply saved' : 'Public reply removed')
    } catch (error) {
      console.error('Failed to save review reply:', error)
      toast.error('Could not save the public reply')
    } finally {
      setSavingReply(false)
    }
  }

  const exportCsv = () => {
    const headers = ['Review ID', 'Target Type', 'Target ID', 'Name', 'City', 'Rating', 'Comment', 'Status', 'Featured', 'Reported Count', 'Created At', 'Admin Reply']
    const rows = filteredReviews.map((review) => [
      review.id, review.target_type, review.target_id, review.name, review.city, review.rating,
      review.comment, review.status, review.is_featured, review.reported_count, review.created_at, review.admin_reply,
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'customer-reviews.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const openReview = (review: AdminReview) => {
    setSelectedReview(review)
    setReplyDraft(review.admin_reply ?? '')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-light text-[#2C2C2C]">Customer Reviews</h2>
          <p className="mt-1 font-body text-sm text-[#6B6560]">Moderate submissions and manage public replies and featured reviews.</p>
        </div>
        <button type="button" onClick={() => void loadReviews()} disabled={loading} className="rounded border border-[#E5E0D8] bg-white px-3 py-2 font-body text-sm text-[#514B46] hover:bg-[#F8F5F0] disabled:opacity-50">
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" aria-hidden="true" />
          <input className={`${inputClass} w-full pl-9`} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, city or comment" aria-label="Search reviews" />
        </div>
        <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ReviewStatus)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
        </select>
        <select className={inputClass} value={targetFilter} onChange={(event) => setTargetFilter(event.target.value as 'all' | ReviewTargetType)} aria-label="Filter by review type">
          <option value="all">All types</option>
          <option value="product">Product</option>
          <option value="gallery">Gallery</option>
          <option value="general">General</option>
        </select>
        <select className={inputClass} value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} aria-label="Filter by rating">
          <option value="all">All ratings</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>)}
        </select>
        <select className={inputClass} value={photoFilter} onChange={(event) => setPhotoFilter(event.target.value as 'all' | 'with' | 'without')} aria-label="Filter by photo">
          <option value="all">All photo states</option><option value="with">With photo</option><option value="without">Without photo</option>
        </select>
        <label className="flex items-center gap-2 font-body text-xs text-[#514B46]">From<input className={inputClass} type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Reviews from date" /></label>
        <label className="flex items-center gap-2 font-body text-xs text-[#514B46]">To<input className={inputClass} type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Reviews to date" /></label>
        <button type="button" onClick={exportCsv} disabled={!filteredReviews.length} className="inline-flex items-center gap-2 rounded border border-[#E5E0D8] bg-white px-3 py-2.5 font-body text-sm text-[#514B46] hover:bg-[#F8F5F0] disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={15} aria-hidden="true" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border border-[#E5E0D8] bg-white p-3">
        <button type="button" onClick={toggleVisibleSelection} disabled={!filteredReviews.length} className="rounded border border-[#D0C9C0] px-3 py-2 font-body text-xs text-[#514B46] disabled:opacity-50">{allVisibleSelected ? 'Clear visible selection' : 'Select visible'}</button>
        <span className="mr-auto font-body text-xs text-[#514B46]">{selectedIds.filter((id) => filteredReviews.some((review) => review.id === id)).length} selected</span>
        <button type="button" disabled={busyId === 'bulk'} onClick={() => void bulkSetStatus('approved')} className="rounded bg-[#EDF6EF] px-3 py-2 font-body text-xs text-[#3F7455] disabled:opacity-50">Approve selected</button>
        <button type="button" disabled={busyId === 'bulk'} onClick={() => void bulkSetStatus('rejected')} className="rounded bg-[#FFF3F0] px-3 py-2 font-body text-xs text-[#A24D41] disabled:opacity-50">Reject selected</button>
        <button type="button" disabled={busyId === 'bulk'} onClick={() => void bulkSetStatus('hidden')} className="rounded bg-[#F1F3F8] px-3 py-2 font-body text-xs text-[#687CA6] disabled:opacity-50">Hide selected</button>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-[#E8C9C3] bg-[#FFF8F6] p-4">
          <p className="font-body text-sm text-[#9E4A3E]">{loadError}</p>
          <button type="button" onClick={() => void loadReviews()} className="font-body text-sm font-medium text-[#8C4338] underline">Try again</button>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-[#E5E0D8] bg-white shadow-card">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="bg-[#EDE6DA]">
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]"><input type="checkbox" aria-label="Select all visible reviews" checked={allVisibleSelected} onChange={toggleVisibleSelection} disabled={!filteredReviews.length} /></th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Customer / review</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Target</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Rating</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Status</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Submitted</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center font-body text-sm text-[#9B9590]">Loading reviews…</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center">
                <p className="font-body text-sm font-medium text-[#514B46]">{reviews.length ? 'No reviews match these filters.' : 'No customer reviews yet.'}</p>
                <p className="mt-1 font-body text-xs text-[#9B9590]">New submissions will appear here after they are received.</p>
              </td></tr>
            ) : filteredReviews.map((review) => (
              <tr key={review.id} className="border-t border-[#F0ECE6] align-top hover:bg-[#FCFAF7]">
                <td className="px-4 py-3.5"><input type="checkbox" aria-label={`Select review from ${review.name}`} checked={selectedIds.includes(review.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, review.id] : current.filter((id) => id !== review.id))} /></td>
                <td className="max-w-[400px] px-4 py-3.5">
                  <p className="font-body text-sm font-medium text-[#2C2C2C]">{review.name}{review.city ? <span className="font-normal text-[#8C8580]"> · {review.city}</span> : null}</p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words font-body text-sm text-[#6B6560]">{review.comment}</p>
                  {review.reported_count > 0 && <p className="mt-1 font-body text-xs text-[#B14F42]">Reported {review.reported_count} {review.reported_count === 1 ? 'time' : 'times'}</p>}
                </td>
                <td className="px-4 py-3.5 font-body text-sm capitalize text-[#514B46]">
                  <span>{review.target_type}</span>
                  {review.target_id && <span className="block max-w-32 truncate font-mono text-xs text-[#9B9590]" title={review.target_id}>{review.target_id}</span>}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 font-body text-sm text-[#514B46]"><Star size={14} className="fill-[#C9A96E] text-[#C9A96E]" aria-hidden="true" />{review.rating}/5</span>
                  {review.is_featured && <span className="mt-1 block font-body text-[11px] uppercase tracking-wide text-[#8C7045]">Featured</span>}
                </td>
                <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 font-body text-xs capitalize ${statusClasses[review.status]}`}>{review.status}</span></td>
                <td className="px-4 py-3.5 font-body text-xs text-[#6B6560]">{dateLabel(review.created_at)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button type="button" title="View details" aria-label={`View review from ${review.name}`} onClick={() => openReview(review)} className="flex h-8 w-8 items-center justify-center rounded text-[#6B6560] hover:bg-[#F8F5F0] hover:text-[#8C7045]"><Eye size={15} /></button>
                    {review.status !== 'approved' && <button type="button" title="Approve" aria-label={`Approve review from ${review.name}`} disabled={busyId === review.id} onClick={() => void setReviewStatus(review, 'approved')} className="flex h-8 w-8 items-center justify-center rounded text-[#4A8C6F] hover:bg-[#F1F8F2] disabled:opacity-40"><Check size={15} /></button>}
                    {review.status !== 'rejected' && <button type="button" title="Reject" aria-label={`Reject review from ${review.name}`} disabled={busyId === review.id} onClick={() => void setReviewStatus(review, 'rejected')} className="flex h-8 w-8 items-center justify-center rounded text-[#B14F42] hover:bg-[#FFF4F1] disabled:opacity-40"><X size={15} /></button>}
                    {review.status !== 'hidden' && <button type="button" title="Hide" aria-label={`Hide review from ${review.name}`} disabled={busyId === review.id} onClick={() => void setReviewStatus(review, 'hidden')} className="flex h-8 w-8 items-center justify-center rounded text-[#687CA6] hover:bg-[#F3F5FA] disabled:opacity-40"><EyeOff size={15} /></button>}
                    <button type="button" title={review.is_featured ? 'Remove featured status' : 'Feature review'} aria-label={review.is_featured ? 'Unfeature review' : 'Feature review'} disabled={busyId === review.id} onClick={() => void toggleFeatured(review)} className={`flex h-8 w-8 items-center justify-center rounded hover:bg-[#F8F5F0] disabled:opacity-40 ${review.is_featured ? 'text-[#C9A96E]' : 'text-[#9B9590]'}`}><Star size={15} className={review.is_featured ? 'fill-current' : ''} /></button>
                    <button type="button" title="Delete" aria-label={`Delete review from ${review.name}`} disabled={busyId === review.id} onClick={() => void deleteReview(review)} className="flex h-8 w-8 items-center justify-center rounded text-[#9B9590] hover:bg-[#FFF4F1] hover:text-[#B14F42] disabled:opacity-40"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedReview} onOpenChange={(open) => { if (!open) setSelectedReview(null) }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#E5E0D8] bg-white">
          {selectedReview && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div>
                  <h3 className="font-display text-2xl font-light text-[#2C2C2C]">Review details</h3>
                  <p className="mt-1 font-body text-xs text-[#9B9590]">Submitted {dateLabel(selectedReview.created_at)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-body text-xs capitalize ${statusClasses[selectedReview.status]}`}>{selectedReview.status}</span>
              </div>
              <dl className="grid gap-x-6 gap-y-3 border-y border-[#F0ECE6] py-4 sm:grid-cols-2">
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Name</dt><dd className="mt-1 break-words font-body text-sm text-[#2C2C2C]">{selectedReview.name}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">City</dt><dd className="mt-1 font-body text-sm text-[#2C2C2C]">{selectedReview.city || '—'}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Email</dt><dd className="mt-1 break-all font-body text-sm text-[#2C2C2C]">{selectedReview.email || '—'}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Target</dt><dd className="mt-1 break-all font-body text-sm capitalize text-[#2C2C2C]">{selectedReview.target_type}{selectedReview.target_id ? ` · ${selectedReview.target_id}` : ''}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Rating</dt><dd className="mt-1 font-body text-sm text-[#2C2C2C]">{selectedReview.rating}/5</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Consent</dt><dd className="mt-1 font-body text-sm text-[#2C2C2C]">{selectedReview.consent ? 'Provided' : 'Not recorded'}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Reports</dt><dd className="mt-1 font-body text-sm text-[#2C2C2C]">{selectedReview.reported_count}</dd></div>
                <div><dt className="font-body text-xs uppercase tracking-wide text-[#9B9590]">Featured</dt><dd className="mt-1 font-body text-sm text-[#2C2C2C]">{selectedReview.is_featured ? 'Yes' : 'No'}</dd></div>
              </dl>
              <div>
                <h4 className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-[#9B9590]">Customer comment</h4>
                <p className="whitespace-pre-wrap break-words rounded bg-[#F8F5F0] p-4 font-body text-sm leading-relaxed text-[#514B46]">{selectedReview.comment}</p>
              </div>
              {selectedReview.photo_url && <div><h4 className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-[#9B9590]">Customer photo</h4><a href={selectedReview.photo_url} target="_blank" rel="noopener noreferrer" className="inline-block"><img src={selectedReview.photo_url} alt={`Photo submitted with review from ${selectedReview.name}`} className="max-h-80 max-w-full border border-[#E5E0D8] object-contain" /></a></div>}
              <div>
                <label htmlFor="review-admin-reply" className="mb-2 flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-[#9B9590]"><MessageSquare size={14} /> Public reply</label>
                <textarea id="review-admin-reply" className={`${inputClass} min-h-24 w-full resize-y`} maxLength={600} value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Write a plain-text response for the public review" />
                <p className="mt-1 text-right font-body text-xs text-[#9B9590]">{replyDraft.length}/600</p>
                <button type="button" onClick={() => void saveReply()} disabled={savingReply || replyDraft.length > 600} className="mt-2 rounded bg-[#2C2C2C] px-4 py-2.5 font-body text-xs uppercase tracking-wide text-white hover:bg-[#45413C] disabled:cursor-not-allowed disabled:opacity-50">{savingReply ? 'Saving…' : 'Save public reply'}</button>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#F0ECE6] pt-4">
                <button type="button" disabled={busyId === selectedReview.id} onClick={() => void setReviewStatus(selectedReview, 'approved')} className="inline-flex items-center gap-2 rounded bg-[#EDF6EF] px-3 py-2 font-body text-sm text-[#3F7455] disabled:opacity-50"><Check size={15} /> Approve</button>
                <button type="button" disabled={busyId === selectedReview.id} onClick={() => void setReviewStatus(selectedReview, 'rejected')} className="inline-flex items-center gap-2 rounded bg-[#FFF3F0] px-3 py-2 font-body text-sm text-[#A24D41] disabled:opacity-50"><X size={15} /> Reject</button>
                <button type="button" disabled={busyId === selectedReview.id} onClick={() => void setReviewStatus(selectedReview, 'hidden')} className="inline-flex items-center gap-2 rounded bg-[#F1F3F8] px-3 py-2 font-body text-sm text-[#687CA6] disabled:opacity-50"><EyeOff size={15} /> Hide</button>
                <button type="button" disabled={busyId === selectedReview.id} onClick={() => void toggleFeatured(selectedReview)} className="inline-flex items-center gap-2 rounded border border-[#E5E0D8] px-3 py-2 font-body text-sm text-[#6B6560] disabled:opacity-50"><Star size={15} className={selectedReview.is_featured ? 'fill-[#C9A96E] text-[#C9A96E]' : ''} /> {selectedReview.is_featured ? 'Unfeature' : 'Feature'}</button>
                <button type="button" disabled={busyId === selectedReview.id} onClick={() => void deleteReview(selectedReview)} className="inline-flex items-center gap-2 rounded border border-[#E8C9C3] px-3 py-2 font-body text-sm text-[#A24D41] disabled:opacity-50"><Trash2 size={15} /> Delete</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
