import { useState, useRef, useEffect } from 'react'
import { UploadCloud, Trash2, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/api'

export default function AdminHeroVideoPage() {
  const [video, setVideo] = useState<{ url: string; title: string; isActive: boolean; _id?: string } | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchActiveVideo()
  }, [])

  const fetchActiveVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) throw error;
      
      const videoData = {
        ...data,
        _id: data.id, // For compatibility
        isActive: data.is_active
      }
      setVideo(videoData)
      setIsActive(data.is_active)
    } catch (error) {
      console.log('No active video found')
    }
  }

  const handleFileSelect = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      const file = e.target.files?.[0]
      if (file) {
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append('video', file)
        formData.append('title', 'Hero Video')

        try {
          // Upload file using our helper (ensure you create a bucket named 'videos')
          const fileUrl = await uploadFile('videos', file);

          const newVideo = {
            url: fileUrl,
            public_id: file.name,
            title: 'Hero Video',
            is_active: true
          };

          const { data, error } = await supabase.from('hero_videos').insert([newVideo]).select().single();
          if (error) throw error;
          
          // Deactivate other videos
          await supabase.from('hero_videos').update({ is_active: false }).neq('id', data.id);

          const videoData = {
            ...data,
            _id: data.id,
            isActive: data.is_active
          }
          setVideo(videoData)
          setIsActive(data.is_active)
          toast.success('Video uploaded successfully!')
        } catch (error: any) {
          toast.error(error.message || 'Video upload failed')
        } finally {
          setIsUploading(false)
          setUploadProgress(0)
        }
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        const { error } = await supabase.from('hero_videos').delete().eq('id', video?._id);
        if (error) throw error;
        setVideo(null)
        toast.success('Video deleted')
      } catch (error: any) {
        toast.error(error.message || 'Delete failed')
      }
    }
  }

  const handleStatusToggle = async (checked: boolean) => {
    if (!video?._id) return
    try {
      const { error } = await supabase.from('hero_videos').update({ is_active: checked }).eq('id', video._id);
      if (error) throw error;
      setIsActive(checked)
      toast.success(checked ? 'Video is now active' : 'Video deactivated')
    } catch (error: any) {
      toast.error(error.message || 'Status update failed')
    }
  }

  return (
    <div className="max-w-[800px] space-y-6">
      <p className="font-body text-sm text-[#6B6560]">
        Manage the homepage hero video. Only one video can be active at a time.
      </p>

      {video && (
        <div className="bg-white border border-[#E5E0D8] rounded p-6 shadow-card">
          <div className="relative aspect-video max-w-[640px] rounded overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <button
              onClick={() => {
                if (videoRef.current) {
                  isPlaying ? videoRef.current.pause() : videoRef.current.play()
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
            >
              {isPlaying ? (
                <Pause size={32} className="text-white/80" />
              ) : (
                <Play size={32} className="text-white/80 ml-1" />
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="font-body text-sm font-medium text-[#2C2C2C]">Hero Video — Bridal Couture 2024</p>
            <p className="font-body text-xs text-[#9B9590]">Uploaded on Dec 15, 2024 · 4.2 MB</p>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => handleStatusToggle(e.target.checked)}
                  className="w-4 h-4 accent-[#C9A96E]"
                />
                <span className="font-body text-sm text-[#2C2C2C]">Active</span>
              </label>
            </div>
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => handleFileSelect()}
                className="px-4 py-2 border border-[#E5E0D8] rounded font-body text-xs text-[#2C2C2C] hover:bg-[#F8F5F0] transition-colors"
              >
                Replace Video
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-[#C4705A] rounded font-body text-xs text-[#C4705A] hover:bg-[rgba(196,112,90,0.08)] transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={(e) => handleFileSelect(e)}
        className="hidden"
      />
      <div
        onClick={() => handleFileSelect()}
        className="bg-white border border-dashed border-[#E5E0D8] rounded p-10 text-center hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.02)] transition-all duration-200 cursor-pointer"
      >
        <UploadCloud size={40} className="text-[#9B9590] mx-auto mb-4" />
        <p className="font-body text-sm text-[#6B6560] mb-1">
          Drag and drop files here, or click to browse
        </p>
        <p className="font-body text-xs text-[#9B9590] mb-4">
          MP4 or WebM format. Maximum file size: 100MB
        </p>
        {isUploading ? (
          <div className="max-w-[200px] mx-auto">
            <div className="w-full h-1 bg-[#E5E0D8] rounded overflow-hidden">
              <div className="h-full bg-[#C9A96E] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="font-body text-xs text-[#9B9590] mt-2">{uploadProgress}%</p>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleFileSelect()
            }}
            className="px-6 py-2.5 bg-[#C9A96E] text-white font-body text-xs tracking-[0.1em] uppercase rounded hover:bg-[#B8985E] transition-colors"
          >
            Select File
          </button>
        )}
      </div>
    </div>
  )
}
