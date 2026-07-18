import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import type { BookingSlot } from '@/lib/data'

interface BookingFormProps {
  selectedDate: Date
  selectedSlot: BookingSlot
  onSubmit: (data: { name: string; email: string; phone: string; notes: string }) => void
  onBack: () => void
}

export default function BookingForm({ selectedDate, selectedSlot, onSubmit, onBack }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (name.trim().length < 2) newErrors.name = 'Please enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address'
    if (!/^\+?[0-9]{10,12}$/.test(phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({ name, email, phone, notes })
    }
  }

  const formatTime = (time: string) => {
    const [h] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:00 ${ampm}`
  }

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <button
        onClick={onBack}
        className="font-body text-sm text-[#6B6560] hover:text-[#C9A96E] transition-colors mb-6"
      >
        ← Change Time Slot
      </button>

      {/* Appointment Summary */}
      <div className="bg-[#EDE6DA] p-4 rounded mb-8 flex items-center gap-3">
        <div className="flex gap-2 text-[#C9A96E]">
          <Calendar size={16} />
          <Clock size={16} />
        </div>
        <p className="font-body text-sm text-[#2C2C2C]">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {formatTime(selectedSlot.startTime)}
        </p>
      </div>

      <h3 className="font-display text-[24px] md:text-[28px] text-[#2C2C2C] mb-6">
        YOUR DETAILS
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] block mb-2">
            FULL NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className={`w-full bg-white border rounded px-4 py-3.5 font-body text-[15px] text-[#2C2C2C] placeholder:text-[#9B9590] outline-none transition-all duration-200 focus:border-[#C9A96E] focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)] ${
              errors.name ? 'border-[#C4705A] shadow-[0_0_0_3px_rgba(196,112,90,0.1)]' : 'border-[#D0C9C0]'
            }`}
          />
          {errors.name && <p className="font-body text-xs text-[#C4705A] mt-1">{errors.name}</p>}
        </motion.div>

        {/* Email */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] block mb-2">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`w-full bg-white border rounded px-4 py-3.5 font-body text-[15px] text-[#2C2C2C] placeholder:text-[#9B9590] outline-none transition-all duration-200 focus:border-[#C9A96E] focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)] ${
              errors.email ? 'border-[#C4705A] shadow-[0_0_0_3px_rgba(196,112,90,0.1)]' : 'border-[#D0C9C0]'
            }`}
          />
          {errors.email && <p className="font-body text-xs text-[#C4705A] mt-1">{errors.email}</p>}
        </motion.div>

        {/* Phone */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] block mb-2">
            PHONE NUMBER
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className={`w-full bg-white border rounded px-4 py-3.5 font-body text-[15px] text-[#2C2C2C] placeholder:text-[#9B9590] outline-none transition-all duration-200 focus:border-[#C9A96E] focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)] ${
              errors.phone ? 'border-[#C4705A] shadow-[0_0_0_3px_rgba(196,112,90,0.1)]' : 'border-[#D0C9C0]'
            }`}
          />
          {errors.phone && <p className="font-body text-xs text-[#C4705A] mt-1">{errors.phone}</p>}
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] block mb-2">
            APPOINTMENT NOTES (OPTIONAL)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us what you're looking for — e.g., 'Bridal lehenga consultation for June wedding'"
            maxLength={500}
            rows={4}
            className="w-full bg-white border border-[#D0C9C0] rounded px-4 py-3.5 font-body text-[15px] text-[#2C2C2C] placeholder:text-[#9B9590] outline-none transition-all duration-200 focus:border-[#C9A96E] focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)] resize-y"
          />
          <p className="font-body text-[11px] text-[#9B9590] text-right mt-1">
            {notes.length} / 500
          </p>
        </motion.div>

        <motion.button
          type="submit"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="w-full py-4 bg-[#C9A96E] text-white font-body text-xs tracking-[0.15em] uppercase hover:bg-[#B8985E] transition-colors duration-300 rounded"
        >
          PROCEED TO PAYMENT
        </motion.button>
      </form>
    </div>
  )
}
