import { useEffect, useMemo, useState } from 'react'
import { Calendar, BarChart3, CreditCard, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'

type BookingRow = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  booking_date: string | null
  booking_time: string | null
  status: string | null
  payment_status: string | null
  amount: number | string | null
  created_at: string | null
}

type ChartDay = { day: string; bookings: number }
const statusColors: Record<string, string> = {
  confirmed: 'bg-[rgba(74,140,111,0.12)] text-[#3F7455]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#8A672B]',
  cancelled: 'bg-[rgba(196,112,90,0.12)] text-[#A24D41]',
  completed: 'bg-[rgba(139,157,195,0.16)] text-[#687CA6]',
}

function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}
function istDateKey(date: Date) {
  const parts = istParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}
function bookingDateKey(value: string | null) {
  if (!value) return ''
  return value.includes('T') ? istDateKey(new Date(value)) : value.slice(0, 10)
}
function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id,customer_name,customer_phone,booking_date,booking_time,status,payment_status,amount,created_at')
          .order('created_at', { ascending: false })
          .limit(1000)
        if (error) throw error
        if (mounted) setBookings((data ?? []) as BookingRow[])
      } catch (error) {
        console.error('Unable to load dashboard bookings:', error)
        if (mounted) setLoadError('Live booking data could not be loaded. Verify admin access and database configuration.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  const { stats, chartData } = useMemo(() => {
    const now = new Date()
    const todayKey = istDateKey(now)
    const todayStart = new Date(`${todayKey}T00:00:00+05:30`)
    const days: ChartDay[] = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(todayStart.getTime() - (6 - index) * 86_400_000)
      return { day: day.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' }), bookings: 0 }
    })
    const dayKeys = Array.from({ length: 7 }, (_, index) => istDateKey(new Date(todayStart.getTime() - (6 - index) * 86_400_000)))
    let weekCount = 0
    let paidRevenue = 0
    let pending = 0
    for (const booking of bookings) {
      const bookingDay = bookingDateKey(booking.booking_date)
      const index = dayKeys.indexOf(bookingDay)
      if (index >= 0) { days[index].bookings += 1; weekCount += 1 }
      if (booking.payment_status?.toLowerCase() === 'paid' && index >= 0) paidRevenue += Number(booking.amount) || 0
      if (booking.status?.toLowerCase() === 'pending') pending += 1
    }
    const todayCount = bookings.filter((booking) => bookingDateKey(booking.booking_date) === todayKey).length
    return {
      stats: [
        { icon: Calendar, label: "TODAY'S APPOINTMENTS", value: String(todayCount) },
        { icon: BarChart3, label: 'APPOINTMENTS (LAST 7 DAYS)', value: String(weekCount) },
        { icon: CreditCard, label: 'PAID BOOKING REVENUE (7D)', value: currency(paidRevenue) },
        { icon: Clock, label: 'PENDING BOOKINGS', value: String(pending), urgent: pending > 0 },
      ],
      chartData: days,
    }
  }, [bookings])

  const recentBookings = bookings.slice(0, 5)

  return (
    <div className="space-y-6">
      {loadError && <div role="alert" className="border border-[#E8C9C3] bg-[#FFF8F6] p-4 font-body text-sm text-[#8C4338]">{loadError}</div>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }} className={`rounded border border-[#E5E0D8] bg-white p-6 shadow-card ${stat.urgent ? 'border-l-[3px] border-l-[#C9A96E]' : ''}`}>
            <div className="mb-4 flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(201,169,110,0.12)]"><stat.icon size={20} className="text-[#8A672B]" /></div></div>
            <p className="font-body text-[28px] font-medium leading-none text-[#2C2C2C]">{loading ? '—' : stat.value}</p>
            <p className="mt-2 font-body text-xs uppercase tracking-[0.1em] text-[#514B46]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="rounded border border-[#E5E0D8] bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="mb-6 font-body text-base font-medium text-[#2C2C2C]">Appointments by date · last 7 days</h2>
          {loading ? <div role="status" className="flex h-[250px] items-center justify-center font-body text-sm text-[#514B46]">Loading live data…</div> : chartData.every((day) => day.bookings === 0) ? <div className="flex h-[250px] items-center justify-center font-body text-sm text-[#514B46]">No appointments in this period.</div> : <ResponsiveContainer width="100%" height={250}><BarChart data={chartData}><XAxis dataKey="day" tick={{ fontSize: 12, fill: '#514B46' }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#514B46' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: '4px', fontSize: '13px' }} cursor={{ fill: 'rgba(201,169,110,0.05)' }} /><Bar dataKey="bookings" name="Appointments" fill="#8A672B" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer>}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="rounded border border-[#E5E0D8] bg-white p-6 shadow-card">
          <h2 className="mb-4 font-body text-base font-medium text-[#2C2C2C]">Recent appointments</h2>
          {loading ? <p className="py-8 font-body text-sm text-[#514B46]">Loading live data…</p> : recentBookings.length === 0 ? <p className="py-8 font-body text-sm text-[#514B46]">No appointments have been recorded.</p> : <div className="space-y-3">{recentBookings.map((booking) => {
            const status = booking.status?.toLowerCase() || 'pending'
            return <div key={booking.id} className="flex items-center justify-between gap-3 border-b border-[#F5F0E8] py-2 last:border-0"><div className="min-w-0"><p className="truncate font-body text-sm font-medium text-[#2C2C2C]">{booking.customer_name || 'Customer'}</p><p className="font-body text-xs text-[#514B46]">{bookingDateKey(booking.booking_date) || '—'} · {booking.booking_time || '—'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] ${statusColors[status] ?? 'bg-[#F5F0E8] text-[#514B46]'}`}>{status}</span></div>
          })}</div>}
        </motion.section>
      </div>
      {!loadError && bookings.length >= 1000 && <p className="font-body text-xs text-[#514B46]">Dashboard summaries use the most recent 1,000 booking records.</p>}
    </div>
  )
}
