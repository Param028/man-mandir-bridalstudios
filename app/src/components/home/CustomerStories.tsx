import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'My bridal lehenga from ManMandir was absolutely stunning. The craftsmanship was impeccable, and I received so many compliments. The team made the entire experience so special.',
    image: '/assets/photo-week-1.jpg',
  },
  {
    id: 2,
    name: 'Ananya Patel',
    location: 'Mumbai',
    rating: 5,
    text: 'I found my dream wedding saree here. The personalized service and attention to detail was remarkable. The video shopping feature was so convenient!',
    image: '/assets/photo-week-2.jpg',
  },
  {
    id: 3,
    name: 'Meera Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'The cocktail gown I wore for my reception was perfect. The fit was custom-tailored and the quality exceeded my expectations. Highly recommend!',
    image: '/assets/photo-week-3.jpg',
  },
]

export default function CustomerStories() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F5F0E8]">
      <div className="max-w-[1440px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl text-[#2C2C2C] tracking-[0.06em] mb-12 text-center"
        >
          Customer Stories
        </motion.h2>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-[#F8F5F0] p-8 md:p-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="aspect-square bg-[#EDE6DA] overflow-hidden">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-[#C9A96E] text-[#C9A96E]" />
                    ))}
                  </div>
                  <p className="font-body text-[#6B6560] text-lg leading-relaxed mb-6 italic">
                    "{testimonials[currentIndex].text}"
                  </p>
                  <div>
                    <h4 className="font-display text-xl text-[#2C2C2C] tracking-[0.06em]">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="font-body text-sm text-[#9B9590]">
                      {testimonials[currentIndex].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 flex items-center justify-center border border-[#DDD6CC] text-[#2C2C2C] hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-white transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? 'bg-[#C9A96E]' : 'bg-[#DDD6CC]'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 flex items-center justify-center border border-[#DDD6CC] text-[#2C2C2C] hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-white transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
