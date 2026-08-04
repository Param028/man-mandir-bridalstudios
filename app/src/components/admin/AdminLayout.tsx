import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Video, Image, Grid3X3, Calendar, CreditCard,
  Settings, LogOut, Menu, X, Bell, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

import { FolderTree } from 'lucide-react'

const navItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Video, label: 'Hero Video', path: '/admin/hero-video' },
  { icon: Image, label: 'Photos of Week', path: '/admin/photos-of-week' },
  { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  { icon: Grid3X3, label: 'Products', path: '/admin/products' },
  { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
  { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAdminAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const sidebarWidth = collapsed ? 'w-16' : 'w-[260px]'

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`p-6 ${collapsed ? 'px-3' : ''}`}>
        <Link to="/admin/dashboard" className={`font-display text-xl text-white tracking-[0.08em] ${collapsed ? 'text-center block' : ''}`}>
          {collapsed ? 'M' : 'ManMandir'}
          {!collapsed && (
            <span className="block font-body text-[7px] tracking-[0.2em] uppercase text-[#9B9590] mt-[-1px]">
              Bridal Studio
            </span>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
                isActive
                  ? 'bg-[rgba(201,169,110,0.15)] text-[#C9A96E] border-l-[3px] border-[#C9A96E]'
                  : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span className="font-body text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 mt-auto">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#A0A0A0] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span className="font-body text-sm">Collapse</span></>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#C4705A] transition-colors mt-1"
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-body text-sm">Sign Out</span>}
        </button>
      </div>
    </>
  )

  const pageTitles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/hero-video': 'Hero Video',
    '/admin/photos-of-week': 'Photos of the Week',
    '/admin/products': 'Products',
    '/admin/bookings': 'Bookings',
    '/admin/payments': 'Payments',
    '/admin/settings': 'Settings',
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-[#1A1A1A] z-50 transition-all duration-300 ${sidebarWidth}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-[#1A1A1A]/50 z-[999] lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-[280px] bg-[#1A1A1A] z-[1000] lg:hidden flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white">
              <X size={24} />
            </button>
            <div className="pt-12">
              <SidebarContent />
            </div>
          </aside>
        </>
      )}

      {/* Content Area */}
      <div className={`flex-1 min-h-screen transition-all duration-300 lg:ml-[260px] ${collapsed ? 'lg:ml-16' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E0D8] h-16 px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[#2C2C2C]">
              <Menu size={22} />
            </button>
            <h1 className="font-body text-lg font-medium text-[#2C2C2C]">
              {pageTitles[location.pathname] || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-[#6B6560] hover:text-[#2C2C2C] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C4705A] text-white text-[9px] rounded-full flex items-center justify-center font-body">
                2
              </span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center text-white font-body text-sm font-medium">
              M
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
