import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { getSlotsForDate } from '@/lib/data'
import type { BookingSlot } from '@/lib/data'

interface SlotPickerProps {
  selectedDate: Date
  selectedSlot: BookingSlot | null
  onSelectSlot: (slot: BookingSlot) => void
  onBack: () => void
}

export default function SlotPicker({ selectedDate, selectedSlot, onSelectSlot, onBack }: SlotPickerProps) {
  const slots = useMemo(() => getSlotsForDate(selectedDate), [selectedDate])
  const availableSlots = slots.filter((s) => !s.isBooked)

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
        className="font-body text-sm text-[#6B6560] hover:text-[#C9A96E] transition-colors mb-6 flex items-center gap-1"
      >
        ← Change Date
      </button>

      <h3 className="font-display text-[24px] md:text-[28px] text-[#2C2C2C] mb-1">
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </h3>

      {/* Availability Status */}
      <p className={`font-body text-sm mb-6 ${
        availableSlots.length === 0 ? 'text-[#C4705A]' :
        availableSlots.length <= 3 ? 'text-[#C9A84C]' :
        'text-[#4A8C6F]'
      }`}>
        {availableSlots.length === 0 ? 'All slots booked' :
         availableSlots.length === 1 ? 'Only 1 slot left' :
         `${availableSlots.length} slots available`}
      </p>

      {/* Urgency Banner */}
      {availableSlots.length > 0 && availableSlots.length <= 3 && (
        <div className="flex items-start gap-2 bg-[rgba(201,168,76,0.1)] border border-[#C9A84C] rounded px-4 py-3 mb-6">
          <Clock size={16} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
          <p className="font-body text-sm text-[#C9A84C]">
            Only {availableSlots.length} slot{availableSlots.length > 1 ? 's' : ''} remaining for this date — book now to secure your appointment
          </p>
        </div>
      )}

      {/* Slot Grid */}
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => {
          const isSelected = selectedSlot?.id === slot.id
          const isBooked = slot.isBooked

          return (
            <motion.button
              key={slot.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              disabled={isBooked}
              onClick={() => onSelectSlot(slot)}
              className={`py-3 px-2 font-body text-sm border rounded transition-all duration-200 ${
                isSelected
                  ? 'bg-[#C9A96E] border-[#C9A96E] text-white font-medium'
                  : isBooked
                  ? 'bg-[#EDE6DA] border-[#DDD6CC] text-[#9B9590] line-through cursor-not-allowed'
                  : 'bg-white border-[#D0C9C0] text-[#2C2C2C] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.05)]'
              }`}
            >
              {formatTime(slot.startTime)}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
