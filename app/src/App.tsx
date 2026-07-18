import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import HomePage from '@/pages/HomePage'
import GalleryPage from '@/pages/GalleryPage'
import BookingPage from '@/pages/BookingPage'
import BookingSuccessPage from '@/pages/BookingSuccessPage'
import ProductsPage from '@/pages/ProductsPage'
import CheckoutPage from '@/pages/CheckoutPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminHeroVideoPage from '@/pages/AdminHeroVideoPage'
import AdminPhotosPage from '@/pages/AdminPhotosPage'
import AdminGalleryManagerPage from '@/pages/AdminGalleryManagerPage'
import AdminProductsPage from '@/pages/AdminProductsPage'
import AdminBookingsPage from '@/pages/AdminBookingsPage'
import AdminPaymentsPage from '@/pages/AdminPaymentsPage'
import AdminSettingsPage from '@/pages/AdminSettingsPage'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { CartProvider } from '@/lib/cartContext'

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/gallery/:id" element={<GalleryPage />} />
        <Route path="/book-appointment" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/hero-video" element={<AdminHeroVideoPage />} />
          <Route path="/admin/photos-of-week" element={<AdminPhotosPage />} />
          <Route path="/admin/gallery/:id" element={<AdminGalleryManagerPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </CartProvider>
  )
}

export default App
