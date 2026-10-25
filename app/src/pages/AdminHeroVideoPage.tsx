import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Play, Save, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { uploadWithSignedUrl } from '@/lib/api'

type HeroVideo = {
  id: string
  url: string
  is_active: boolean | null
  created_at: string | null
  poster_url: string | null
  headline: string | null
  subtitle: string | null
  primary_label: string | null
  primary_link: string | null
  secondary_label: string | null
  secondary_link: string | null
  show_mute_button: boolean | null
}

type HeroDraft = {
  poster_url: string
  headline: string
  subtitle: string
  primary_label: string
  primary_link: string
  secondary_label: string
  secondary_link: string
  show_mute_button: boolean
}

const MAX_VIDEO_BYTES = 25 * 1024 * 1024
const WARN_VIDEO_BYTES = 8 * 1024 * 1024
const MAX_POSTER_BYTES = 5 * 1024 * 1024
const COLUMNS = 'id,url,is_active,created_at,poster_url,headline,subtitle,primary_label,primary_link,secondary_label,secondary_link,show_mute_button'
const DEFAULT_DRAFT: HeroDraft = {
  poster_url: '', headline: 'Bridal Couture', subtitle: '', primary_label: 'Explore Collection', primary_link: '/products',
  secondary_label: 'Book Appointment', secondary_link: '/book-appointment', show_mute_button: true,
}
const inputClass = 'w-full border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm text-[#2C2C2C] outline-none focus:border-[#6B4F1D]'
const labelClass = 'mb-1.5 block font-body text-xs font-semibold uppercase tracking-wide text-[#514B46]'

function toDraft(video?: HeroVideo | null): HeroDraft {
  if (!video) return { ...DEFAULT_DRAFT }
  return {
    poster_url: video.poster_url ?? '', headline: video.headline ?? '', subtitle: video.subtitle ?? '',
    primary_label: video.primary_label ?? '', primary_link: video.primary_link ?? '',
    secondary_label: video.secondary_label ?? '', secondary_link: video.secondary_link ?? '',
    show_mute_button: video.show_mute_button !== false,
  }
}

function fileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function AdminHeroVideoPage() {
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<HeroDraft>({ ...DEFAULT_DRAFT })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [videoFileName, setVideoFileName] = useState('')
  const [posterPreview, setPosterPreview] = useState('')
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const selectedVideo = useMemo(() => videos.find((video) => video.id === selectedId) ?? null, [selectedId, videos])
  const loadVideos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('hero_videos').select(COLUMNS).order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as HeroVideo[]
      setVideos(rows)
      const nextId = selectedId && rows.some((row) => row.id === selectedId) ? selectedId : rows.find((row) => row.is_active)?.id ?? rows[0]?.id ?? null
      setSelectedId(nextId)
      setDraft(toDraft(rows.find((row) => row.id === nextId)))
    } catch (error) {
      console.error('Unable to load hero video records:', error)
      toast.error('Hero video content could not be loaded. Verify admin access and apply the site-content migration.')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => { void loadVideos() }, [loadVideos])

  useEffect(() => {
    if (!draft.poster_url) { setPosterPreview(''); return }
    setPosterPreview(draft.poster_url)
  }, [draft.poster_url])

  const setDraftField = <K extends keyof HeroDraft>(key: K, value: HeroDraft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const makeActive = async (videoId: string) => {
    setSaving(true)
    try {
      const { error: deactivateError } = await supabase.from('hero_videos').update({ is_active: false }).neq('id', videoId)
      if (deactivateError) throw deactivateError
      const { error } = await supabase.from('hero_videos').update({ is_active: true }).eq('id', videoId)
      if (error) throw error
      toast.success('Hero video activated')
      await loadVideos()
    } catch (error) {
      console.error('Unable to change active hero video:', error)
      toast.error('Hero video could not be activated. Check admin permissions.')
    } finally {
      setSaving(false)
    }
  }

  const handleVideo = async (file?: File) => {
    if (!file) return
    if (!['video/mp4', 'video/webm'].includes(file.type)) { toast.error('Choose an MP4 or WebM video.'); return }
    if (file.size > MAX_VIDEO_BYTES) { toast.error(`Video exceeds the 25 MB upload limit (${fileSize(file.size)}).`); return }
    if (file.size > WARN_VIDEO_BYTES) toast.warning('This video is larger than 8 MB and may load slowly on mobile connections.')
    setVideoFileName(file.name)
    setUploadingVideo(true)
    try {
      const url = await uploadWithSignedUrl('hero-video', file)
      const payload = {
        url,
        is_active: false,
        poster_url: draft.poster_url || null,
        headline: draft.headline.trim() || 'Bridal Couture',
        subtitle: draft.subtitle.trim() || null,
        primary_label: draft.primary_label.trim() || 'Explore Collection',
        primary_link: draft.primary_link.trim() || '/products',
        secondary_label: draft.secondary_label.trim() || 'Book Appointment',
        secondary_link: draft.secondary_link.trim() || '/book-appointment',
        show_mute_button: draft.show_mute_button,
      }
      const { data, error } = await supabase.from('hero_videos').insert(payload).select(COLUMNS).single()
      if (error) throw error
      setSelectedId(data.id)
      setVideos((current) => [data as HeroVideo, ...current])
      toast.success('Video uploaded. Make it active when ready to publish.')
    } catch (error) {
      console.error('Unable to upload hero video:', error)
      toast.error(error instanceof Error ? error.message : 'Video upload failed. Verify admin access and storage configuration.')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handlePoster = async (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Choose a JPG, PNG or WebP poster image.'); return }
    if (file.size > MAX_POSTER_BYTES) { toast.error('Poster image must be 5 MB or smaller.'); return }
    setUploadingPoster(true)
    try {
      const url = await uploadWithSignedUrl('hero-video', file)
      setDraftField('poster_url', url)
      toast.success('Poster uploaded. Save hero content to publish it.')
    } catch (error) {
      console.error('Unable to upload hero poster:', error)
      toast.error(error instanceof Error ? error.message : 'Poster upload failed.')
    } finally {
      setUploadingPoster(false)
    }
  }

  const saveDraft = async () => {
    if (!selectedVideo) { toast.error('Upload a video before saving its hero settings.'); return }
    if (draft.primary_link && !(draft.primary_link.startsWith('/') && !draft.primary_link.startsWith('//')) || draft.secondary_link && !(draft.secondary_link.startsWith('/') && !draft.secondary_link.startsWith('//'))) {
      toast.error('Hero button links must be internal paths beginning with /.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('hero_videos').update({
        poster_url: draft.poster_url.trim() || null,
        headline: draft.headline.trim() || null,
        subtitle: draft.subtitle.trim() || null,
        primary_label: draft.primary_label.trim() || null,
        primary_link: draft.primary_link.trim() || null,
        secondary_label: draft.secondary_label.trim() || null,
        secondary_link: draft.secondary_link.trim() || null,
        show_mute_button: draft.show_mute_button,
      }).eq('id', selectedVideo.id)
      if (error) throw error
      toast.success('Hero content saved')
      await loadVideos()
    } catch (error) {
      console.error('Unable to save hero settings:', error)
      toast.error('Hero settings could not be saved. Verify admin access and migration status.')
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (video: HeroVideo) => {
    if (!window.confirm('Remove this hero video record? The uploaded storage file is not deleted.')) return
    try {
      const { error } = await supabase.from('hero_videos').delete().eq('id', video.id)
      if (error) throw error
      toast.success('Hero video record removed')
      if (selectedId === video.id) setSelectedId(null)
      await loadVideos()
    } catch (error) {
      console.error('Unable to remove hero video:', error)
      toast.error('Hero video could not be removed. Verify admin access.')
    }
  }

  const previewUrl = selectedVideo?.url

  if (loading) return <div className="py-20 text-center font-body text-sm text-[#514B46]">Loading hero content…</div>

  return (
    <div className="max-w-5xl space-y-7">
      <header>
        <h2 className="font-display text-2xl text-[#2C2C2C]">Homepage hero video</h2>
        <p className="mt-1 font-body text-sm text-[#514B46]">Upload MP4/WebM video and poster, edit hero copy and buttons, and manage the active video. Older uploads remain in the history list.</p>
      </header>

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-body text-base font-medium text-[#2C2C2C]">Hero copy and fallback poster</h3><span className="font-body text-xs text-[#514B46]">{selectedVideo ? (selectedVideo.is_active ? 'Editing active video' : 'Editing saved video') : 'No video record selected'}</span></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>Headline<input className={inputClass} maxLength={120} value={draft.headline} onChange={(event) => setDraftField('headline', event.target.value)} /></label>
          <label className={labelClass}>Subtitle<input className={inputClass} maxLength={180} value={draft.subtitle ?? ''} onChange={(event) => setDraftField('subtitle', event.target.value)} /></label>
          <label className={labelClass}>Primary button label<input className={inputClass} maxLength={40} value={draft.primary_label ?? ''} onChange={(event) => setDraftField('primary_label', event.target.value)} /></label>
          <label className={labelClass}>Primary button path<input className={inputClass} value={draft.primary_link ?? ''} onChange={(event) => setDraftField('primary_link', event.target.value)} /></label>
          <label className={labelClass}>Secondary button label<input className={inputClass} maxLength={40} value={draft.secondary_label ?? ''} onChange={(event) => setDraftField('secondary_label', event.target.value)} /></label>
          <label className={labelClass}>Secondary button path<input className={inputClass} value={draft.secondary_link ?? ''} onChange={(event) => setDraftField('secondary_link', event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Poster image URL<input className={inputClass} type="url" value={draft.poster_url ?? ''} onChange={(event) => setDraftField('poster_url', event.target.value)} placeholder="Optional public image URL" /></label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[#D0C9C0] px-4 font-body text-sm text-[#514B46] hover:bg-[#F8F5F0]"><UploadCloud size={16} />{uploadingPoster ? 'Uploading poster…' : 'Upload poster'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingPoster} onChange={(event) => { void handlePoster(event.target.files?.[0]); event.currentTarget.value = '' }} /></label>
          {posterPreview && <img src={posterPreview} alt="Hero poster preview" className="h-16 w-28 border border-[#E5E0D8] object-cover" />}
          <label className="inline-flex items-center gap-2 font-body text-sm text-[#514B46]"><input type="checkbox" className="accent-[#6B4F1D]" checked={draft.show_mute_button !== false} onChange={(event) => setDraftField('show_mute_button', event.target.checked)} />Show mute button on the public hero</label>
          <button type="button" onClick={() => void saveDraft()} disabled={saving || !selectedVideo} className="inline-flex min-h-11 items-center gap-2 bg-[#6B4F1D] px-4 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50"><Save size={15} />Save hero content</button>
        </div>
      </section>

      {selectedVideo && <section className="space-y-4 border border-[#E5E0D8] bg-white p-5 shadow-card md:p-6">
        <h3 className="font-body text-base font-medium text-[#2C2C2C]">Video preview</h3>
        <div className="max-w-3xl overflow-hidden bg-black"><video key={selectedVideo.id} src={previewUrl ?? undefined} poster={selectedVideo.poster_url ?? undefined} controls playsInline preload="metadata" className="aspect-video w-full object-contain" /></div>
      </section>}

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-body text-base font-medium text-[#2C2C2C]">Video library</h3><p className="mt-1 font-body text-sm text-[#514B46]">Maximum 25 MB per file. Videos above 8 MB are not recommended for mobile performance.</p></div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 bg-[#2C2C2C] px-4 font-body text-xs uppercase tracking-wide text-white hover:bg-[#514B46]">{uploadingVideo ? 'Uploading…' : <><UploadCloud size={15} />Upload video</>}<input type="file" accept="video/mp4,video/webm" className="sr-only" disabled={uploadingVideo} onChange={(event) => { void handleVideo(event.target.files?.[0]); event.currentTarget.value = '' }} /></label>
        </div>
        {videoFileName && <p className="font-body text-xs text-[#514B46]">Last selected: {videoFileName}</p>}
        {videos.length === 0 ? <div className="border border-dashed border-[#D0C9C0] py-10 text-center font-body text-sm text-[#514B46]">No hero video has been uploaded. The public hero will use an available poster or a plain cream background.</div> : <div className="divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">{videos.map((video) => <article key={video.id} className={`flex flex-wrap items-center justify-between gap-4 py-4 ${selectedId === video.id ? 'bg-[#FCFAF7]' : ''}`}>
          <button type="button" onClick={() => { setSelectedId(video.id); setDraft(toDraft(video)) }} className="flex min-w-0 items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6B4F1D]"><span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#2C2C2C] text-white">{video.poster_url ? <img src={video.poster_url} alt="" className="h-full w-full object-cover" /> : <Play size={18} />}</span><span className="min-w-0"><span className="block truncate font-body text-sm font-medium text-[#2C2C2C]">{video.headline || 'Hero video'}</span><span className="block font-body text-xs text-[#514B46]">Added {formatDate(video.created_at)}</span></span></button>
          <div className="flex items-center gap-2">{video.is_active && <span className="rounded-full bg-[#EDF6EF] px-3 py-1 font-body text-xs font-semibold text-[#3F7455]">Active</span>}{!video.is_active && <button type="button" disabled={saving} onClick={() => void makeActive(video.id)} className="min-h-9 border border-[#6B4F1D] px-3 font-body text-xs text-[#6B4F1D] disabled:opacity-50">Make active</button>}<button type="button" onClick={() => setPreviewingId(previewingId === video.id ? null : video.id)} aria-label={`${previewingId === video.id ? 'Close' : 'Open'} preview for ${video.headline || 'hero video'}`} className="flex h-9 w-9 items-center justify-center border border-[#D0C9C0] text-[#514B46]"><Play size={15} /></button><button type="button" onClick={() => void deleteRecord(video)} aria-label={`Remove ${video.headline || 'hero video'} record`} className="flex h-9 w-9 items-center justify-center border border-[#E8C9C3] text-[#A24D41]"><Trash2 size={15} /></button></div>
          {previewingId === video.id && <div className="w-full"><video src={video.url} poster={video.poster_url ?? undefined} controls playsInline preload="metadata" className="max-h-80 w-full bg-black" /></div>}
        </article>)}</div>}
        {videoFileName && uploadingVideo && <p role="status" className="inline-flex items-center gap-2 font-body text-sm text-[#514B46]"><AlertCircle size={15} />Uploading a new media file…</p>}
      </section>
    </div>
  )
}
