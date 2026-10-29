import { useQuery } from '@tanstack/react-query'

export type BookedAppointment = { booking_date: string; booking_time: string }

async function fetchAvailability(): Promise<BookedAppointment[]> {
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  if (!supabaseUrl) throw new Error('Live appointment availability could not be checked.')
  // This public read exposes only busy appointment slots. text/plain keeps the
  // request simple so mobile browsers do not need an OPTIONS preflight.
  const response = await fetch(`${supabaseUrl}/functions/v1/get-booking-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: '{}',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Live appointment availability could not be checked.')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !Array.isArray((data as { bookings?: unknown }).bookings)) {
    throw new Error('Live appointment availability returned an invalid response.')
  }
  return (data as { bookings: unknown[] }).bookings.filter((booking: unknown): booking is BookedAppointment => {
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
