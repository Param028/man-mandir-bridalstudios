import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import useRazorpay from 'react-razorpay'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/booking/StepIndicator'
import CalendarGrid from '@/components/booking/CalendarGrid'
import SlotPicker from '@/components/booking/SlotPicker'
import BookingForm from '@/components/booking/BookingForm'
import type { BookingSlot } from '@/lib/data'

interface CustomerData {
  name: string
  email: string
  phone: string
  notes: string
}

export default function BookingPage() {
  const navigate = useNavigate()
  const [Razorpay] = useRazorpay()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setStep(2)
  }

  const handleSlotSelect = (slot: BookingSlot) => {
    setSelectedSlot(slot)
    setStep(3)
  }

  const handleFormSubmit = (data: CustomerData) => {
    setCustomerData(data)
    setStep(4)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Simulate payment processing
      await new Promise((r) => setTimeout(r, 2000))

      // Create booking in backend
      const timeString = selectedSlot
        ? (() => {
            const [h] = selectedSlot.startTime.split(':')
            const hour = parseInt(h)
            const ampm = hour >= 12 ? 'PM' : 'AM'
            const h12 = hour % 12 || 12
            return `${h12}:00 ${ampm}`
          })()
        : ''

      const booking_id = `BKG-${Date.now()}`;

      const bookingData = {
        booking_id,
        customer_name: customerData?.name,
        customer_email: customerData?.email,
        customer_phone: customerData?.phone,
        booking_date: selectedDate ? selectedDate.toISOString() : '',
        booking_time: timeString,
        notes: customerData?.notes,
        amount: 100,
        status: 'pending',
        payment_status: 'pending' // Initial status
      };

      // 1. Insert pending booking
      const { error: insertError } = await supabase.from('bookings').insert([bookingData]);
      if (insertError) throw insertError;

      // 2. Create Razorpay order via Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: 100, receipt: booking_id }
      });

      if (orderError || !orderData) {
        throw new Error("Failed to initialize payment");
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // We need to add this to .env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Manmandir Bridal",
        description: "Booking Consultation Fee",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // 4. Verify payment via Edge Function
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: booking_id
              }
            });

            if (verifyError || !verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            toast.success('Payment successful! Your appointment is confirmed.')
            navigate('/booking/success', {
              state: {
                bookingId: booking_id,
                date: selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '',
                time: timeString,
                name: customerData?.name,
                email: customerData?.email,
                phone: customerData?.phone,
                amount: 100,
              },
            })
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: customerData?.name,
          email: customerData?.email,
          contact: customerData?.phone,
        },
        theme: {
          color: "#C9A96E",
        },
      };

      const rzp = new Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });

      rzp.open();

    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (time: string) => {
    const [h] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:00 ${ampm}`
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <main className="pt-[72px]">
        <div className="py-12 md:py-20 px-4 md:px-6">
          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h2 className="font-display text-[24px] md:text-[28px] text-[#2C2C2C] text-center mb-2">
                  SELECT A DATE
                </h2>
                <p className="font-body text-sm text-[#6B6560] text-center mb-8">
                  Choose your preferred appointment date
                </p>
                <CalendarGrid selectedDate={selectedDate} onSelectDate={handleDateSelect} />
              </motion.div>
            )}

            {step === 2 && selectedDate && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <SlotPicker
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                  onBack={() => { setStep(1); setSelectedSlot(null) }}
                />
              </motion.div>
            )}

            {step === 3 && selectedDate && selectedSlot && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <BookingForm
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSubmit={handleFormSubmit}
                  onBack={() => { setStep(2); setCustomerData(null) }}
                />
              </motion.div>
            )}

            {step === 4 && selectedDate && selectedSlot && customerData && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full max-w-[480px] mx-auto"
              >
                <h2 className="font-display text-[24px] md:text-[28px] text-[#2C2C2C] mb-6">
                  CONFIRM & PAY
                </h2>

                {/* Booking Summary Card */}
                <div className="bg-white border border-[#E5E0D8] rounded p-6 mb-8 shadow-card">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-[#6B6560]">Date</span>
                      <span className="font-body text-sm text-[#2C2C2C]">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-[#6B6560]">Time</span>
                      <span className="font-body text-sm text-[#2C2C2C]">{formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-[#6B6560]">Name</span>
                      <span className="font-body text-sm text-[#2C2C2C]">{customerData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-[#6B6560]">Contact</span>
                      <span className="font-body text-sm text-[#2C2C2C]">{customerData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-[#6B6560]">Phone</span>
                      <span className="font-body text-sm text-[#2C2C2C]">{customerData.phone}</span>
                    </div>
                    {customerData.notes && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-[#6B6560]">Notes</span>
                        <span className="font-body text-sm text-[#2C2C2C] max-w-[200px] text-right truncate">{customerData.notes}</span>
                      </div>
                    )}
                    <div className="border-t border-[#DDD6CC] pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-body text-sm text-[#6B6560]">Booking Fee</span>
                        <span className="font-display text-2xl text-[#2C2C2C]">₹100.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#C9A96E] text-white font-body text-xs tracking-[0.15em] uppercase hover:bg-[#B8985E] transition-colors duration-300 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'PAY ₹100.00'
                  )}
                </button>
                <p className="font-body text-[11px] text-[#9B9590] text-center mt-3">
                  Secure payment powered by Razorpay
                </p>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Lock size={12} className="text-[#9B9590]" />
                  <p className="font-body text-[11px] text-[#9B9590]">
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  )
}
