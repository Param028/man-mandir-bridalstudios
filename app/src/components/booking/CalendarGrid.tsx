import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay, isAfter, addDays } from 'date-fns'
import { getAvailabilityForDate } from '@/lib/data'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarGridProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export default function CalendarGrid({ selectedDate, onSelectDate }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = startOfDay(new Date())
  const maxDate = addDays(today, 60)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const getDotColor = (date: Date): string | null => {
    if (!isSameMonth(date, currentMonth)) return null
    if (isBefore(date, today) || isAfter(date, maxDate)) return null
    const avail = getAvailabilityForDate(date)
    if (avail === 'none') return null
    if (avail === 'full') return 'bg-[#4A8C6F]'
    if (avail === 'partial') return 'bg-[#C9A84C]'
    return 'bg-[#C4705A]'
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-9 h-9 flex items-center justify-center text-[#6B6560] hover:text-[#C9A96E] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-display text-xl text-[#2C2C2C]">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-9 h-9 flex items-center justify-center text-[#6B6560] hover:text-[#C9A96E] transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <div key={d} className="text-center font-body text-xs text-[#9B9590] py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="min-h-[264px] md:min-h-[288px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth.toISOString()}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="grid grid-cols-7 gap-1"
          >
            {calendarDays.map((date, i) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const isToday = isSameDay(date, today)
              const isPast = isBefore(date, today)
              const isFuture = isAfter(date, maxDate)
              const isWednesday = date.getDay() === 3
              const isDisabled = !isCurrentMonth || isPast || isFuture || isWednesday
              const dotColor = getDotColor(date)

              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => onSelectDate(date)}
                  className={`relative h-11 md:h-12 flex flex-col items-center justify-center font-body text-sm transition-all duration-200 rounded-sm ${
                    isSelected
                      ? 'bg-[#C9A96E] text-white font-medium'
                      : isToday
                      ? 'border border-[#C9A96E] text-[#2C2C2C]'
                      : isWednesday && isCurrentMonth
                      ? 'text-[#9B9590] cursor-not-allowed line-through'
                      : isDisabled
                      ? 'text-[#9B9590] cursor-not-allowed'
                      : 'text-[#2C2C2C] hover:bg-[rgba(201,169,110,0.1)] cursor-pointer'
                  }`}
                  title={isWednesday ? 'Studio Closed' : undefined}
                >
                  {format(date, 'd')}
                  {dotColor && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A8C6F]" />
          <span className="font-body text-[10px] text-[#9B9590]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
          <span className="font-body text-[10px] text-[#9B9590]">Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C4705A]" />
          <span className="font-body text-[10px] text-[#9B9590]">Full</span>
        </div>
      </div>
    </div>
  )
}
