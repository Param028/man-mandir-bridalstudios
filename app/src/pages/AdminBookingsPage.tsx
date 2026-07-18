import { useState, useMemo, useEffect } from 'react'
import { Search, Download, Eye, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Booking } from '@/lib/data'

const statusColors: Record<string, string> = {
  confirmed: 'bg-[rgba(74,140,111,0.12)] text-[#4A8C6F]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C]',
  cancelled: 'bg-[rgba(196,112,90,0.12)] text-[#C4705A]',
  completed: 'bg-[rgba(139,157,195,0.12)] text-[#8B9DC3]',
}

const paymentColors: Record<string, string> = {
  paid: 'bg-[rgba(74,140,111,0.12)] text-[#4A8C6F]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C]',
  failed: 'bg-[rgba(196,112,90,0.12)] text-[#C4705A]',
  refunded: 'bg-[rgba(139,157,195,0.12)] text-[#8B9DC3]',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const mappedBookings = data.map((b: any) => ({
        id: b.id, // Or b.booking_id depending on how it's used
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        customerPhone: b.customer_phone,
        date: b.booking_date,
        time: b.booking_time,
        notes: b.notes,
        status: b.status,
        paymentStatus: b.payment_status,
        amount: b.amount,
        createdAt: b.created_at
      }));
      setBookings(mappedBookings)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = [...bookings]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter)
    }
    result.sort((a, b) => {
      const aVal = a[sortField as keyof Booking] ?? ''
      const bVal = b[sortField as keyof Booking] ?? ''
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [bookings, search, statusFilter, sortField, sortDir])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
      if (error) throw error;
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' as const } : b)))
      toast.success('Booking confirmed')
    } catch (error) {
      toast.error('Failed to confirm booking')
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this booking?')) {
      try {
        const { error } = await supabase.from('bookings').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', id);
        if (error) throw error;
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const, paymentStatus: 'refunded' as const } : b)))
        toast.success('Booking cancelled')
      } catch (error) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this booking?')) {
      try {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw error;
        setBookings((prev) => prev.filter((b) => b.id !== id))
        toast.success('Booking deleted')
      } catch (error) {
        toast.error('Failed to delete booking')
      }
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-[#DDD6CC]" />
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-[#C9A96E]" /> : <ChevronDown size={14} className="text-[#C9A96E]" />
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#D0C9C0] rounded font-body text-sm outline-none focus:border-[#C9A96E] bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#D0C9C0] rounded font-body text-sm outline-none focus:border-[#C9A96E] bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={() => toast.success('CSV exported')} className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E0D8] rounded font-body text-xs text-[#2C2C2C] hover:bg-[#F8F5F0] transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded shadow-card overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#EDE6DA]">
              {[
                { label: 'Booking ID', field: 'id' },
                { label: 'Customer', field: 'customerName' },
                { label: 'Date', field: 'date' },
                { label: 'Time', field: 'time' },
                { label: 'Status', field: 'status' },
                { label: 'Payment', field: 'paymentStatus' },
                { label: 'Amount', field: 'amount' },
              ].map((col) => (
                <th
                  key={col.field}
                  onClick={() => toggleSort(col.field)}
                  className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C] cursor-pointer hover:text-[#C9A96E] transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon field={col.field} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="font-body text-sm text-[#9B9590]">Loading bookings...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="font-body text-sm text-[#9B9590]">No bookings found</p>
                </td>
              </tr>
            ) : (
              filtered.map((booking, i) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-[#F5F0E8] hover:bg-[#F8F5F0] transition-colors"
              >
                <td className="px-4 py-3.5 font-mono text-xs text-[#2C2C2C]">{booking.id}</td>
                <td className="px-4 py-3.5">
                  <p className="font-body text-sm font-medium text-[#2C2C2C]">{booking.customerName}</p>
                  <p className="font-body text-xs text-[#9B9590]">{booking.customerPhone}</p>
                </td>
                <td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">{booking.date}</td>
                <td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">{booking.time}</td>
                <td className="px-4 py-3.5">
                  <span className={`font-body text-[11px] px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`font-body text-[11px] px-2.5 py-1 rounded-full ${paymentColors[booking.paymentStatus]}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">₹{booking.amount}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewBooking(booking)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F8F5F0] text-[#6B6560] hover:text-[#C9A96E] transition-colors">
                      <Eye size={14} />
                    </button>
                    {booking.status === 'pending' && (
                      <button onClick={() => handleConfirm(booking.id)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(74,140,111,0.08)] text-[#6B6560] hover:text-[#4A8C6F] transition-colors">
                        <Check size={14} />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(booking.id)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(196,112,90,0.08)] text-[#6B6560] hover:text-[#C4705A] transition-colors">
                        <X size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(booking.id)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(196,112,90,0.08)] text-[#6B6560] hover:text-[#C4705A] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* View Booking Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-md bg-white border-[#E5E0D8]">
          {viewBooking && (
            <div className="space-y-3">
              <h3 className="font-display text-xl text-[#2C2C2C] mb-4">Booking Details</h3>
              {[
                ['Booking ID', viewBooking.id, true],
                ['Customer', viewBooking.customerName],
                ['Email', viewBooking.customerEmail],
                ['Phone', viewBooking.customerPhone],
                ['Date', viewBooking.date],
                ['Time', viewBooking.time],
                ['Status', viewBooking.status],
                ['Payment', `${viewBooking.paymentStatus} (₹${viewBooking.amount})`],
                ['Created', format(new Date(viewBooking.createdAt), 'MMM d, yyyy h:mm a')],
                ...(viewBooking.notes ? [['Notes', viewBooking.notes]] : []),
              ].map(([label, value, isMono]) => (
                <div key={label as string} className="flex justify-between py-1.5 border-b border-[#F5F0E8] last:border-0">
                  <span className="font-body text-sm text-[#6B6560]">{label as string}</span>
                  <span className={`font-body text-sm text-[#2C2C2C] ${isMono ? 'font-mono' : ''}`}>{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
