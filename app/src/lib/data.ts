export interface PhotoOfWeek {
  id: string | number
  title: string
  thumbnail: string
  images: GalleryItem[]
}

export interface GalleryItem {
  id: string | number
  type: 'image' | 'video'
  url: string
  caption?: string
}

export interface Product {
  id: string | number
  name: string
  category: string
  category_id?: string
  subcategory_id?: string
  primaryImage: string
  secondaryImage: string
  description: string
  order: number
  active: boolean
  price?: number
  discountedPrice?: number
  rating?: number
  isNew?: boolean
  isBestSeller?: boolean
  images?: string[]
  sizes?: { size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; stock: number }[]
  colors?: { name: string; hex: string; stock: number }[]
  fabricDetails?: { material: string; embroidery?: string; design?: string }
  careInstructions?: { washing?: string; dryClean?: string; storage?: string }
  designer?: string
  occasions?: ('Wedding' | 'Engagement' | 'Reception' | 'Haldi' | 'Mehendi')[]
}

export interface BookingSlot {
  id: number
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  amount: number
  notes?: string
  createdAt: string
}

// Preserve the existing appointment hours and closure day, but never fabricate
// booked slots. Only an actual booking passed by a trusted availability source
// may mark a time as unavailable.
const APPOINTMENT_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

function normalizeTime(value: string): string {
  const input = value.trim().toUpperCase()
  const match = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/)
  if (!match) return input
  let hour = Number(match[1])
  const minute = match[2] ?? '00'
  const meridiem = match[3]
  if (meridiem === 'PM' && hour < 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${minute}`
}

export function getSlotsForDate(date: Date, bookedTimes: string[] = []): BookingSlot[] {
  if (date.getDay() === 3) return []

  const dateStr = date.toISOString().split('T')[0]
  const booked = new Set(bookedTimes.map(normalizeTime))
  return APPOINTMENT_HOURS.map((startTime, index) => {
    const hour = Number(startTime.split(':')[0])
    const endHour = String(hour + 1).padStart(2, '0')
    return {
      id: index + 1,
      date: dateStr,
      startTime,
      endTime: `${endHour}:00`,
      isBooked: booked.has(startTime),
    }
  })
}

export function getAvailabilityForDate(date: Date, bookedTimes: string[] = []): 'full' | 'partial' | 'empty' | 'none' {
  const slots = getSlotsForDate(date, bookedTimes)
  if (slots.length === 0) return 'none'
  const available = slots.filter((slot) => !slot.isBooked).length
  if (available === slots.length) return 'full'
  if (available === 0) return 'empty'
  return 'partial'
}
