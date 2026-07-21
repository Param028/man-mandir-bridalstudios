import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cartContext'

const NAV_LINKS = [
  { label: 'BRIDAL', href: '/bridal' },
  { label: 'SAREES', href: '/sarees' },
  { label: 'LEHENGAS', href: '/lehengas' },
  { label: 'SHOP BY OCCASION', href: '/products' },
  { label: 'BESTSELLERS', href: '/products?sort=bestsellers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { count } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('/')) {
      navigate(href)
    } else {
      const id = href.replace('/#', '')
      if (isHome) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/', { state: { scrollTo: id } })
      }
    }
  }

  const isTransparent = isHome && !scrolled

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[1000] h-[72px] transition-all duration-300 ease-out ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-[rgba(245,240,232,0.92)] backdrop-blur-[12px] border-b border-[#DDD6CC]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 md:px-12 relative">
          {/* Left Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className={`font-body text-[13px] tracking-[0.18em] uppercase transition-colors duration-300 hover:text-[#C9A96E] relative group ${
                  isTransparent ? 'text-white' : 'text-[#2C2C2C]'
                }`}
              >
                {link.label}
                <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Center Logo */}
          <Link
            to="/"
            className={`absolute left-1/2 -translate-x-1/2 font-display text-2xl md:text-3xl tracking-[0.08em] font-light transition-colors duration-300 ${
              isTransparent ? 'text-white' : 'text-[#2C2C2C]'
            }`}
          >
            ManMandir
            <span className="block text-center font-body text-[8px] tracking-[0.2em] uppercase mt-[-2px] opacity-70">
              Bridal Studio
            </span>
          </Link>

          {/* Right Nav Links + CTA - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`relative transition-colors duration-300 hover:text-[#C9A96E] ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {/* User Account Icon */}
            <button
              className={`relative transition-colors duration-300 hover:text-[#C9A96E] ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Account"
            >
              <User size={20} />
            </button>
            {/* Wishlist Icon */}
            <button
              className={`relative transition-colors duration-300 hover:text-[#C9A96E] ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </button>
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/checkout')}
              className={`relative transition-colors duration-300 hover:text-[#C9A96E] ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-[#C9A96E] text-white font-body text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-1">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            <Link
              to="/book-appointment"
              className={`font-body text-[11px] tracking-[0.15em] uppercase px-6 py-2.5 border transition-all duration-300 hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-white ${
                isTransparent
                  ? 'border-white/80 text-white'
                  : 'border-[#C9A96E] text-[#C9A96E]'
              }`}
            >
              BOOK APPOINTMENT
            </Link>
          </div>

          {/* Mobile: Cart icon + Hamburger */}
          <div className="lg:hidden absolute right-4 flex items-center gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className={`relative transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] min-h-[18px] bg-[#C9A96E] text-white font-body text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-1">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`relative transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#1A1A1A]/50 z-[999] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 w-[280px] h-full bg-[#F5F0E8] z-[1001] lg:hidden py-8 px-6"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 text-[#2C2C2C]"
              >
                <X size={24} />
              </button>
              <div className="mt-16 flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-base text-[#2C2C2C] hover:text-[#C9A96E] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#DDD6CC]">
                  <button className="text-[#2C2C2C] hover:text-[#C9A96E] transition-colors">
                    <Search size={20} />
                  </button>
                  <button className="text-[#2C2C2C] hover:text-[#C9A96E] transition-colors">
                    <User size={20} />
                  </button>
                  <button className="text-[#2C2C2C] hover:text-[#C9A96E] transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
                <Link
                  to="/book-appointment"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 font-body text-xs tracking-[0.15em] uppercase px-6 py-3 bg-[#C9A96E] text-white text-center border border-[#C9A96E]"
                >
                  BOOK APPOINTMENT
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 font-body text-xs tracking-[0.15em] uppercase px-6 py-3 border border-[#2C2C2C] text-[#2C2C2C] text-center flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} /> CART {count > 0 && `(${count})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
