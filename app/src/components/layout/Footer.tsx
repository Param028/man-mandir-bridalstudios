import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube } from 'lucide-react'

const designerWearLinks = [
  { label: 'Bridal Lehengas', href: '/lehengas' },
  { label: 'Bridal Sarees', href: '/sarees' },
  { label: 'Cocktail Gowns', href: '/products?category=cocktail' },
  { label: 'Indo Western', href: '/products?category=indo-western' },
  { label: 'Wedding Sherwanis', href: '/products?category=sherwani' },
]

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Buying Guide', href: '/buying-guide' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Returns & Exchanges', href: '/returns' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-20 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo Column */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <Link to="/" className="font-display text-2xl text-white tracking-[0.08em]">
              ManMandir
              <span className="block font-body text-[8px] tracking-[0.2em] uppercase text-[#A0A0A0] mt-[-2px]">
                Bridal Studio
              </span>
            </Link>
            <p className="font-body text-sm text-[#9B9590] mt-4 max-w-[280px] leading-relaxed">
              Where Every Bride's Dream Comes True
            </p>
          </motion.div>

          {/* Designer Wear Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] mb-6">
              DESIGNER WEAR
            </h4>
            <ul className="flex flex-col gap-3">
              {designerWearLinks.map((link) => (
                <li key={link.label} className="w-fit">
                  <Link to={link.href} className="font-body text-sm text-white/90 hover:text-[#C9A96E] transition-colors duration-300 relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-[#C9A96E] after:transition-transform after:duration-300 hover:after:scale-x-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] mb-6">
              QUICK LINKS
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.label} className="w-fit">
                  <Link to={link.href} className="font-body text-sm text-white/90 hover:text-[#C9A96E] transition-colors duration-300 relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-[#C9A96E] after:transition-transform after:duration-300 hover:after:scale-x-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] mb-6">
              CONTACT INFO
            </h4>
            <p className="font-body text-sm text-white/90 leading-[1.7] mb-3">
              ManMandir Bridal Studio<br />
              42 Fashion Street, Lajpat Nagar<br />
              New Delhi — 110024
            </p>
            <a href="tel:+919876543210" className="font-body text-sm text-[#C9A96E] hover:underline block mb-1">
              +91 98765 43210
            </a>
            <a href="mailto:hello@manmandir.com" className="font-body text-sm text-[#C9A96E] hover:underline block mb-5">
              hello@manmandir.com
            </a>
          </motion.div>

          {/* Social Media */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#9B9590] mb-6">
              FOLLOW US
            </h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-[#9B9590] hover:text-[#C9A96E] transition-colors duration-300 flex items-center gap-2">
                <Instagram size={20} />
                <span className="font-body text-sm text-white/90">Instagram</span>
              </a>
              <a href="#" className="text-[#9B9590] hover:text-[#C9A96E] transition-colors duration-300 flex items-center gap-2">
                <Facebook size={20} />
                <span className="font-body text-sm text-white/90">Facebook</span>
              </a>
              <a href="#" className="text-[#9B9590] hover:text-[#C9A96E] transition-colors duration-300 flex items-center gap-2">
                <Youtube size={20} />
                <span className="font-body text-sm text-white/90">YouTube</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-[#9B9590]">
            © 2024 ManMandir Bridal Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="font-body text-xs text-[#9B9590] hover:text-white transition-colors relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-[#C9A96E] after:transition-transform after:duration-300 hover:after:scale-x-100">Privacy Policy</a>
            <span className="text-[#9B9590]">|</span>
            <a href="#" className="font-body text-xs text-[#9B9590] hover:text-white transition-colors relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-[#C9A96E] after:transition-transform after:duration-300 hover:after:scale-x-100">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
