import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube, Mail, Phone } from 'lucide-react'
import { useCategories } from '@/lib/api'
import { isSafeHttpUrl, usePublicSiteSettings } from '@/lib/siteSettings'

type FooterContent = {
  description?: string
  address?: string
  phone?: string
  email?: string
  copyright?: string
}

type SocialLinks = { instagram?: string; facebook?: string; youtube?: string; pinterest?: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export default function Footer() {
  const { data: settings } = usePublicSiteSettings()
  const { data: categories = [] } = useCategories()
  const footer = isRecord(settings?.footer) ? settings.footer as FooterContent : {}
  const social = isRecord(settings?.social_links) ? settings.social_links as SocialLinks : {}
  const socialItems = [
    { label: 'Instagram', href: social.instagram, Icon: Instagram },
    { label: 'Facebook', href: social.facebook, Icon: Facebook },
    { label: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter((item) => isSafeHttpUrl(item.href))
  const categoryLinks = (categories as Array<{ id: string; name: string; slug?: string; is_active?: boolean }>)
    .filter((category) => category.is_active !== false && category.name?.trim())
    .slice(0, 5)

  return (
    <footer className="bg-[#1A1A1A]">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 md:px-12 md:pt-20">
        <div className="grid grid-cols-1 gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <Link to="/" className="font-display text-2xl tracking-[0.08em] text-white">
              ManMandir
              <span className="mt-[-2px] block font-body text-[8px] uppercase tracking-[0.2em] text-[#C9C3BA]">Bridal Studio</span>
            </Link>
            {typeof footer.description === 'string' && footer.description.trim() && (
              <p className="mt-4 max-w-[280px] font-body text-sm leading-relaxed text-[#C9C3BA]">{footer.description}</p>
            )}
          </motion.div>

          <div>
            <h2 className="mb-5 font-body text-xs uppercase tracking-[0.15em] text-[#C9C3BA]">Shop</h2>
            <ul className="flex flex-col gap-3">
              <li><Link to="/products" className="font-body text-sm text-white/90 transition-colors hover:text-[#E0C58A]">All Collections</Link></li>
              {categoryLinks.map((category) => (
                <li key={category.id}><Link to={`/products?category=${encodeURIComponent(category.slug || category.id)}`} className="font-body text-sm text-white/90 transition-colors hover:text-[#E0C58A]">{category.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-body text-xs uppercase tracking-[0.15em] text-[#C9C3BA]">Visit</h2>
            <ul className="flex flex-col gap-3">
              <li><Link to="/" className="font-body text-sm text-white/90 transition-colors hover:text-[#E0C58A]">Home</Link></li>
              <li><Link to="/book-appointment" className="font-body text-sm text-white/90 transition-colors hover:text-[#E0C58A]">Book an appointment</Link></li>
            </ul>
            {typeof footer.address === 'string' && footer.address.trim() && (
              <p className="mt-5 whitespace-pre-line font-body text-sm leading-relaxed text-[#C9C3BA]">{footer.address}</p>
            )}
            {typeof footer.phone === 'string' && footer.phone.trim() && (
              <a href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`} className="mt-4 inline-flex items-center gap-2 font-body text-sm text-[#E0C58A] underline underline-offset-2"><Phone size={14} aria-hidden="true" />{footer.phone}</a>
            )}
            {typeof footer.email === 'string' && footer.email.trim() && (
              <a href={`mailto:${footer.email}`} className="mt-2 flex items-center gap-2 break-all font-body text-sm text-[#E0C58A] underline underline-offset-2"><Mail size={14} aria-hidden="true" />{footer.email}</a>
            )}
          </div>

          {socialItems.length > 0 && (
            <div>
              <h2 className="mb-5 font-body text-xs uppercase tracking-[0.15em] text-[#C9C3BA]">Follow</h2>
              <ul className="flex flex-col gap-4">
                {socialItems.map(({ label, href, Icon }) => (
                  <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#C9C3BA] transition-colors hover:text-[#E0C58A]"><Icon size={18} aria-hidden="true" /><span className="font-body text-sm text-white/90">{label}</span></a></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/15 py-6 text-center sm:flex-row sm:text-left">
          <p className="font-body text-xs text-[#C9C3BA]">© {new Date().getFullYear()} ManMandir Bridal Studio. {typeof footer.copyright === 'string' ? footer.copyright : 'All rights reserved.'}</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="font-body text-xs text-[#C9C3BA] underline underline-offset-2 hover:text-white">Privacy Policy</Link>
            <Link to="/products" className="font-body text-xs text-[#C9C3BA] underline underline-offset-2 hover:text-white">Shop collections</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
