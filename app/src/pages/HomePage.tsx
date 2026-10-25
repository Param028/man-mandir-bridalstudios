import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroVideoSection from '@/components/home/HeroVideoSection'
import StudioIntroSection from '@/components/home/StudioIntroSection'
import PhotosOfWeekCarousel from '@/components/home/PhotosOfWeekCarousel'
import ShopByStyle from '@/components/home/ShopByStyle'
import TrendingStyles from '@/components/home/TrendingStyles'
import ShopByOccasion from '@/components/home/ShopByOccasion'
import CraftsmanshipHeritage from '@/components/home/CraftsmanshipHeritage'
import BookAppointmentCTA from '@/components/home/BookAppointmentCTA'
import CustomerStories from '@/components/home/CustomerStories'
import OurStores from '@/components/home/OurStores'
import SaleStrip from '@/components/home/SaleStrip'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SaleStrip variant="announcement" />
      <Navbar />
      <main>
        <HeroVideoSection />
        <StudioIntroSection />
        <SaleStrip variant="cards" />
        <ShopByStyle />
        <TrendingStyles />
        <ShopByOccasion />
        <PhotosOfWeekCarousel />
        <CraftsmanshipHeritage />
        <BookAppointmentCTA />
        <CustomerStories />
        <OurStores />
      </main>
      <Footer />
    </div>
  )
}
