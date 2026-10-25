import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type BookedAppointment = { booking_date: string; booking_time: string }

async function fetchAvailability(): Promise<BookedAppointment[]> {
  const { data, error } = await supabase.functions.invoke('get-booking-availability', { body: {} })
  if (error) throw new Error('Live appointment availability could not be checked.')
  if (!Array.isArray(data?.bookings)) throw new Error('Live appointment availability returned an invalid response.')
  return data.bookings.filter((booking: unknown): booking is BookedAppointment => {
    if (!booking || typeof booking !== 'object') return false
    const row = booking as Record<string, unknown>
    return typeof row.booking_date === 'string' && typeof row.booking_time === 'string'
  })
}

export function useBookingAvailability() {
  return useQuery({
    queryKey: ['public-booking-availability'],
    queryFn: fetchAvailability,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
  })
}

export function bookedTimesForDate(date: Date, bookings: BookedAppointment[]): string[] {
  const day = date.toISOString().slice(0, 10)
  return bookings
    .filter((booking) => booking.booking_date.slice(0, 10) === day)
    .map((booking) => booking.booking_time)
}
