import { useState, useMemo } from 'react'
import { Search, Download, Check, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { paymentRecords } from '@/lib/data'

const paymentColors: Record<string, string> = {
  paid: 'bg-[rgba(74,140,111,0.12)] text-[#4A8C6F]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C]',
  failed: 'bg-[rgba(196,112,90,0.12)] text-[#C4705A]',
  refunded: 'bg-[rgba(139,157,195,0.12)] text-[#8B9DC3]',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(paymentRecords)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewPayment, setViewPayment] = useState<typeof payments[0] | null>(null)

  const filtered = useMemo(() => {
    let result = [...payments]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.bookingId.toLowerCase().includes(q) ||
          p.razorpayOrderId.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }
    return result
  }, [payments, search, statusFilter])

  const handleVerify = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: true } : p))
    )
    toast.success('Payment verified')
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-[#6B6560]">Track and reconcile all payment transactions</p>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by booking or order ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#D0C9C0] rounded font-body text-sm outline-none focus:border-[#C9A96E] bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#D0C9C0] rounded font-body text-sm outline-none focus:border-[#C9A96E] bg-white"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button onClick={() => toast.success('CSV exported')} className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E0D8] rounded font-body text-xs text-[#2C2C2C] hover:bg-[#F8F5F0] transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#EDE6DA]">
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Payment ID</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Booking ID</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Razorpay Order</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Amount</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Status</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Date</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Verified</th>
              <th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment, i) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-[#F5F0E8] hover:bg-[#F8F5F0] transition-colors"
              >
                <td className="px-4 py-3.5 font-mono text-xs text-[#2C2C2C]">{payment.id}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-[#C9A96E]">{payment.bookingId}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-[#6B6560] truncate max-w-[140px]">{payment.razorpayOrderId}</td>
                <td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">₹{payment.amount}</td>
                <td className="px-4 py-3.5">
                  <span className={`font-body text-[11px] px-2.5 py-1 rounded-full ${paymentColors[payment.status]}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-body text-xs text-[#6B6560]">
                  {format(new Date(payment.date), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3.5">
                  {payment.verified ? (
                    <Check size={16} className="text-[#4A8C6F]" />
                  ) : (
                    <span className="text-[#9B9590]">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewPayment(payment)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F8F5F0] text-[#6B6560] hover:text-[#C9A96E] transition-colors">
                      <Eye size={14} />
                    </button>
                    {!payment.verified && payment.status === 'paid' && (
                      <button onClick={() => handleVerify(payment.id)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(74,140,111,0.08)] text-[#6B6560] hover:text-[#4A8C6F] transition-colors">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="font-body text-sm text-[#9B9590]">No payments found</p>
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent className="max-w-md bg-white border-[#E5E0D8]">
          {viewPayment && (
            <div className="space-y-3">
              <h3 className="font-display text-xl text-[#2C2C2C] mb-4">Payment Details</h3>
              {[
                ['Payment ID', viewPayment.id, true],
                ['Booking ID', viewPayment.bookingId, true],
                ['Razorpay Order ID', viewPayment.razorpayOrderId, true],
                ['Razorpay Payment ID', viewPayment.razorpayPaymentId || '—', true],
                ['Amount', `₹${viewPayment.amount}`],
                ['Status', viewPayment.status],
                ['Date', format(new Date(viewPayment.date), 'MMM d, yyyy h:mm a')],
                ['Verified', viewPayment.verified ? 'Yes' : 'No'],
              ].map(([label, value, isMono]) => (
                <div key={label as string} className="flex justify-between py-1.5 border-b border-[#F5F0E8] last:border-0">
                  <span className="font-body text-sm text-[#6B6560]">{label as string}</span>
                  <span className={`font-body text-sm text-[#2C2C2C] ${isMono ? 'font-mono text-xs' : ''}`}>{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
