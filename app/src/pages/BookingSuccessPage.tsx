import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface BookingState {
  bookingId: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  amount: number
}

export default function BookingSuccessPage() {
  const location = useLocation()
  const data = location.state as BookingState | null

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-[#6B6560] mb-4">No booking information found.</p>
          <Link to="/book-appointment" className="text-[#C9A96E] hover:underline font-body text-sm">
            Book an Appointment
          </Link>
        </div>
      </div>
    )
  }

  const details = [
    { label: 'Booking ID', value: data.bookingId, isMono: true },
    { label: 'Date', value: data.date },
    { label: 'Time', value: data.time },
    { label: 'Name', value: data.name },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone },
    { label: 'Amount Paid', value: `₹${data.amount}.00`, isSuccess: true },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <main className="pt-[72px]">
        <div className="py-16 md:py-24 px-4 max-w-[560px] mx-auto text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[rgba(74,140,111,0.15)] border-2 border-[#4A8C6F] flex items-center justify-center mx-auto mb-6"
          >
            <Check size={36} className="text-[#4A8C6F]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-display text-[36px] md:text-[48px] text-[#2C2C2C] leading-[1.2] mb-3"
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-body text-[15px] text-[#6B6560] leading-relaxed mb-10"
          >
            Thank you, {data.name}. Your appointment has been successfully booked. A confirmation email has been sent to {data.email}.
          </motion.p>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white border border-[#E5E0D8] rounded p-6 md:p-8 text-left shadow-card mb-8"
          >
            {details.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between py-3">
                  <span className="font-body text-sm text-[#6B6560]">{item.label}</span>
                  <span className={`font-body text-sm ${item.isMono ? 'font-mono' : ''} ${item.isSuccess ? 'text-[#4A8C6F]' : 'text-[#2C2C2C]'}`}>
                    {item.value}
                  </span>
                </div>
                {i < details.length - 1 && <div className="border-b border-[#DDD6CC]" />}
              </div>
            ))}
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-left mb-10"
          >
            <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6560] mb-4">
              WHAT'S NEXT?
            </h3>
            <ul className="space-y-3">
              {[
                'Arrive 15 minutes before your appointment',
                'Bring reference images or fabric swatches if desired',
                'Call us at +91 98765 43210 for any changes',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] mt-2 flex-shrink-0" />
                  <span className="font-body text-sm text-[#6B6560]">{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col gap-3"
          >
            <Link
              to="/"
              className="w-full py-3.5 bg-[#C9A96E] text-white font-body text-xs tracking-[0.15em] uppercase text-center hover:bg-[#B8985E] transition-colors duration-300"
            >
              BACK TO HOME
            </Link>
            <Link
              to="/book-appointment"
              className="w-full py-3.5 border border-[#E5E0D8] text-[#2C2C2C] font-body text-xs tracking-[0.15em] uppercase text-center hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors duration-300"
            >
              BOOK ANOTHER APPOINTMENT
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
