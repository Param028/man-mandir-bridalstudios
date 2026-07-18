import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate('/admin/dashboard')
      } else {
        setError('Invalid credentials. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="font-display text-3xl text-white tracking-[0.08em]">
            ManMandir
          </Link>
          <span className="block font-body text-[8px] tracking-[0.2em] uppercase text-[#A0A0A0] mt-[-2px]">
            Bridal Studio
          </span>
        </div>

        <h2 className="font-display text-3xl text-white tracking-[0.08em] text-center mb-2">
          Admin Portal
        </h2>
        <p className="font-body text-sm text-[#A0A0A0] text-center mb-10">
          Sign in to manage your studio
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username (Email) */}
          <div>
            <label className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] block mb-2">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9590]" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@manmandir.com"
                className="w-full bg-white/5 border border-white/15 rounded px-4 py-3.5 pl-11 text-white font-body text-[15px] placeholder:text-[#A0A0A0] outline-none transition-colors duration-200 focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] block mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9590]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/15 rounded px-4 py-3.5 pl-11 pr-11 text-white font-body text-[15px] placeholder:text-[#A0A0A0] outline-none transition-colors duration-200 focus:border-[#C9A96E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9590] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 bg-[rgba(196,112,90,0.1)] border border-[#C4705A] rounded px-4 py-3"
            >
              <AlertCircle size={16} className="text-[#C4705A] mt-0.5 flex-shrink-0" />
              <p className="font-body text-sm text-[#C4705A]">{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#C9A96E] text-white font-body text-[13px] tracking-[0.15em] uppercase rounded hover:bg-[#B8985E] transition-colors duration-300 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>

        <p className="text-center mt-8 font-body text-xs text-[#9B9590]">
          Default credentials: admin@manmandir.com / password123
        </p>
      </motion.div>
    </div>
  )
}


