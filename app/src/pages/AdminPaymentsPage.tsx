import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'

type PaymentRecord = {
  id: string
  source: 'booking' | 'order'
  customer: string | null
  amount: number
  method: string | null
  status: string
  date: string | null
  bookingDate?: string | null
}
const statusColors: Record<string, string> = {
  paid: 'bg-[rgba(74,140,111,0.12)] text-[#3F7455]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#8A672B]',
  failed: 'bg-[rgba(196,112,90,0.12)] text-[#A24D41]',
  refunded: 'bg-[rgba(139,157,195,0.16)] text-[#687CA6]',
}
function dateLabel(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
}
function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}
function currency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [viewPayment, setViewPayment] = useState<PaymentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadPayments = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [bookingResult, orderResult] = await Promise.all([
          supabase.from('bookings').select('id,customer_name,amount,payment_status,created_at,booking_date').order('created_at', { ascending: false }).limit(1000),
          supabase.from('orders').select('id,customer_name,total_amount,payment_method,payment_status,created_at').order('created_at', { ascending: false }).limit(1000),
        ])
        if (bookingResult.error) throw bookingResult.error
        if (orderResult.error) throw orderResult.error
        const bookingRows: PaymentRecord[] = (bookingResult.data ?? []).map((row: any) => ({
          id: String(row.id), source: 'booking', customer: row.customer_name ?? null,
          amount: Number(row.amount) || 0, method: null, status: String(row.payment_status ?? 'unknown').toLowerCase(),
          date: row.created_at ?? null, bookingDate: row.booking_date ?? null,
        }))
        const orderRows: PaymentRecord[] = (orderResult.data ?? []).map((row: any) => ({
          id: String(row.id), source: 'order', customer: row.customer_name ?? null,
          amount: Number(row.total_amount) || 0, method: row.payment_method ?? null,
          status: String(row.payment_status ?? 'unknown').toLowerCase(), date: row.created_at ?? null,
        }))
        if (mounted) setPayments([...bookingRows, ...orderRows].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()))
      } catch (error) {
        console.error('Unable to load payment records:', error)
        if (mounted) setLoadError('Live payment records could not be loaded. Verify admin access to bookings and orders.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadPayments()
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    let result = [...payments]
    const query = search.trim().toLocaleLowerCase()
    if (query) result = result.filter((payment) => payment.id.toLocaleLowerCase().includes(query) || payment.customer?.toLocaleLowerCase().includes(query))
    if (statusFilter !== 'all') result = result.filter((payment) => payment.status === statusFilter)
    if (sourceFilter !== 'all') result = result.filter((payment) => payment.source === sourceFilter)
    return result
  }, [payments, search, statusFilter, sourceFilter])

  const exportCsv = () => {
    const headers = ['Record ID', 'Source', 'Customer', 'Amount INR', 'Payment Method', 'Status', 'Recorded At']
    const rows = filtered.map((payment) => [payment.id, payment.source, payment.customer, payment.amount, payment.method, payment.status, payment.date])
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'payment-records.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-[#514B46]">Read-only payment status from recorded appointments and product orders. This view does not initiate, verify or refund payments.</p>
      {loadError && <div role="alert" className="border border-[#E8C9C3] bg-[#FFF8F6] p-4 font-body text-sm text-[#8C4338]">{loadError}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-[320px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by record or customer" className="w-full border border-[#D0C9C0] bg-white py-2.5 pl-9 pr-4 font-body text-sm outline-none focus:border-[#6B4F1D]" /></div>
        <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label="Filter by record type" className="border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm outline-none focus:border-[#6B4F1D]"><option value="all">All records</option><option value="booking">Appointments</option><option value="order">Product orders</option></select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by payment status" className="border border-[#D0C9C0] bg-white px-3 py-2.5 font-body text-sm outline-none focus:border-[#6B4F1D]"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <button type="button" onClick={exportCsv} disabled={!filtered.length} className="flex items-center gap-2 border border-[#E5E0D8] px-4 py-2.5 font-body text-xs text-[#2C2C2C] hover:bg-[#F8F5F0] disabled:opacity-50"><Download size={14} />Export CSV</button>
      </div>

      <div className="overflow-x-auto rounded border border-[#E5E0D8] bg-white shadow-card">
        <table className="w-full min-w-[820px]"><thead><tr className="bg-[#EDE6DA]"><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Record ID</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Source</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Customer</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Amount</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Payment status</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Date</th><th className="px-4 py-3 text-left font-body text-sm font-medium text-[#2C2C2C]">Details</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={7} className="px-4 py-12 text-center font-body text-sm text-[#514B46]">Loading live payment records…</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center font-body text-sm text-[#514B46]">{payments.length ? 'No records match these filters.' : 'No payment records have been recorded.'}</td></tr> : filtered.map((payment, index) => <motion.tr key={`${payment.source}-${payment.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="border-b border-[#F5F0E8] hover:bg-[#F8F5F0]"><td className="max-w-[180px] truncate px-4 py-3.5 font-mono text-xs text-[#2C2C2C]" title={payment.id}>{payment.id}</td><td className="px-4 py-3.5 font-body text-sm capitalize text-[#514B46]">{payment.source}</td><td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">{payment.customer || '—'}</td><td className="px-4 py-3.5 font-body text-sm text-[#2C2C2C]">{currency(payment.amount)}</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 font-body text-[11px] capitalize ${statusColors[payment.status] ?? 'bg-[#F5F0E8] text-[#514B46]'}`}>{payment.status}</span></td><td className="px-4 py-3.5 font-body text-xs text-[#514B46]">{dateLabel(payment.date)}</td><td className="px-4 py-3.5"><button type="button" onClick={() => setViewPayment(payment)} aria-label={`View payment record ${payment.id}`} className="flex h-8 w-8 items-center justify-center rounded text-[#514B46] hover:bg-[#F8F5F0] hover:text-[#6B4F1D]"><Eye size={14} /></button></td></motion.tr>)}</tbody>
        </table>
      </div>

      <Dialog open={!!viewPayment} onOpenChange={(open) => { if (!open) setViewPayment(null) }}><DialogContent className="max-w-md border-[#E5E0D8] bg-white">{viewPayment && <div className="space-y-3"><h3 className="mb-4 font-display text-xl text-[#2C2C2C]">Recorded payment details</h3>{[['Record ID', viewPayment.id], ['Source', viewPayment.source], ['Customer', viewPayment.customer || '—'], ['Amount', currency(viewPayment.amount)], ['Payment method', viewPayment.method || 'Not recorded'], ['Payment status', viewPayment.status], ['Recorded at', dateLabel(viewPayment.date)], ...(viewPayment.bookingDate ? [['Appointment date', dateLabel(viewPayment.bookingDate)] as [string, string]] : [])].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-[#F5F0E8] py-1.5 last:border-0"><span className="font-body text-sm text-[#514B46]">{label}</span><span className="break-all text-right font-body text-sm text-[#2C2C2C]">{value}</span></div>)}</div>}</DialogContent></Dialog>
    </div>
  )
}
