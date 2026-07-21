import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'

const stores = [
  {
    id: 1,
    city: 'New Delhi',
    address: '42 Fashion Street, Lajpat Nagar',
    phone: '+91 98765 43210',
    email: 'delhi@manmandir.com',
    timings: '10:00 AM - 8:00 PM',
  },
  {
    id: 2,
    city: 'Mumbai',
    address: '15 Linking Road, Bandra West',
    phone: '+91 98765 43211',
    email: 'mumbai@manmandir.com',
    timings: '11:00 AM - 9:00 PM',
  },
]

export default function OurStores() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#F8F5F0]">
      <div className="max-w-[1440px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em] mb-12 text-center"
        >
          Our Stores
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-[#F5F0E8] p-8 border border-[#DDD6CC]"
            >
              <h3 className="font-display text-2xl text-[#2C2C2C] tracking-[0.06em] mb-6">
                {store.city}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-[#C9A96E] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-body text-[#2C2C2C]">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-[#C9A96E] flex-shrink-0" />
                  <a href={`tel:${store.phone}`} className="font-body text-[#C9A96E] hover:underline">
                    {store.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-[#C9A96E] flex-shrink-0" />
                  <a href={`mailto:${store.email}`} className="font-body text-[#C9A96E] hover:underline">
                    {store.email}
                  </a>
                </div>
                <div className="pt-4 border-t border-[#DDD6CC]">
                  <p className="font-body text-sm text-[#6B6560]">
                    <span className="font-medium">Timings:</span> {store.timings}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="font-body text-[#6B6560] mb-4">
            Visit our boutiques for a personalized styling experience
          </p>
          <a
            href="/book-appointment"
            className="inline-block font-body text-xs tracking-[0.15em] uppercase px-8 py-3.5 bg-[#C9A96E] text-white hover:bg-[#B8985E] transition-colors duration-300"
          >
            Book Appointment
          </a>
        </motion.div>
      </div>
    </section>
  )
}
