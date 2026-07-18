import { Calendar, BarChart3, CreditCard, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { mockBookings } from '@/lib/data'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const stats = [
  { icon: Calendar, label: "TODAY'S BOOKINGS", value: '8', change: '+3', up: true },
  { icon: BarChart3, label: 'THIS WEEK', value: '24', change: '+5', up: true },
  { icon: CreditCard, label: 'TOTAL REVENUE', value: '₹2,400', change: '+12%', up: true },
  { icon: Clock, label: 'PENDING', value: '3', change: '-1', up: false, urgent: true },
]

const chartData = [
  { day: 'Mon', bookings: 4 },
  { day: 'Tue', bookings: 6 },
  { day: 'Wed', bookings: 0 },
  { day: 'Thu', bookings: 3 },
  { day: 'Fri', bookings: 8 },
  { day: 'Sat', bookings: 5 },
  { day: 'Sun', bookings: 2 },
]

const recentBookings = mockBookings.slice(0, 5)

const statusColors: Record<string, string> = {
  confirmed: 'bg-[rgba(74,140,111,0.12)] text-[#4A8C6F]',
  pending: 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C]',
  cancelled: 'bg-[rgba(196,112,90,0.12)] text-[#C4705A]',
  completed: 'bg-[rgba(139,157,195,0.12)] text-[#8B9DC3]',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`bg-white border border-[#E5E0D8] rounded p-6 shadow-card ${stat.urgent ? 'border-l-[3px] border-l-[#C9A84C]' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(201,169,110,0.12)] flex items-center justify-center">
                <stat.icon size={20} className="text-[#C9A96E]" />
              </div>
              <span className={`font-body text-xs flex items-center gap-0.5 ${stat.up ? 'text-[#4A8C6F]' : 'text-[#C4705A]'}`}>
                {stat.change}
              </span>
            </div>
            <p className="font-body text-[28px] font-medium text-[#2C2C2C] leading-none">{stat.value}</p>
            <p className="font-body text-xs tracking-[0.1em] uppercase text-[#6B6560] mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-white border border-[#E5E0D8] rounded p-6 shadow-card"
        >
          <h2 className="font-body text-base font-medium text-[#2C2C2C] mb-6">
            Bookings & Revenue (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B6560' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B6560' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: '4px', fontSize: '13px' }}
                cursor={{ fill: 'rgba(201,169,110,0.05)' }}
              />
              <Bar dataKey="bookings" fill="#C9A96E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white border border-[#E5E0D8] rounded p-6 shadow-card"
        >
          <h2 className="font-body text-base font-medium text-[#2C2C2C] mb-4">
            Recent Bookings
          </h2>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-[#F5F0E8] last:border-0">
                <div>
                  <p className="font-body text-sm font-medium text-[#2C2C2C]">{booking.customerName}</p>
                  <p className="font-body text-xs text-[#9B9590]">{booking.customerPhone}</p>
                </div>
                <span className={`font-body text-[11px] px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
