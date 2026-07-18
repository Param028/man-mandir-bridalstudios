import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function StudioIntroSection() {
  return (
    <section id="story" className="bg-[#F5F0E8] py-24 md:py-32 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="/assets/studio-intro.jpg"
                alt="ManMandir Bridal Studio interior"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] block mb-5"
            >
              OUR STORY
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-display text-[28px] md:text-[40px] lg:text-[48px] text-[#2C2C2C] font-normal leading-[1.2] tracking-[0.02em] mb-6"
            >
              Crafting Dreams Since 1985
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-body text-[15px] md:text-base text-[#6B6560] leading-[1.7] max-w-[480px] mb-8"
            >
              For over three decades, ManMandir Bridal Studio has been the destination for brides who seek timeless elegance woven with modern artistry. Each piece in our collection is a labor of love — handcrafted by master artisans who have inherited techniques passed down through generations. From the intricate zardozi of our bridal lehengas to the delicate beadwork of our cocktail gowns, every stitch tells a story of dedication, heritage, and unparalleled craftsmanship.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                to="/book-appointment"
                className="inline-block font-body text-xs tracking-[0.15em] uppercase px-8 py-3.5 bg-[#C9A96E] text-white hover:bg-[#B8985E] transition-colors duration-300"
              >
                BOOK AN APPOINTMENT
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
