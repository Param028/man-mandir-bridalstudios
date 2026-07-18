import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/lib/cartContext'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

interface ShippingForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

const empty: ShippingForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, count, total, removeItem, updateQuantity, clearCart } = useCart()

  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'confirmed'>('cart')
  const [form, setForm] = useState<ShippingForm>(empty)
  const [errors, setErrors] = useState<Partial<ShippingForm>>({})
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online')
  const [placing, setPlacing] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<ShippingForm> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state) e.state = 'State is required'
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Place order ──────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    setPlacing(true)
    // Simulate order placement — replace with real API call
    await new Promise((r) => setTimeout(r, 1500))
    clearCart()
    setStep('confirmed')
    setPlacing(false)
  }

  const field = (key: keyof ShippingForm, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="font-body text-[10px] tracking-[0.12em] uppercase text-[#6B6560] block mb-1.5">
        {label} <span className="text-[#C4705A]">*</span>
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }))
          if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
        }}
        placeholder={placeholder}
        className={`w-full border rounded px-4 py-3 font-body text-sm outline-none transition-colors ${
          errors[key] ? 'border-[#C4705A] bg-[#FFF8F7]' : 'border-[#D0C9C0] focus:border-[#C9A96E]'
        }`}
      />
      {errors[key] && (
        <p className="font-body text-[11px] text-[#C4705A] mt-1">{errors[key]}</p>
      )}
    </div>
  )

  // ── Order Summary sidebar ────────────────────────────────────────────────────
  const OrderSummary = ({ minimal = false }) => (
    <div className={`bg-[#F8F5F0] border border-[#E5E0D8] rounded-lg p-6 ${minimal ? '' : 'sticky top-24'}`}>
      <h3 className="font-display text-lg text-[#2C2C2C] mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {items.map((item) => {
          const pid = String((item.product as any)._id || item.product.id)
          return (
            <div key={`${pid}-${item.size}-${item.color}`} className="flex gap-3">
              <img
                src={item.product.primaryImage}
                alt={item.product.name}
                className="w-14 h-18 object-cover rounded border border-[#E5E0D8] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-semibold text-[#2C2C2C] truncate">{item.product.name}</p>
                <p className="font-body text-[10px] text-[#9B9590] mt-0.5">
                  {item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="font-body text-xs font-semibold text-[#2C2C2C]">
                    {fmt((item.product.discountedPrice || item.product.price || 0) * item.quantity)}
                  </p>
                  <span className="font-body text-[10px] text-[#9B9590]">× {item.quantity}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="border-t border-[#E5E0D8] pt-4 space-y-2">
        <div className="flex justify-between font-body text-xs text-[#6B6560]">
          <span>Subtotal</span><span>{fmt(total)}</span>
        </div>
        <div className="flex justify-between font-body text-xs text-[#6B6560]">
          <span>Shipping</span><span className="text-[#4A8C6F]">Free</span>
        </div>
        <div className="flex justify-between font-body text-sm font-semibold text-[#2C2C2C] pt-2 border-t border-[#E5E0D8]">
          <span>Total</span><span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  )

  // ── Confirmed screen ─────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-[#F5F0E8]">
        <Navbar />
        <main className="max-w-lg mx-auto px-6 py-32 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-20 h-20 rounded-full bg-[#4A8C6F]/10 border-2 border-[#4A8C6F] flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A8C6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-display text-3xl text-[#2C2C2C] mb-3">Order Placed!</h1>
            <p className="font-body text-sm text-[#6B6560] mb-2">Thank you, <strong>{form.name || 'valued customer'}</strong>.</p>
            <p className="font-body text-xs text-[#9B9590] mb-8">
              We'll confirm your order shortly via email at <strong>{form.email}</strong>.
              Our team will reach out within 24 hours.
            </p>
            <button
              onClick={() => navigate('/')}
              className="font-body text-xs tracking-[0.15em] uppercase px-8 py-3.5 bg-[#2C2C2C] text-white hover:bg-[#C9A96E] transition-all duration-300"
            >
              Back to Home
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-28 pb-20">

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-10 font-body text-xs tracking-wider">
          {(['cart', 'shipping', 'payment'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                step === s ? 'bg-[#C9A96E] text-white' :
                (step === 'shipping' && i === 0) || (step === 'payment' && i <= 1)
                  ? 'bg-[#4A8C6F] text-white' : 'bg-[#E5E0D8] text-[#9B9590]'
              }`}>{i + 1}</div>
              <span className={`uppercase hidden sm:inline ${step === s ? 'text-[#C9A96E]' : 'text-[#9B9590]'}`}>
                {s === 'cart' ? 'Cart' : s === 'shipping' ? 'Shipping' : 'Payment'}
              </span>
              {i < 2 && <ChevronRight size={14} className="text-[#C0BAB4]" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: CART ───────────────────────────────────────────────────── */}
        {step === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="font-display text-2xl text-[#2C2C2C] mb-6">Your Cart ({count})</h1>

              {items.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#E5E0D8] rounded-lg">
                  <ShoppingBag size={40} className="text-[#D0C9C0] mx-auto mb-3" />
                  <p className="font-body text-sm text-[#6B6560]">Your cart is empty</p>
                  <button onClick={() => navigate('/')} className="mt-4 font-body text-xs text-[#C9A96E] underline underline-offset-2">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => {
                      const pid = String((item.product as any)._id || item.product.id)
                      const price = item.product.discountedPrice || item.product.price || 0
                      return (
                        <motion.div
                          key={`${pid}-${item.size}-${item.color}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white border border-[#E5E0D8] rounded-lg p-4 flex gap-4"
                        >
                          <img
                            src={item.product.primaryImage}
                            alt={item.product.name}
                            className="w-24 h-32 object-cover rounded border border-[#E5E0D8] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <div>
                                <p className="font-body text-[10px] text-[#C9A96E] uppercase tracking-wider mb-0.5">
                                  {item.product.category}
                                </p>
                                <h3 className="font-display text-base text-[#2C2C2C]">{item.product.name}</h3>
                              </div>
                              <button
                                onClick={() => removeItem(pid, item.size, item.color)}
                                className="shrink-0 w-7 h-7 flex items-center justify-center text-[#9B9590] hover:text-[#C4705A] transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {item.size && (
                                <span className="font-body text-[11px] bg-[#F8F5F0] border border-[#E5E0D8] px-2 py-0.5 rounded text-[#6B6560]">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="font-body text-[11px] bg-[#F8F5F0] border border-[#E5E0D8] px-2 py-0.5 rounded text-[#6B6560]">
                                  {item.color}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              {/* Quantity stepper */}
                              <div className="flex items-center border border-[#E5E0D8] rounded overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(pid, item.size, item.color, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#6B6560] hover:bg-[#F8F5F0] transition-colors font-body text-base"
                                >−</button>
                                <span className="w-8 text-center font-body text-sm text-[#2C2C2C]">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(pid, item.size, item.color, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#6B6560] hover:bg-[#F8F5F0] transition-colors font-body text-base"
                                >+</button>
                              </div>
                              <div className="text-right">
                                {item.product.discountedPrice && (
                                  <p className="font-body text-[11px] text-[#9B9590] line-through">
                                    {fmt((item.product.price || 0) * item.quantity)}
                                  </p>
                                )}
                                <p className="font-body text-sm font-semibold text-[#2C2C2C]">
                                  {fmt(price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}

              {items.length > 0 && (
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 flex items-center gap-1.5 font-body text-xs text-[#6B6560] hover:text-[#C9A96E] transition-colors"
                >
                  <ArrowLeft size={13} /> Continue Shopping
                </button>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary />
              {items.length > 0 && (
                <button
                  onClick={() => setStep('shipping')}
                  className="w-full mt-4 font-body text-xs tracking-[0.15em] uppercase px-8 py-4 bg-[#2C2C2C] text-white hover:bg-[#C9A96E] transition-all duration-300 font-semibold"
                >
                  Proceed to Shipping
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: SHIPPING ───────────────────────────────────────────────── */}
        {step === 'shipping' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <button onClick={() => setStep('cart')} className="flex items-center gap-1.5 font-body text-xs text-[#6B6560] hover:text-[#C9A96E] mb-6 transition-colors">
                <ArrowLeft size={13} /> Back to Cart
              </button>
              <h1 className="font-display text-2xl text-[#2C2C2C] mb-6">Shipping Details</h1>

              <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field('name', 'Full Name', 'text', 'Priya Sharma')}
                  {field('phone', 'Mobile Number', 'tel', '9876543210')}
                </div>
                {field('email', 'Email Address', 'email', 'priya@example.com')}
                {field('address', 'Street Address', 'text', 'House No., Street, Area')}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {field('city', 'City', 'text', 'Mumbai')}
                  <div>
                    <label className="font-body text-[10px] tracking-[0.12em] uppercase text-[#6B6560] block mb-1.5">
                      State <span className="text-[#C4705A]">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, state: e.target.value }))
                        if (errors.state) setErrors((er) => ({ ...er, state: undefined }))
                      }}
                      className={`w-full border rounded px-4 py-3 font-body text-sm outline-none bg-white transition-colors ${
                        errors.state ? 'border-[#C4705A]' : 'border-[#D0C9C0] focus:border-[#C9A96E]'
                      }`}
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="font-body text-[11px] text-[#C4705A] mt-1">{errors.state}</p>}
                  </div>
                  {field('pincode', 'Pincode', 'text', '400001')}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary />
              <button
                onClick={() => { if (validate()) setStep('payment') }}
                className="w-full mt-4 font-body text-xs tracking-[0.15em] uppercase px-8 py-4 bg-[#2C2C2C] text-white hover:bg-[#C9A96E] transition-all duration-300 font-semibold"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PAYMENT ────────────────────────────────────────────────── */}
        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <button onClick={() => setStep('shipping')} className="flex items-center gap-1.5 font-body text-xs text-[#6B6560] hover:text-[#C9A96E] mb-6 transition-colors">
                <ArrowLeft size={13} /> Back to Shipping
              </button>
              <h1 className="font-display text-2xl text-[#2C2C2C] mb-6">Payment</h1>

              {/* Shipping summary pill */}
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-wider uppercase text-[#9B9590] mb-1">Delivering to</p>
                  <p className="font-body text-sm text-[#2C2C2C] font-medium">{form.name} · {form.phone}</p>
                  <p className="font-body text-xs text-[#6B6560]">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
                </div>
                <button onClick={() => setStep('shipping')} className="font-body text-[11px] text-[#C9A96E] underline underline-offset-2 shrink-0">Edit</button>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#E5E0D8] rounded-lg p-6 space-y-4">
                <p className="font-body text-[10px] tracking-[0.12em] uppercase text-[#6B6560] mb-3">Select Payment Method</p>
                <label className={`flex items-center gap-4 p-4 rounded border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#C9A96E] bg-[#FFF9F0]' : 'border-[#E5E0D8] hover:border-[#C9A96E]/50'}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-[#C9A96E]" />
                  <div>
                    <p className="font-body text-sm font-semibold text-[#2C2C2C]">Online Payment</p>
                    <p className="font-body text-[11px] text-[#9B9590]">UPI, Net Banking, Credit / Debit Card</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#C9A96E] bg-[#FFF9F0]' : 'border-[#E5E0D8] hover:border-[#C9A96E]/50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#C9A96E]" />
                  <div>
                    <p className="font-body text-sm font-semibold text-[#2C2C2C]">Cash on Delivery</p>
                    <p className="font-body text-[11px] text-[#9B9590]">Pay when your order arrives</p>
                  </div>
                </label>

                {paymentMethod === 'online' && (
                  <div className="mt-2 p-3 bg-[#F8F5F0] rounded border border-[#E5E0D8] text-center">
                    <p className="font-body text-xs text-[#9B9590]">
                      You'll be redirected to a secure payment gateway after placing the order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary />
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full mt-4 font-body text-xs tracking-[0.15em] uppercase px-8 py-4 bg-[#C9A96E] text-white hover:bg-[#B8985E] disabled:opacity-60 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                    </svg>
                    Placing Order...
                  </>
                ) : `Place Order · ${fmt(total)}`}
              </button>
              <p className="font-body text-[10px] text-center text-[#9B9590] mt-3">
                By placing your order you agree to our terms & conditions.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
