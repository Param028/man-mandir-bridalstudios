import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError] = useState('')

  const [studioName, setStudioName] = useState('ManMandir Bridal Studio')
  const [address, setAddress] = useState('42 Fashion Street, Lajpat Nagar, New Delhi — 110024')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [email, setEmail] = useState('hello@manmandir.com')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [pinterest, setPinterest] = useState('')

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match')
      return
    }
    toast.success('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleStudioSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Studio information saved')
  }

  const PasswordField = ({ label, value, onChange, show, setShow, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    show: boolean; setShow: (v: boolean) => void; placeholder: string
  }) => (
    <div>
      <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">{label}</label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-[#D0C9C0] rounded px-4 py-3 pl-10 pr-10 font-body text-sm outline-none focus:border-[#C9A96E] bg-white"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9590] hover:text-[#6B6560]">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-[560px] space-y-6">
      {/* Change Password */}
      <div className="bg-white border border-[#E5E0D8] rounded p-6 shadow-card">
        <h2 className="font-body text-base font-medium text-[#2C2C2C] mb-5">Change Admin Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <PasswordField
            label="CURRENT PASSWORD"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            setShow={setShowCurrent}
            placeholder="Enter current password"
          />
          <PasswordField
            label="NEW PASSWORD"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            placeholder="Enter new password (min 8 characters)"
          />
          <PasswordField
            label="CONFIRM NEW PASSWORD"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            setShow={setShowConfirm}
            placeholder="Confirm new password"
          />
          {pwError && <p className="font-body text-xs text-[#C4705A]">{pwError}</p>}
          <button type="submit" className="px-6 py-2.5 bg-[#C9A96E] text-white font-body text-xs tracking-[0.1em] uppercase rounded hover:bg-[#B8985E] transition-colors">
            UPDATE PASSWORD
          </button>
        </form>
      </div>

      {/* Studio Information */}
      <div className="bg-white border border-[#E5E0D8] rounded p-6 shadow-card">
        <h2 className="font-body text-base font-medium text-[#2C2C2C] mb-5">Studio Information</h2>
        <form onSubmit={handleStudioSave} className="space-y-4">
          <div>
            <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Studio Name</label>
            <input type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white" />
          </div>
          <div>
            <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white resize-y" />
          </div>
          <div>
            <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white" />
          </div>
          <div>
            <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white" />
          </div>
          <div className="border-t border-[#F5F0E8] pt-4 mt-2">
            <p className="font-body text-xs text-[#9B9590] mb-3">Social Links (Optional)</p>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Instagram URL</label>
                <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white placeholder:text-[#9B9590]" />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Facebook URL</label>
                <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white placeholder:text-[#9B9590]" />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] block mb-2">Pinterest URL</label>
                <input type="url" value={pinterest} onChange={(e) => setPinterest(e.target.value)} placeholder="https://pinterest.com/..." className="w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#C9A96E] bg-white placeholder:text-[#9B9590]" />
              </div>
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-[#C9A96E] text-white font-body text-xs tracking-[0.1em] uppercase rounded hover:bg-[#B8985E] transition-colors">
            SAVE CHANGES
          </button>
        </form>
      </div>
    </div>
  )
}
