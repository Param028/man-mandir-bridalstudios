import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Video, Calendar } from 'lucide-react'

export default function BookAppointmentCTA() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#2C2C2C]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#1A1A1A] p-8 md:p-12 text-center md:text-left"
          >
            <Video className="w-12 h-12 text-[#C9A96E] mb-6 mx-auto md:mx-0" />
            <h3 className="font-display text-3xl text-white tracking-[0.06em] mb-4">
              Video Shopping
            </h3>
            <p className="font-body text-[#9B9590] mb-6 leading-relaxed">
              Experience personalized styling from the comfort of your home. Our experts will guide you through our collection via video call.
            </p>
            <Link
              to="/book-appointment?type=video"
              className="inline-block font-body text-xs tracking-[0.15em] uppercase px-8 py-3.5 bg-[#C9A96E] text-white hover:bg-[#B8985E] transition-colors duration-300"
            >
              Book Video Session
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1A1A1A] p-8 md:p-12 text-center md:text-left"
          >
            <Calendar className="w-12 h-12 text-[#C9A96E] mb-6 mx-auto md:mx-0" />
            <h3 className="font-display text-3xl text-white tracking-[0.06em] mb-4">
              E-Appointment
            </h3>
            <p className="font-body text-[#9B9590] mb-6 leading-relaxed">
              Visit our boutique for a personalized styling experience. Book your appointment online and skip the wait.
            </p>
            <Link
              to="/book-appointment"
              className="inline-block font-body text-xs tracking-[0.15em] uppercase px-8 py-3.5 border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white transition-colors duration-300"
            >
              Book Appointment
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="font-display text-2xl text-white tracking-[0.06em] mb-2">
            Available 24x7
          </p>
          <p className="font-body text-sm text-[#9B9590]">
            Personalized styling at your convenience
          </p>
        </motion.div>
      </div>
    </section>
  )
}
