import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Flag, Star, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePublicSiteSettings } from '@/lib/siteSettings'

type ReviewTargetType = 'product' | 'gallery' | 'general'

type PublicReview = {
  id: string
  target_type: ReviewTargetType
  target_id: string | null
  name: string
  city: string | null
  rating: number
  comment: string
  photo_url: string | null
  admin_reply: string | null
  replied_at: string | null
  is_featured: boolean
  created_at: string
}

type CustomerReviewsProps = {
  targetType: ReviewTargetType
  targetId?: string
  targetLabel?: string
  featuredOnly?: boolean
}

const consentText = 'I agree that my name, city, comment and optional photo can be shown publicly'
const fieldClass = 'w-full rounded-sm border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#8C7045]'
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function containsLink(value: string) {
  return /(?:https?:\/\/|ftp:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?|\[[^\]]+\]\([^)]+\)/i.test(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

async function resizePhoto(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Photo must be 5 MB or smaller.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This photo could not be processed.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
  if (!blob) throw new Error('This photo could not be processed.')
  if (blob.size > MAX_PHOTO_BYTES) throw new Error('Compressed photo is still too large.')
  return blob
}

export default function CustomerReviews({ targetType, targetId, targetLabel, featuredOnly = false }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'approved' | 'pending'>('pending')
  const [reportingId, setReportingId] = useState('')
  const [reportedIds, setReportedIds] = useState<string[]>([])
  const firstInteractionAt = useRef<number | null>(null)
  const photoInputId = useRef(`review-photo-${Math.random().toString(36).slice(2)}`)
  const { data: siteSettings } = usePublicSiteSettings()
  const autoPublish = siteSettings?.reviews_auto_publish === true

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      let query = supabase
        .from('public_reviews')
        .select('id,target_type,target_id,name,city,rating,comment,photo_url,admin_reply,replied_at,is_featured,created_at')
        .eq('target_type', targetType)
        .order('created_at', { ascending: false })

      if (targetId) query = query.eq('target_id', targetId)
      if (featuredOnly) query = query.eq('is_featured', true)

      const { data, error } = await query
      if (error) throw error
      setReviews((data ?? []) as PublicReview[])
    } catch (error) {
      console.error('Failed to load customer reviews:', error)
      setLoadError('Reviews are temporarily unavailable. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [featuredOnly, targetId, targetType])

  useEffect(() => { void fetchReviews() }, [fetchReviews])

  useEffect(() => () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const handlePhoto = async (file?: File) => {
    if (!file) return
    setFormError('')
    setUploadingPhoto(true)
    const preview = URL.createObjectURL(file)
    try {
      const resized = await resizePhoto(file)
      const contentType = resized.type || 'image/webp'
      const { data: signed, error: signError } = await supabase.functions.invoke('create-review-photo-upload', {
        body: { contentType, fileSize: resized.size },
      })
      if (signError || !signed?.path || !signed?.token || !signed?.publicUrl) throw signError || new Error('Photo upload is temporarily unavailable.')
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .uploadToSignedUrl(signed.path, signed.token, resized, { contentType, upsert: false })
      if (uploadError) throw uploadError
      setPhotoUrl(signed.publicUrl)
      setPhotoPreview(preview)
    } catch (error) {
      URL.revokeObjectURL(preview)
      setFormError(error instanceof Error ? error.message : 'The photo could not be uploaded.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (honeypot.trim()) return
    if (firstInteractionAt.current === null || Date.now() - firstInteractionAt.current < 3000) {
      setFormError('Please take a moment to complete the form before submitting.')
      return
    }

    const cleanName = name.trim()
    const cleanComment = comment.trim()
    const cleanCity = city.trim()
    const cleanEmail = email.trim()
    if (cleanName.length < 2 || cleanName.length > 40) return setFormError('Name must be between 2 and 40 characters.')
    if (cleanComment.length < 10 || cleanComment.length > 600) return setFormError('Comment must be between 10 and 600 characters.')
    if (rating < 1 || rating > 5) return setFormError('Please choose a rating from 1 to 5 stars.')
    if (containsLink(cleanComment)) return setFormError('Please remove links from your comment.')
    if (!consent) return setFormError('Please provide consent before submitting your review.')
    if (uploadingPhoto) return setFormError('Please wait for your photo upload to finish.')

    setSubmitting(true)
    try {
      const { data, error } = await supabase.functions.invoke('submit-review', {
        body: {
          target_type: targetType,
          ...(targetId ? { target_id: targetId } : {}),
          name: cleanName,
          city: cleanCity || null,
          email: cleanEmail || null,
          rating,
          comment: cleanComment,
          photo_url: photoUrl || null,
          consent: true,
          honeypot,
          elapsedMs: firstInteractionAt.current ? Date.now() - firstInteractionAt.current : 0,
        },
      })
      if (error) throw error
      setSubmissionStatus(data?.status === 'approved' ? 'approved' : 'pending')
      setSubmitted(true)
      setName('')
      setCity('')
      setEmail('')
      setRating(0)
      setComment('')
      setConsent(false)
      setHoneypot('')
      setPhotoUrl('')
      setPhotoPreview('')
      firstInteractionAt.current = null
    } catch (error) {
      console.error('Failed to submit customer review:', error)
      setFormError('We could not submit your review. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReport = async (reviewId: string) => {
    if (!window.confirm('Report this review for moderation?')) return
    setReportingId(reviewId)
    try {
      const { error } = await supabase.functions.invoke('report-review', { body: { review_id: reviewId } })
      if (error) throw error
      setReportedIds((ids) => [...ids, reviewId])
    } catch (error) {
      console.error('Unable to report review:', error)
      setLoadError('The report could not be sent right now. Please try again later.')
    } finally {
      setReportingId('')
    }
  }

  if (featuredOnly && (loading || reviews.length === 0)) return null
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0
  const schema = targetType === 'product' && targetLabel && reviews.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: targetLabel,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: averageRating.toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.name },
      datePublished: review.created_at,
      reviewBody: review.comment,
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    })),
  } : null

  return (
    <section className="bg-[#F8F5F0] px-4 py-14 md:px-8 md:py-20" aria-label="Customer reviews">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-2 font-body text-xs uppercase tracking-[0.15em] text-[#8C7045]">Customer feedback</p>
          <h2 className="font-display text-3xl font-light tracking-wide text-[#2C2C2C] md:text-4xl">Customer Reviews</h2>
          <div className="mx-auto mt-4 h-px w-12 bg-[#8C7045]" />
          {!loading && reviews.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2 font-body text-sm text-[#514B46]" aria-label={`${averageRating.toFixed(1)} out of 5 from ${reviews.length} reviews`}>
              <Star size={15} className="fill-[#8C7045] text-[#8C7045]" aria-hidden="true" />
              <span className="font-medium text-[#2C2C2C]">{averageRating.toFixed(1)}</span><span>·</span>
              <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>

        {loadError && <p role="status" className="mb-6 rounded border border-[#E5E0D8] bg-white p-4 text-center font-body text-sm text-[#514B46]">{loadError}</p>}
        {loading ? <p className="py-6 text-center font-body text-sm text-[#514B46]">Loading reviews…</p> : reviews.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-[#514B46]">No approved reviews yet. You can share your experience below.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="border border-[#E5E0D8] bg-white p-5 md:p-6">
                <div className="mb-3 flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} aria-hidden="true" className={star <= review.rating ? 'fill-[#8C7045] text-[#8C7045]' : 'text-[#D0C9C0]'} />)}
                </div>
                <p className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-[#514B46]">{review.comment}</p>
                {review.photo_url && <img src={review.photo_url} alt="Customer-submitted review" loading="lazy" className="mt-4 max-h-80 w-full object-contain bg-[#F5F0E8]" />}
                <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-[#F5F0E8] pt-4">
                  <p className="font-display text-base text-[#2C2C2C]">{review.name}{review.city ? <span className="font-body text-xs text-[#514B46]"> · {review.city}</span> : null}</p>
                  <time className="shrink-0 font-body text-xs text-[#514B46]" dateTime={review.created_at}>{formatDate(review.created_at)}</time>
                </div>
                {review.admin_reply && (
                  <div className="mt-4 border-l-2 border-[#8C7045] bg-[#F8F5F0] px-4 py-3">
                    <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wide text-[#6B4F1D]">Response from ManMandir</p>
                    <p className="whitespace-pre-wrap break-words font-body text-sm text-[#514B46]">{review.admin_reply}</p>
                  </div>
                )}
                {!reportedIds.includes(review.id) && <button type="button" disabled={reportingId === review.id} onClick={() => void handleReport(review.id)} className="mt-4 inline-flex items-center gap-1.5 font-body text-xs text-[#514B46] underline underline-offset-2 hover:text-[#2C2C2C] disabled:opacity-60"><Flag size={13} aria-hidden="true" />{reportingId === review.id ? 'Sending report…' : 'Report review'}</button>}
                {reportedIds.includes(review.id) && <p role="status" className="mt-4 font-body text-xs text-[#514B46]">Report received. Thank you.</p>}
              </article>
            ))}
          </div>
        )}

        {!featuredOnly && (
          <div className="mx-auto mt-12 max-w-2xl border border-[#E5E0D8] bg-white p-5 md:p-8">
            <h3 className="mb-2 font-display text-2xl font-light text-[#2C2C2C]">Share your experience</h3>
            <p className="mb-6 font-body text-sm text-[#514B46]">{autoPublish ? 'Reviews may be published immediately, though flagged submissions are held for review.' : 'New reviews are held for moderation before they are published.'}</p>
            {submitted ? (
              <p role="status" className="border border-[#D8E4D9] bg-[#F5FAF5] p-4 font-body text-sm text-[#3F7455]">{submissionStatus === 'approved' ? 'Thank you. Your review is now published.' : 'Thank you. Your review has been submitted for moderation.'}</p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} onFocusCapture={() => { if (firstInteractionAt.current === null) firstInteractionAt.current = Date.now() }}>
                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="review-website">Leave this field empty</label>
                  <input id="review-website" name="website" type="text" autoComplete="off" tabIndex={-1} value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="font-body text-sm text-[#514B46]">Name <span className="text-[#C4705A]" aria-hidden="true">*</span><input className={`${fieldClass} mt-1`} name="name" type="text" autoComplete="name" minLength={2} maxLength={40} required value={name} onChange={(event) => setName(event.target.value)} /></label>
                  <label className="font-body text-sm text-[#514B46]">City <span className="text-xs text-[#514B46]">(optional)</span><input className={`${fieldClass} mt-1`} name="city" type="text" autoComplete="address-level2" maxLength={80} value={city} onChange={(event) => setCity(event.target.value)} /></label>
                </div>
                <label className="block font-body text-sm text-[#514B46]">Email <span className="text-xs text-[#514B46]">(optional, not shown publicly)</span><input className={`${fieldClass} mt-1`} name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <fieldset>
                  <legend className="mb-2 font-body text-sm text-[#514B46]">Your rating <span className="text-[#C4705A]" aria-hidden="true">*</span></legend>
                  <div className="flex items-center gap-1" role="radiogroup" aria-label="Choose a rating from 1 to 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`} onClick={() => setRating(star)} className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8C7045]"><Star size={24} aria-hidden="true" className={star <= rating ? 'fill-[#8C7045] text-[#8C7045]' : 'text-[#D0C9C0]'} /></button>)}
                  </div>
                </fieldset>
                <label className="block font-body text-sm text-[#514B46]">Comment <span className="text-[#C4705A]" aria-hidden="true">*</span><textarea className={`${fieldClass} mt-1 min-h-32 resize-y`} name="comment" minLength={10} maxLength={600} required value={comment} onChange={(event) => setComment(event.target.value)} aria-describedby="review-comment-count" /><span id="review-comment-count" className="mt-1 block text-right text-xs text-[#514B46]">{comment.length}/600</span></label>
                <div>
                  <label htmlFor={photoInputId.current} className="inline-flex cursor-pointer items-center gap-2 border border-[#D0C9C0] px-3 py-2 font-body text-sm text-[#514B46] hover:bg-[#F8F5F0]">
                    <Camera size={16} aria-hidden="true" /> {uploadingPhoto ? 'Uploading photo…' : 'Add a photo (optional)'}
                  </label>
                  <input id={photoInputId.current} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingPhoto} onChange={(event) => { const file = event.target.files?.[0]; void handlePhoto(file); event.currentTarget.value = '' }} />
                  {photoPreview && <div className="relative mt-3 inline-block"><img src={photoPreview} alt="Selected review photo preview" className="max-h-40 max-w-full object-contain" /><button type="button" onClick={() => { if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview); setPhotoPreview(''); setPhotoUrl('') }} aria-label="Remove selected photo" className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2C2C2C] text-white"><X size={15} /></button></div>}
                  <p className="mt-1 font-body text-xs text-[#514B46]">JPG, PNG or WebP, up to 5 MB. Images are resized before upload.</p>
                </div>
                <label className="flex items-start gap-2 font-body text-sm text-[#514B46]">
                  <input className="mt-1 accent-[#8C7045]" type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>{consentText}. Read the <a className="text-[#6B4F1D] underline underline-offset-2" href="/privacy">Privacy policy</a>.</span>
                </label>
                {formError && <p role="alert" className="font-body text-sm text-[#B14F42]">{formError}</p>}
                <button type="submit" disabled={submitting || uploadingPhoto} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#2C2C2C] px-5 py-3 font-body text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#45413C] disabled:cursor-not-allowed disabled:opacity-60">
                  {uploadingPhoto && <Upload size={14} aria-hidden="true" />}{submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
