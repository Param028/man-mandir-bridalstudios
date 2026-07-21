import { motion } from 'framer-motion'

export default function CraftsmanshipHeritage() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#F8F5F0]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em] mb-6">
              Craftsmanship & Heritage
            </h2>
            <div className="space-y-4 text-[#6B6560] font-body leading-relaxed">
              <p>
                At ManMandir, every piece is a testament to India's rich textile heritage. Our artisans bring generations of expertise to create exquisite bridal couture that blends traditional craftsmanship with contemporary elegance.
              </p>
              <p>
                From intricate zardozi work to delicate hand embroidery, each garment tells a story of dedication and artistry. We source the finest fabrics from across the country - Banarasi silk from Varanasi, Chanderi from Madhya Pradesh, and pure georgette from Rajasthan.
              </p>
              <p>
                Our commitment to preserving traditional techniques while embracing modern design sensibilities has made us a trusted name for brides who seek authenticity without compromising on style.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-display text-3xl text-[#C9A96E] mb-2">25+</h3>
                <p className="font-body text-sm text-[#6B6560]">Years of Heritage</p>
              </div>
              <div>
                <h3 className="font-display text-3xl text-[#C9A96E] mb-2">150+</h3>
                <p className="font-body text-sm text-[#6B6560]">Master Artisans</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-[#EDE6DA] overflow-hidden">
              <img
                src="/assets/photo-week-1.jpg"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 border-2 border-[#C9A96E] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
