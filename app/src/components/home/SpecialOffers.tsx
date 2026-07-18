import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Calendar } from 'lucide-react'

export default function SpecialOffers() {
  const navigate = useNavigate()

  return (
    <section id="special-offers" className="bg-white py-24 md:py-32 lg:py-36 border-t border-[#EDE6DA]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] block mb-3"
          >
            EXCLUSIVE PRIVILEGES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-[28px] md:text-[42px] text-[#2C2C2C] font-light tracking-[0.02em]"
          >
            Limited-Time Offers
          </motion.h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mt-6" />
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Offer 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative p-8 md:p-12 bg-[#F5F0E8] border border-[#C9A96E]/30 flex flex-col justify-between group overflow-hidden"
          >
            {/* Ambient Gold Overlay */}
            <div className="absolute inset-0 bg-[#C9A96E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#C9A96E] mb-6 shadow-xs">
                <Sparkles size={20} />
              </div>
              <span className="font-body text-[10px] tracking-[0.2em] text-[#C9A96E] uppercase font-semibold block mb-2">
                BRIDAL ENSEMBLE COMPLIANCE
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-[#2C2C2C] mb-4 font-normal tracking-[0.01em]">
                The Royal Trousseau Privilege
              </h3>
              <p className="font-body text-sm text-[#6B6560] leading-relaxed mb-8">
                Confirm your bespoke bridal lehenga consultation this month and receive a complimentary customized hair veil, matching handcrafted potli bag, and a private styling session with our creative director.
              </p>
            </div>

            <button
              onClick={() => navigate('/book-appointment')}
              className="self-start font-body text-xs tracking-[0.15em] uppercase px-6 py-3.5 bg-[#2C2C2C] text-white hover:bg-[#C9A96E] transition-all duration-300 font-medium"
            >
              CLAIM PRIVILEGE
            </button>
          </motion.div>

          {/* Offer 2 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative p-8 md:p-12 bg-[#EDE6DA] border border-[#C9A96E]/30 flex flex-col justify-between group overflow-hidden"
          >
            {/* Ambient Gold Overlay */}
            <div className="absolute inset-0 bg-[#C9A96E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#C9A96E] mb-6 shadow-xs">
                <Calendar size={20} />
              </div>
              <span className="font-body text-[10px] tracking-[0.2em] text-[#C9A96E] uppercase font-semibold block mb-2">
                PRE-ORDER EXCLUSIVE
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-[#2C2C2C] mb-4 font-normal tracking-[0.01em]">
                Summer Couture Showcase
              </h3>
              <p className="font-body text-sm text-[#6B6560] leading-relaxed mb-8">
                Enjoy a complimentary priority fitting and a 10% privilege discount on all pre-orders from our upcoming Gowns & Reception Wear collections. Perfect for bridesmaids and wedding guests.
              </p>
            </div>

            <button
              onClick={() => navigate('/book-appointment')}
              className="self-start font-body text-xs tracking-[0.15em] uppercase px-6 py-3.5 bg-transparent border border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all duration-300 font-medium"
            >
              BOOK CONSULTATION
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
