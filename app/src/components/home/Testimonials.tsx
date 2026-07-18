import { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Delhi',
    review: 'My wedding lehenga from ManMandir was a dream come true. The zardozi work was so intricate and I received endless compliments. The team was incredibly helpful during the fittings!',
    rating: 5,
    image: '/assets/gallery-detail-3.jpg',
  },
  {
    id: 2,
    name: 'Ananya Reddy',
    location: 'Hyderabad',
    review: "We got my reception gown and sister's saree from here. Exceptional quality and designs that you won't find anywhere else. The staff makes you feel so special.",
    rating: 5,
    image: '/assets/gallery-detail-2.jpg',
  },
  {
    id: 3,
    name: 'Meera Patel',
    location: 'Mumbai',
    review: 'I was looking for a specific blend of modern and traditional for my wedding saree. The Kanjeevaram collection here is absolutely exquisite. Thank you for making my big day perfect!',
    rating: 5,
    image: '/assets/gallery-detail-1.jpg',
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    location: 'Bangalore',
    review: 'Best bridal boutique in town. Their custom fitting and attention to detail is unmatched. I recommend them to every bride-to-be! Worth every rupee.',
    rating: 5,
    image: '/assets/studio-intro.jpg',
  },
]

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Auto-advance
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => emblaApi.scrollNext(), 6000)
    return () => clearInterval(interval)
  }, [emblaApi])

  return (
    <section id="testimonials" className="bg-[#EDE6DA] py-24 md:py-32 lg:py-36 border-t border-[#E5E0D8]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 px-4">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] block mb-3"
          >
            WORDS FROM OUR BRIDES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-[28px] md:text-[42px] text-[#2C2C2C] font-light tracking-[0.02em]"
          >
            Customer Testimonials
          </motion.h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mt-6" />
        </div>

        {/* Carousel Area */}
        <div className="relative group px-4 md:px-12">
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="hidden lg:flex absolute left-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-[#C9A96E] items-center justify-center text-[#C9A96E] bg-white hover:bg-[#C9A96E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xs"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-[#C9A96E] items-center justify-center text-[#C9A96E] bg-white hover:bg-[#C9A96E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xs"
          >
            <ChevronRight size={20} />
          </button>

          {/* Embla Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 md:gap-8 px-4 md:px-8">
              {reviews.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex-none w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] bg-white border border-[#E5E0D8] p-6 md:p-8 flex flex-col justify-between shadow-card hover:shadow-md transition-shadow duration-300 relative rounded-sm"
                >
                  {/* Decorative Quote Icon */}
                  <div className="absolute top-6 right-6 text-[#C9A96E]/20">
                    <Quote size={40} className="stroke-[1.5]" />
                  </div>

                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-5">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={13}
                          className="fill-[#C9A96E] text-[#C9A96E]"
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="font-body text-sm text-[#6B6560] italic leading-relaxed mb-6">
                      "{item.review}"
                    </p>
                  </div>

                  {/* Customer Profile */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F5F0E8]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C9A96E]/40 bg-[#F5F0E8] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-[#2C2C2C] tracking-[0.01em]">
                        {item.name}
                      </h4>
                      <span className="font-body text-[10px] tracking-[0.1em] text-[#9B9590] uppercase block mt-0.5">
                        Bride from {item.location}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
