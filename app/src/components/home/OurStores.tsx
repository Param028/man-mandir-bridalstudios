import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { isSafeHttpUrl } from '@/lib/siteSettings'

type Store = {
  id: string
  name: string
  city: string | null
  address: string | null
  phone: string | null
  email: string | null
  timings: string | null
  maps_url: string | null
  display_order: number
}

export default function OurStores() {
  const [stores, setStores] = useState<Store[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data, error } = await supabase
        .from('store')
        .select('id,name,city,address,phone,email,timings,maps_url,display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) {
        console.error('Unable to load active stores:', error)
        if (mounted) setLoaded(true)
        return
      }
      if (mounted) {
        setStores(data ?? [])
        setLoaded(true)
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  if (!loaded || stores.length === 0) return null

  return (
    <section className="bg-[#F8F5F0] px-6 py-20 md:px-12" aria-labelledby="our-stores-title">
      <div className="mx-auto max-w-[1440px]">
        <motion.h2
          id="our-stores-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center font-display text-4xl tracking-[0.06em] text-[#2C2C2C] md:text-5xl"
        >
          Our Stores
        </motion.h2>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {stores.map((store, index) => (
            <motion.article
              key={store.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-[#DDD6CC] bg-[#F5F0E8] p-8"
            >
              <h3 className="mb-6 font-display text-2xl tracking-[0.04em] text-[#2C2C2C]">
                {[store.name, store.city].filter(Boolean).join(' · ')}
              </h3>
              <div className="space-y-4">
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} aria-hidden="true" className="mt-1 shrink-0 text-[#8C7045]" />
                    <div>
                      <p className="whitespace-pre-line font-body text-[#2C2C2C]">{store.address}</p>
                      {isSafeHttpUrl(store.maps_url) && (
                        <a href={store.maps_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-body text-sm text-[#6B4F1D] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6B4F1D]">
                          Directions <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} aria-hidden="true" className="shrink-0 text-[#8C7045]" />
                    <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="font-body text-[#6B4F1D] underline underline-offset-2">{store.phone}</a>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} aria-hidden="true" className="shrink-0 text-[#8C7045]" />
                    <a href={`mailto:${store.email}`} className="break-all font-body text-[#6B4F1D] underline underline-offset-2">{store.email}</a>
                  </div>
                )}
                {store.timings && <p className="border-t border-[#DDD6CC] pt-4 font-body text-sm text-[#514B46]">{store.timings}</p>}
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/book-appointment" className="inline-block bg-[#6B4F1D] px-8 py-3.5 font-body text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#51401F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B4F1D]">
            Book Appointment
          </Link>
        </div>
      </div>
    </section>
  )
}
