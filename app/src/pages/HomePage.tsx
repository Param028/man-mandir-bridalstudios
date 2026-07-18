import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroVideoSection from '@/components/home/HeroVideoSection'
import PhotosOfWeekCarousel from '@/components/home/PhotosOfWeekCarousel'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import StudioIntroSection from '@/components/home/StudioIntroSection'
import NewArrivals from '@/components/home/NewArrivals'
import BestSellers from '@/components/home/BestSellers'
import SpecialOffers from '@/components/home/SpecialOffers'
import Testimonials from '@/components/home/Testimonials'

export default function HomePage() {
  const location = useLocation()

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const id = (location.state as any).scrollTo
      const timer = setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [location])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroVideoSection />
        <CategoryShowcase />
        <NewArrivals />
        <BestSellers />
        <SpecialOffers />
        <PhotosOfWeekCarousel />
        <StudioIntroSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
