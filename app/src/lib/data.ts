export interface PhotoOfWeek {
  id: number
  title: string
  thumbnail: string
  images: GalleryItem[]
}

export interface GalleryItem {
  id: number
  type: 'image' | 'video'
  url: string
  caption?: string
}

export interface Product {
  id: number
  name: string
  category: string
  category_id?: string
  subcategory_id?: string
  primaryImage: string
  secondaryImage: string
  description: string
  order: number
  active: boolean
  price?: number
  discountedPrice?: number
  rating?: number
  isNew?: boolean
  isBestSeller?: boolean
  images?: string[]
  sizes?: { size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; stock: number }[]
  colors?: { name: string; hex: string; stock: number }[]
  fabricDetails?: { material: string; embroidery?: string; design?: string }
  careInstructions?: { washing?: string; dryClean?: string; storage?: string }
  designer?: string
  occasions?: ('Wedding' | 'Engagement' | 'Reception' | 'Haldi' | 'Mehendi')[]
}

export interface BookingSlot {
  id: number
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  amount: number
  notes?: string
  createdAt: string
}

export const photosOfWeek: PhotoOfWeek[] = [
  {
    id: 1,
    title: 'Royal Bridal Collection',
    thumbnail: '/assets/photo-week-1.jpg',
    images: [
      { id: 1, type: 'image', url: '/assets/gallery-detail-1.jpg', caption: 'Bridal lehenga on the throne' },
      { id: 2, type: 'image', url: '/assets/gallery-detail-2.jpg', caption: 'Getting ready with bridesmaids' },
      { id: 3, type: 'image', url: '/assets/gallery-detail-3.jpg', caption: 'Bridal beauty portrait' },
      { id: 4, type: 'image', url: '/assets/photo-week-1.jpg', caption: 'Full lehenga in courtyard' },
      { id: 5, type: 'image', url: '/assets/lehenga-primary.jpg', caption: 'Intricate embroidery detail' },
    ],
  },
  {
    id: 2,
    title: 'Golden Grace',
    thumbnail: '/assets/photo-week-2.jpg',
    images: [
      { id: 1, type: 'image', url: '/assets/photo-week-2.jpg', caption: 'Bridal jewelry detail' },
      { id: 2, type: 'image', url: '/assets/gallery-detail-3.jpg', caption: 'Traditional bridal makeup' },
      { id: 3, type: 'image', url: '/assets/gallery-detail-2.jpg', caption: 'Bridal preparation' },
    ],
  },
  {
    id: 3,
    title: 'Pink Paradise',
    thumbnail: '/assets/photo-week-3.jpg',
    images: [
      { id: 1, type: 'image', url: '/assets/photo-week-3.jpg', caption: 'Cocktail gown collection' },
      { id: 2, type: 'image', url: '/assets/cocktail-primary.jpg', caption: 'Blush pink evening wear' },
      { id: 3, type: 'image', url: '/assets/cocktail-secondary.jpg', caption: 'Beadwork detail' },
    ],
  },
  {
    id: 4,
    title: 'Emerald Elegance',
    thumbnail: '/assets/photo-week-4.jpg',
    images: [
      { id: 1, type: 'image', url: '/assets/photo-week-4.jpg', caption: 'Silk saree in garden' },
      { id: 2, type: 'image', url: '/assets/saree-primary.jpg', caption: 'Kanjeevaram draping' },
      { id: 3, type: 'image', url: '/assets/saree-secondary.jpg', caption: 'Saree pallu in motion' },
    ],
  },
  {
    id: 5,
    title: 'Ivory Fusion',
    thumbnail: '/assets/photo-week-5.jpg',
    images: [
      { id: 1, type: 'image', url: '/assets/photo-week-5.jpg', caption: 'Indo-western silhouette' },
      { id: 2, type: 'image', url: '/assets/indo-western-primary.jpg', caption: 'Modern anarkali jumpsuit' },
      { id: 3, type: 'image', url: '/assets/indo-western-secondary.jpg', caption: 'Back embroidery detail' },
    ],
  },
]

export const products: Product[] = [
  {
    id: 1,
    name: 'Royal Red Zardozi Lehenga',
    category: 'lehenga',
    primaryImage: '/assets/lehenga-primary.jpg',
    secondaryImage: '/assets/lehenga-secondary.jpg',
    description: 'Heavily embroidered bridal lehenga with gold zardozi work',
    order: 1,
    active: true,
    price: 185000,
    discountedPrice: 165000,
    rating: 5.0,
    isBestSeller: true,
    isNew: false,
    designer: 'Sabyasachi',
    occasions: ['Wedding'],
    images: [
      '/assets/lehenga-primary.jpg',
      '/assets/lehenga-secondary.jpg',
      '/assets/photo-week-1.jpg',
      '/assets/gallery-detail-1.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 0 },
      { size: 'S', stock: 2 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 3 },
      { size: 'XL', stock: 1 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [
      { name: 'Crimson Red', hex: '#B80F0A', stock: 5 },
      { name: 'Royal Maroon', hex: '#601010', stock: 3 },
      { name: 'Coral Rose', hex: '#E07A5F', stock: 0 }
    ],
    fabricDetails: {
      material: 'Pure Raw Silk',
      embroidery: 'Handcrafted zardozi, tilla, and dabka work with fine sequins and pearls.',
      design: 'Traditional panelled kalidaar skirt with a scalloped border dupatta.'
    },
    careInstructions: {
      washing: 'Do not wash. Avoid contact with liquids.',
      dryClean: 'Professional dry clean only. Wrap in muslin cloth.',
      storage: 'Store in a cool, dry place. Keep in a breathable cotton garment bag.'
    }
  },
  {
    id: 2,
    name: 'Blush Pink Sequin Gown',
    category: 'cocktail',
    primaryImage: '/assets/cocktail-primary.jpg',
    secondaryImage: '/assets/cocktail-secondary.jpg',
    description: 'Elegant cocktail gown with delicate sequin work',
    order: 1,
    active: true,
    price: 125000,
    rating: 4.9,
    isBestSeller: true,
    isNew: true,
    designer: 'Manish Malhotra',
    occasions: ['Reception', 'Engagement'],
    images: [
      '/assets/cocktail-primary.jpg',
      '/assets/cocktail-secondary.jpg',
      '/assets/photo-week-3.jpg',
      '/assets/gallery-detail-2.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 1 },
      { size: 'S', stock: 4 },
      { size: 'M', stock: 3 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 2 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [
      { name: 'Blush Pink', hex: '#F1C0B9', stock: 8 },
      { name: 'Champagne Gold', hex: '#F0E6D2', stock: 2 }
    ],
    fabricDetails: {
      material: 'Premium Tulle & Satin',
      embroidery: 'Intricate glass beadwork and micro-sequin embellishments.',
      design: 'A-line silhouette with a sheer illusion neckline and sweep train.'
    },
    careInstructions: {
      washing: 'Do not hand wash or machine wash.',
      dryClean: 'Gentle dry clean only. Protect embellishments during cleaning.',
      storage: 'Hang on padded hangers. Store in garment cover.'
    }
  },
  {
    id: 3,
    name: 'Crimson Kanjeevaram Saree',
    category: 'saree',
    primaryImage: '/assets/saree-primary.jpg',
    secondaryImage: '/assets/saree-secondary.jpg',
    description: 'Traditional silk saree with gold zari border',
    order: 1,
    active: true,
    price: 85000,
    discountedPrice: 78000,
    rating: 4.8,
    isBestSeller: true,
    isNew: false,
    designer: 'Tarun Tahiliani',
    occasions: ['Wedding', 'Engagement'],
    images: [
      '/assets/saree-primary.jpg',
      '/assets/saree-secondary.jpg',
      '/assets/photo-week-4.jpg',
      '/assets/gallery-detail-3.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 1 },
      { size: 'S', stock: 1 },
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 },
      { size: 'XXL', stock: 1 }
    ],
    colors: [
      { name: 'Crimson Gold', hex: '#9E1B32', stock: 4 },
      { name: 'Emerald Red', hex: '#5E1914', stock: 2 }
    ],
    fabricDetails: {
      material: '100% Pure Kanjeevaram Silk',
      embroidery: 'Authentic gold thread (zari) weaving throughout the body and pallu.',
      design: 'Mayil (peacock) and Chakra motifs woven beautifully into the borders.'
    },
    careInstructions: {
      washing: 'Strictly dry clean. Avoid spraying perfume directly on zari.',
      dryClean: 'Saree specialist dry cleaning only.',
      storage: 'Fold with clean paper inserts. Change fold lines periodically to avoid tearing.'
    }
  },
  {
    id: 4,
    name: 'Ivory Embroidered Jumpsuit',
    category: 'indo-western',
    primaryImage: '/assets/indo-western-primary.jpg',
    secondaryImage: '/assets/indo-western-secondary.jpg',
    description: 'Fusion silhouette with gold thread embroidery',
    order: 1,
    active: true,
    price: 65000,
    rating: 4.7,
    isBestSeller: false,
    isNew: true,
    designer: 'Anita Dongre',
    occasions: ['Haldi', 'Mehendi'],
    images: [
      '/assets/indo-western-primary.jpg',
      '/assets/indo-western-secondary.jpg',
      '/assets/photo-week-5.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 0 },
      { size: 'S', stock: 1 },
      { size: 'M', stock: 2 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [
      { name: 'Ivory White', hex: '#FFFFFA', stock: 3 }
    ],
    fabricDetails: {
      material: 'Georgette & Crepe',
      embroidery: 'Modern resham and zari floral threadwork.',
      design: 'Wide-legged jumpsuit styling with an attached embroidered cape.'
    },
    careInstructions: {
      washing: 'Dry clean recommended.',
      dryClean: 'Standard dry cleaning process.',
      storage: 'Keep folded in a dry wardrobe drawer or hung upright.'
    }
  },
  {
    id: 5,
    name: 'Emerald Elegance Silk Saree',
    category: 'saree',
    primaryImage: '/assets/photo-week-4.jpg',
    secondaryImage: '/assets/saree-primary.jpg',
    description: 'Rich emerald green silk saree with hand-crafted border',
    order: 2,
    active: true,
    price: 95000,
    rating: 4.9,
    isBestSeller: false,
    isNew: true,
    designer: 'Sabyasachi',
    occasions: ['Wedding', 'Reception'],
    images: [
      '/assets/photo-week-4.jpg',
      '/assets/saree-primary.jpg',
      '/assets/saree-secondary.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 1 },
      { size: 'S', stock: 1 },
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 },
      { size: 'XXL', stock: 1 }
    ],
    colors: [
      { name: 'Emerald Green', hex: '#004B49', stock: 5 }
    ],
    fabricDetails: {
      material: 'Pure Banarasi Katan Silk',
      embroidery: 'Hand-woven Kadwa zari border and buttis.',
      design: 'Floral creepers (Bel) and intricate pallu weaving.'
    },
    careInstructions: {
      washing: 'Do not wash at home.',
      dryClean: 'Dry clean only.',
      storage: 'Wrap in soft cotton cloth. Prevent direct light exposure.'
    }
  },
  {
    id: 6,
    name: 'Royal Velvet Lehenga',
    category: 'lehenga',
    primaryImage: '/assets/photo-week-1.jpg',
    secondaryImage: '/assets/lehenga-secondary.jpg',
    description: 'Majestic deep red velvet lehenga with royal court embroidery',
    order: 2,
    active: true,
    price: 210000,
    discountedPrice: 195000,
    rating: 5.0,
    isBestSeller: false,
    isNew: true,
    designer: 'Sabyasachi',
    occasions: ['Wedding'],
    images: [
      '/assets/photo-week-1.jpg',
      '/assets/lehenga-secondary.jpg',
      '/assets/lehenga-primary.jpg',
      '/assets/gallery-detail-1.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 0 },
      { size: 'S', stock: 1 },
      { size: 'M', stock: 3 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [
      { name: 'Velvet Red', hex: '#7A0010', stock: 6 }
    ],
    fabricDetails: {
      material: 'Premium Micro-Velvet',
      embroidery: 'Zardozi wire art, dabka, naqshi, and customized hand-sewn pearls.',
      design: 'Inspired by Mughal court arches and floral motifs.'
    },
    careInstructions: {
      washing: 'Strictly dry clean. Do not iron directly, use steam only.',
      dryClean: 'Specialist bridal dry cleaning only.',
      storage: 'Store stuffed with tissue paper in a large bridal box.'
    }
  },
  {
    id: 7,
    name: 'Pink Paradise Cocktail Gown',
    category: 'cocktail',
    primaryImage: '/assets/photo-week-3.jpg',
    secondaryImage: '/assets/cocktail-secondary.jpg',
    description: 'Sophisticated blush pink gown for glamorous cocktail evenings',
    order: 2,
    active: true,
    price: 110000,
    rating: 4.8,
    isBestSeller: true,
    isNew: false,
    designer: 'Manish Malhotra',
    occasions: ['Reception'],
    images: [
      '/assets/photo-week-3.jpg',
      '/assets/cocktail-secondary.jpg',
      '/assets/cocktail-primary.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 2 },
      { size: 'S', stock: 3 },
      { size: 'M', stock: 4 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 1 },
      { size: 'XXL', stock: 1 }
    ],
    colors: [
      { name: 'Paradise Pink', hex: '#E6A2B3', stock: 12 },
      { name: 'Blush Gold', hex: '#ECC4A8', stock: 1 }
    ],
    fabricDetails: {
      material: 'Imported Organza & Silk Crepe',
      embroidery: 'Handcrafted cutdana, swarovski crystals, and sequence embroidery.',
      design: 'Draped off-shoulder bodice with a structural thigh-high slit skirt.'
    },
    careInstructions: {
      washing: 'Do not wash.',
      dryClean: 'Premium dry clean only.',
      storage: 'Hang inside a soft canvas bag. Keep in dry environments.'
    }
  },
  {
    id: 8,
    name: 'Ivory Fusion Anarkali',
    category: 'indo-western',
    primaryImage: '/assets/photo-week-5.jpg',
    secondaryImage: '/assets/indo-western-secondary.jpg',
    description: 'Contemporary jacket-style Anarkali gown with floral thread work',
    order: 2,
    active: true,
    price: 75000,
    discountedPrice: 69999,
    rating: 4.6,
    isBestSeller: true,
    isNew: false,
    designer: 'Anita Dongre',
    occasions: ['Haldi', 'Mehendi'],
    images: [
      '/assets/photo-week-5.jpg',
      '/assets/indo-western-secondary.jpg',
      '/assets/indo-western-primary.jpg'
    ],
    sizes: [
      { size: 'XS', stock: 1 },
      { size: 'S', stock: 2 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 0 }
    ],
    colors: [
      { name: 'Ivory Gold', hex: '#FFFDD0', stock: 4 }
    ],
    fabricDetails: {
      material: 'Pure Silk Chanderi',
      embroidery: 'Hand-guided machine embroidery with delicate gota patti accents.',
      design: 'Anarkali flared style paired with an elegant sheer organza jacket.'
    },
    careInstructions: {
      washing: 'Dry clean only.',
      dryClean: 'Standard silk dry cleaning.',
      storage: 'Store folded with cotton lining sheets in a dry closet.'
    }
  }
]

export function getSlotsForDate(date: Date): BookingSlot[] {
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 3) return [] // Wednesday closed

  const slots: BookingSlot[] = []
  const hours = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
  const dateStr = date.toISOString().split('T')[0]

  // Deterministic "random" based on date
  const seed = date.getDate() + date.getMonth() * 31
  hours.forEach((startTime, i) => {
    const hour = parseInt(startTime.split(':')[0])
    const endHour = String(hour + 1).padStart(2, '0')
    // Pseudo-random booked slots
    const isBooked = ((seed + i * 7) % 5 === 0)
    slots.push({
      id: i + 1,
      date: dateStr,
      startTime,
      endTime: `${endHour}:00`,
      isBooked,
    })
  })
  return slots
}

export function getAvailabilityForDate(date: Date): 'full' | 'partial' | 'empty' | 'none' {
  const slots = getSlotsForDate(date)
  if (slots.length === 0) return 'none'
  const booked = slots.filter(s => s.isBooked).length
  if (booked === 0) return 'full'
  if (booked === slots.length) return 'empty'
  return 'partial'
}

export const mockBookings: Booking[] = [
  { id: 'BKG-001001', customerName: 'Priya Sharma', customerEmail: 'priya.s@gmail.com', customerPhone: '9876543210', date: '2024-12-18', time: '10:00 AM', status: 'confirmed', paymentStatus: 'paid', amount: 100, notes: 'Bridal lehenga consultation', createdAt: '2024-12-15T10:30:00Z' },
  { id: 'BKG-001002', customerName: 'Ananya Reddy', customerEmail: 'ananya.r@gmail.com', customerPhone: '8765432109', date: '2024-12-18', time: '02:00 PM', status: 'pending', paymentStatus: 'pending', amount: 100, createdAt: '2024-12-15T14:20:00Z' },
  { id: 'BKG-001003', customerName: 'Meera Patel', customerEmail: 'meera.p@gmail.com', customerPhone: '7654321098', date: '2024-12-19', time: '11:00 AM', status: 'confirmed', paymentStatus: 'paid', amount: 100, notes: 'Cocktail wear for reception', createdAt: '2024-12-14T09:15:00Z' },
  { id: 'BKG-001004', customerName: 'Sneha Gupta', customerEmail: 'sneha.g@gmail.com', customerPhone: '6543210987', date: '2024-12-20', time: '03:00 PM', status: 'confirmed', paymentStatus: 'paid', amount: 100, createdAt: '2024-12-13T16:45:00Z' },
  { id: 'BKG-001005', customerName: 'Divya Iyer', customerEmail: 'divya.i@gmail.com', customerPhone: '5432109876', date: '2024-12-21', time: '10:00 AM', status: 'pending', paymentStatus: 'pending', amount: 100, createdAt: '2024-12-16T08:30:00Z' },
  { id: 'BKG-001006', customerName: 'Kavya Nair', customerEmail: 'kavya.n@gmail.com', customerPhone: '4321098765', date: '2024-12-21', time: '04:00 PM', status: 'cancelled', paymentStatus: 'refunded', amount: 100, createdAt: '2024-12-12T11:00:00Z' },
  { id: 'BKG-001007', customerName: 'Riya Kapoor', customerEmail: 'riya.k@gmail.com', customerPhone: '3210987654', date: '2024-12-22', time: '12:00 PM', status: 'confirmed', paymentStatus: 'paid', amount: 100, notes: 'Saree selection for engagement', createdAt: '2024-12-11T13:20:00Z' },
  { id: 'BKG-001008', customerName: 'Tara Singh', customerEmail: 'tara.s@gmail.com', customerPhone: '2109876543', date: '2024-12-23', time: '11:00 AM', status: 'confirmed', paymentStatus: 'paid', amount: 100, createdAt: '2024-12-10T15:10:00Z' },
]

export const paymentRecords = mockBookings.map(b => ({
  id: `PAY-${b.id.replace('BKG-', '')}`,
  bookingId: b.id,
  razorpayOrderId: `order_${Math.random().toString(36).substring(2, 12)}`,
  razorpayPaymentId: b.paymentStatus === 'paid' ? `pay_${Math.random().toString(36).substring(2, 12)}` : '',
  amount: b.amount,
  status: b.paymentStatus,
  date: b.createdAt,
  verified: b.paymentStatus === 'paid',
}))
