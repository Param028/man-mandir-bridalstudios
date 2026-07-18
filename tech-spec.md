# ManMandir Bridal Studio — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.0 | Framework, App Router, SSR, API routes |
| react | ^19.0 | UI library |
| react-dom | ^19.0 | React DOM renderer |
| typescript | ^5.6 | Type safety |
| tailwindcss | ^3.4 | Utility-first styling |
| @tailwindcss/typography | ^0.5 | Typography plugin |
| @radix-ui/react-* | latest | Accessible UI primitives (shadcn/ui foundation) |
| @radix-ui/react-dialog | ^1.1 | Accessible dialog/modal primitive |
| @radix-ui/react-toast | ^1.2 | Accessible toast notifications |
| @radix-ui/react-select | ^2.1 | Accessible select dropdown |
| @radix-ui/react-switch | ^1.1 | Accessible toggle switch |
| @radix-ui/react-checkbox | ^1.1 | Accessible checkbox |
| @radix-ui/react-slot | ^1.1 | Polymorphic component primitive |
| @radix-ui/react-tooltip | ^1.1 | Accessible tooltip |
| @radix-ui/react-label | ^2.1 | Accessible form labels |
| @radix-ui/react-tabs | ^1.1 | Accessible tab interface |
| class-variance-authority | ^0.7 | Component variant API (shadcn dep) |
| clsx | ^2.1 | Conditional classnames (shadcn dep) |
| tailwind-merge | ^2.5 | Merge Tailwind classes (shadcn dep) |
| lucide-react | ^0.460 | Icon library |
| framer-motion | ^11.11 | React-native animations, scroll-triggered reveals, transitions |
| embla-carousel-react | ^8.3 | Lightweight, highly customizable carousel engine |
| react-day-picker | ^9.0 | Month-view calendar for booking date selection |
| react-hook-form | ^7.53 | Type-safe form management |
| @hookform/resolvers | ^3.9 | Zod resolver for react-hook-form |
| zod | ^3.23 | Type-safe form validation schema |
| recharts | ^2.13 | Dashboard revenue chart |
| drizzle-orm | ^0.36 | Type-safe SQL ORM |
| @neondatabase/serverless | ^0.10 | PostgreSQL serverless driver (Neon) |
| bcryptjs | ^2.4 | Password hashing (bcrypt for admin) |
| @types/bcryptjs | ^2.4 | TypeScript types for bcryptjs |
| jose | ^5.9 | JWT creation/verification (lighter than jsonwebtoken) |
| razorpay | ^2.9 | Razorpay payment gateway SDK |
| resend | ^4.0 | Transactional email service |
| uuid | ^10.0 | UUID generation for filenames |
| @types/uuid | ^10.0 | TypeScript types for uuid |
| date-fns | ^4.0 | Date formatting and manipulation |
| @dnd-kit/core | ^6.1 | Drag-and-drop primitives (Photos of Week reordering) |
| @dnd-kit/sortable | ^8.0 | Sortable list (Photos of Week, Gallery reorder) |
| @dnd-kit/utilities | ^3.2 | DnD utilities |

**Dev Dependencies**: @types/node, @types/react, @types/react-dom, eslint, eslint-config-next, postcss, autoprefixer, drizzle-kit, tsx

**Fonts** (loaded via next/font/google): Cormorant Garamond (display), Inter (body/UI), JetBrains Mono (admin monospace)

---

## Component Inventory

### shadcn/ui Components

These provide accessible, unstyled primitives that are themed via the design system:

| Component | Source | Usage |
|-----------|--------|-------|
| Button | `npx shadcn add button` | All buttons (public CTAs, admin actions). Extended with outlined/filled/ghost variants matching design spec. |
| Card | `npx shadcn add card` | Admin stat cards, content cards, booking summary. |
| Dialog | `npx shadcn add dialog` | Modals (add/edit forms, delete confirmation, coming soon, view booking). |
| Input | `npx shadcn add input` | All text inputs (login, booking form, admin forms). Extended with icon support and dark variant. |
| Textarea | `npx shadcn add textarea` | Booking notes, product description, studio address. |
| Select | `npx shadcn add select` | Category selector, status filter, payment filter, day range. |
| Switch | `npx shadcn add switch` | Active/inactive toggle on cards and forms. |
| Checkbox | `npx shadcn add checkbox` | "Initiate refund" checkbox in cancel dialog. |
| Table | `npx shadcn add table` | Admin bookings table, payments table. Extended with sorting, pagination, row actions. |
| Tabs | `npx shadcn add tabs` | Products management (4 category tabs). |
| Toast | `npx shadcn add toast` | Global toast notifications (success, error, info). |
| Tooltip | `npx shadcn add tooltip` | Calendar day hover ("CLOSED" for Wednesdays), truncated table cells. |
| Label | `npx shadcn add label` | Form field labels throughout. |
| Skeleton | `npx shadcn add skeleton` | Loading states for admin table rows, dashboard stats. |

### Custom Components (Public)

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `components/layout/Navbar.tsx` | Fixed header with transparent→cream scroll transition, centered logo, nav links, mobile hamburger drawer. |
| Footer | `components/layout/Footer.tsx` | Dark multi-column footer with logo, links, contact, social icons. |
| HeroVideoSection | `components/home/HeroVideoSection.tsx` | Full-viewport video with overlay text, poster fade, mute toggle, pagination dots. |
| PhotosOfWeekCarousel | `components/home/PhotosOfWeekCarousel.tsx` | Embla-powered horizontal carousel with navigation arrows, snap physics, auto-advance. |
| PhotoCard | `components/home/PhotoCard.tsx` | 3:4 portrait card with image, title, hover scale + gold border. |
| CategoryShowcase | `components/home/CategoryShowcase.tsx` | 4-column grid of CategoryCards with section header. |
| CategoryCard | `components/home/CategoryCard.tsx` | Signature hover-reveal: primary image fades out, secondary fades in + scale parallax. Mobile: scroll-triggered auto-swap via IntersectionObserver. |
| StudioIntroSection | `components/home/StudioIntroSection.tsx` | Editorial 55/45 split: image left, label + heading + body + CTA right. |
| ImageReveal | `components/shared/ImageReveal.tsx` | Reusable parallax-like hover image swap (primary→secondary) used by CategoryCard. |
| AnimatedHeading | `components/shared/AnimatedHeading.tsx` | Scroll-triggered fade-up text reveal (opacity + translateY) using Framer Motion whileInView. |
| SectionHeader | `components/shared/SectionHeader.tsx` | Centered label + optional title pattern. |
| GalleryLightbox | `components/shared/GalleryLightbox.tsx` | Full-screen media viewer with prev/next, close, counter, keyboard/swipe navigation. AnimatePresence enter/exit. |
| VideoPlayer | `components/shared/VideoPlayer.tsx` | Custom HTML5 video with play/pause/mute controls. |
| CalendarGrid | `components/booking/CalendarGrid.tsx` | Custom month calendar with availability dots, Wednesday blocking, past/future range enforcement. Built on react-day-picker with heavy styling override. |
| SlotPicker | `components/booking/SlotPicker.tsx` | 3-column time slot grid with available/booked/selected states, urgency banner. |
| BookingForm | `components/booking/BookingForm.tsx` | Customer details form (name, email, phone, notes) with Zod validation, character counter. |
| RazorpayCheckout | `components/booking/RazorpayCheckout.tsx` | Razorpay embed initialization, payment handler, verification POST, success/error handling. |
| BookingConfirmation | `components/booking/BookingConfirmation.tsx` | Success state with booking details card, next steps, CTA buttons. |
| StepIndicator | `components/booking/StepIndicator.tsx` | 4-step horizontal progress (date→time→details→payment) with circle states and connecting lines. |

### Custom Components (Admin)

| Component | File | Description |
|-----------|------|-------------|
| AdminLayout | `components/admin/AdminLayout.tsx` | Sidebar (260px/64px collapsed) + content area with sticky top bar. Sidebar navigation with active states. |
| AdminSidebar | `components/admin/AdminSidebar.tsx` | Dark sidebar with logo, navigation links, collapse toggle, logout. |
| TopBar | `components/admin/TopBar.tsx` | Sticky header with dynamic page title, notification bell (polling every 30s), admin avatar menu. |
| NotificationBell | `components/admin/NotificationBell.tsx` | Bell icon with unread badge count, dropdown with booking notification list. |
| StatCard | `components/admin/StatCard.tsx` | Dashboard metric card with icon, value, label, change indicator. |
| DataTable | `components/admin/DataTable.tsx` | Sortable, filterable, paginated table. Reused for bookings and payments. Extends shadcn Table. |
| StatusBadge | `components/admin/StatusBadge.tsx` | Pill-shaped badge with semantic colors (success/error/warning/pending). Used in tables. |
| FileUploader | `components/admin/FileUploader.tsx` | Drag-and-drop zone with file type validation, progress bar, preview. Supports single and multiple files. |
| VideoUploader | `components/admin/VideoUploader.tsx` | Dedicated video upload with preview, poster generation, file size validation. |
| SortableGrid | `components/admin/SortableGrid.tsx` | DnDKit-powered sortable card grid for Photos of Week and Gallery reordering. |
| InlineEdit | `components/admin/InlineEdit.tsx` | Click-to-edit inline text input (Escape to cancel, Enter to save). Used for gallery captions. |
| FilterBar | `components/admin/FilterBar.tsx` | Reusable filter row: search input, date presets, status dropdowns, export CSV button. |

---

## Animation Implementation

| Animation | Library | Implementation | Complexity |
|-----------|---------|---------------|------------|
| **Page load fade** | Framer Motion | `motion.div` with initial={{opacity:0}} animate={{opacity:1}} on layout wrapper. 0.6s ease-out. | Low |
| **Section heading reveal** | Framer Motion | `whileInView` on AnimatedHeading: opacity 0→1, y 30→0. threshold 0.2, 0.7s cubic-bezier(0.25,0.1,0.25,1). | Low |
| **Section content stagger** | Framer Motion | Parent `motion.div` with `staggerChildren: 0.1`, children `motion.div` with fade-up. Delay start 0.2s after heading. | Low |
| **Image fade-in on scroll** | Framer Motion | `whileInView` on images: opacity 0→1, scale 1.02→1. 0.8s ease-out. Combined with next/image blur placeholder. | Low |
| **Navbar scroll transformation** | React state + CSS | `useScroll` hook or scroll listener toggles class at >100px. CSS transition: background, backdrop-filter, border, color. 0.3s ease. | Low |
| **Hero text stagger reveal** | Framer Motion | H1/tagline/CTA as motion.div with staggered delays (0.3s, 0.5s, 0.7s), fade-up. | Low |
| **Poster→video crossfade** | CSS/Framer Motion | Poster div opacity 1→0 on canplaythrough event. 0.4s CSS transition. | Low |
| **Hero video crossfade (dot click)** | Framer Motion | AnimatePresence with outgoing opacity 1→0 (0.6s), incoming opacity 0→1 (0.6s, delay 0.3s). | Medium |
| **Category card hover-reveal** | CSS | Absolute-positioned images. Primary: opacity transition 0.5s. Secondary: opacity 0→1 + scale 1.05→1 transition 0.5s/0.8s. Label translateY(0→-4px). All via CSS group-hover. **Critical: secondary image preloaded with loading="eager" or `<link rel="preload">` to prevent flicker.** | Medium |
| **Category card mobile scroll-reveal** | Framer Motion + IO | `whileInView` triggers class toggle that applies same CSS transitions as hover. One-shot, reverts on scroll away. | Medium |
| **Carousel snap physics** | Embla Carousel | Embla's built-in snap with spring-like feel. `dragFree: false`, loop optional. | Low |
| **Carousel card hover** | CSS | Image scale 1→1.04, 0.5s. Gold border fade-in 0.3s. | Low |
| **Lightbox enter/exit** | Framer Motion | AnimatePresence: backdrop opacity 0→0.95, content scale 0.95→1. Spring damping:25 stiffness:120. | Medium |
| **Toast slide-in/out** | Framer Motion | AnimatePresence: translateX(120%→0) enter, translateX(0→120%) exit. 0.3s ease-out. Auto-dismiss 4s. | Low |
| **Modal entry/exit** | Framer Motion | Overlay opacity 0→0.6, content scale 0.95→1 + opacity 0→1. 0.2s ease-out. Exit reverse 0.15s. | Low |
| **Mobile nav drawer** | Framer Motion | AnimatePresence: translateX(100%→0) panel, backdrop opacity 0→0.5. 0.3s ease. | Low |
| **Booking step transitions** | Framer Motion | AnimatePresence with exit-left/enter-right slide + crossfade between steps. | Medium |
| **Form validation shake** | Framer Motion | translateX 0→-4→4→-4→0, 0.3s. Triggered on validation error. | Low |
| **Admin card sortable drag** | @dnd-kit | DndKit's useSortable with CSS transform. Lift: shadow 0 8px 24px rgba(0,0,0,0.15), opacity 0.9, scale 1.02. Drop target: dashed gold border. | Medium |
| **Dashboard chart bars** | Recharts | Bar component with animationDuration={500} animationBegin={300}. Bars animate height from 0. | Low |
| **Skeleton loading** | CSS | linear-gradient background-position animation, 1.5s ease-in-out infinite. Pure CSS keyframes. | Low |
| **Button hover fill** | CSS | transition: all 0.3s ease. background, color, border-color on hover. | Low |
| **Text link underline** | CSS | Pseudo-element scaleX(0→1) from left, 0.3s ease. | Low |
| **Form input focus** | CSS | transition: border-color 0.2s, box-shadow 0.2s. | Low |
| **Spinner** | CSS | Keyframe rotate 360deg, 0.8s linear infinite. Pure CSS. | Low |

**Reduced motion**: All Framer Motion components check `useReducedMotion()`. All CSS transitions wrapped in `@media (prefers-reduced-motion: no-preference)`. Reduced-motion mode: instant state changes, all content visible by default.

---

## State & Logic Plan

### State Architecture

| Scope | Solution | Justification |
|-------|----------|---------------|
| Server state (API data) | Server Actions + tRPC | Next.js Server Actions for mutations, tRPC for queries. End-to-end type safety, colocated with Next.js. |
| Booking flow (multi-step) | React useState (local) | 4-step wizard state (step, selectedDate, selectedSlot, formData) held in Booking page component. Passed down as props. No global state needed — booking state is page-local. |
| UI state (modals, drawers, toasts) | React useState (local) | Each component manages its own modal open/close, mobile drawer, etc. Toast via shadcn/ui Toast provider (context-based). |
| Admin auth | HTTP-only JWT cookie + server verification | JWT stored in cookie, verified server-side on every /admin/* route. No client-side auth state needed — middleware handles redirects. |
| Notification polling | React Query (tanstack-query) or useSWR | 30s polling interval for new booking notifications. Automatic caching and background refresh. |

### Booking Flow Logic

```
Step 1 (Calendar) → select date → fetch slots for date → Step 2
Step 2 (Slots)    → select slot  → reserve slot (10-min TTL) → Step 3
Step 3 (Form)     → validate    → create booking + Razorpay order → Step 4
Step 4 (Payment)  → Razorpay checkout → verify payment → success redirect
```

**Critical concurrency logic**:
- Slot reservation: `SELECT FOR UPDATE` (row-level lock) when checking availability. Booking creation + Razorpay order creation wrapped in a single database transaction.
- 10-min TTL: `reservedAt` timestamp on booking_slot table. Cron job (or in-memory TTL) releases expired reservations every minute.
- Payment idempotency: Razorpay order ID tied 1:1 to booking. Refreshing payment page reuses existing unpaid order; never creates duplicate bookings.
- Wednesday enforcement: 3 layers — frontend calendar grey-out, backend API returns empty slots, database seed skips Wednesdays.

### Admin Auth Flow

```
Login form → POST /api/admin/login → bcrypt verify → issue JWT (HTTP-only cookie, 24h) → redirect /admin/dashboard
Logout     → POST /api/admin/logout → clear cookie  → redirect /admin/login
All /admin/* routes: server-side middleware checks JWT → unauthenticated redirects to /admin/login
Failed login: generic "Invalid credentials", 5 attempts per IP per 15 min (rate limiting)
```

### File Upload Flow

```
Client: File Uploader → validate type/size → POST /api/upload/signed-url
Server: Generate S3 presigned PUT URL → return URL + fields
Client: PUT file directly to S3 → progress tracking → on complete: return public URL
Server: Save URL to database, trigger poster generation (video) or thumbnail optimization (image)
```

S3 folder structure: `gallery/{photoOfWeekId}/{filename}` for gallery media, `hero-video/{filename}` for hero videos, `products/{filename}` for product images.

### Payment Flow (Razorpay)

```
1. Frontend POST /api/bookings {slotId, customerData}
2. Backend: verify slot (SELECT FOR UPDATE) → create booking (pending) → create Razorpay order (₹100 = 10000 paise) → save orderId
3. Frontend: init Razorpay Checkout {key, orderId, customer, theme: #C9A96E}
4. Razorpay: user completes payment → frontend handler receives payment_id, order_id, signature
5. Frontend POST /api/bookings/verify {bookingId, paymentId, orderId, signature}
6. Backend: HMAC-SHA256 signature verify → update booking (confirmed/paid) → mark slot booked → send emails → return success
7. Frontend: redirect /booking/success?bookingId=xxx
8. Webhook /api/razorpay/webhook: handles payment.captured, payment.failed, refund.processed as fallback
```

Refund flow: Admin clicks "Cancel & Refund" → backend calls Razorpay refund API → on success, update booking status + payment status → release slot → send cancellation email.

### Email Triggers

| Event | Recipients | Method |
|-------|-----------|--------|
| Booking confirmed | Customer | Resend transactional email |
| New booking | Admin (studio email) | Resend |
| Booking cancelled | Customer | Resend |
| Payment failed | Customer | Resend with retry link |

### Slot Generation

- Seed script generates 60 days of slots on deploy (skips Wednesdays)
- Daily cron job extends range by 1 day
- Each day: 12 one-hour slots (9 AM – 9 PM)
- Availability tracked via `isBooked` boolean on `booking_slot` table

---

## Database Schema Summary

**Tables**: hero_video, photo_of_the_week, gallery_item, product, booking_slot, booking, admin_user, activity_log

**Enums**: category (lehenga, cocktail, saree, indo_western), day_of_week, booking_status (pending, confirmed, cancelled, completed), payment_status (pending, paid, failed, refunded)

**Key relations**: 
- `gallery_item.photoOfTheWeekId` → `photo_of_the_week.id` (cascade delete)
- `booking.slotId` → `booking_slot.id`
- Indexes: booking_slot(date), booking(slot_id), product(category), gallery_item(photo_of_the_week_id), photo_of_the_week(display_order)

**Seeded data**: admin user (username: manmandir, bcrypt hashed password), 60 days of booking slots (skipping Wednesdays)

---

## Project File Structure

```
app/
├── (public)/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Public root layout (fonts, metadata)
│   ├── gallery/
│   │   └── [id]/
│   │       └── page.tsx            # Gallery detail page
│   ├── book-appointment/
│   │   └── page.tsx                # Booking flow (4-step wizard)
│   └── booking/
│       └── success/
│           └── page.tsx            # Booking success page
├── (admin)/
│   ├── layout.tsx                  # Admin layout (sidebar + auth guard)
│   ├── login/
│   │   └── page.tsx                # Admin login
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard
│   ├── hero-video/
│   │   └── page.tsx                # Hero video management
│   ├── photos-of-week/
│   │   └── page.tsx                # Photos of week CRUD
│   ├── gallery/
│   │   └── [id]/
│   │       └── page.tsx            # Gallery manager
│   ├── products/
│   │   └── page.tsx                # Product management
│   ├── bookings/
│   │   └── page.tsx                # Booking management
│   ├── payments/
│   │   └── page.tsx                # Payment tracking
│   └── settings/
│       └── page.tsx                # Admin settings
├── api/
│   ├── hero-video/
│   │   └── route.ts                # GET active hero video
│   ├── photos-of-week/
│   │   └── route.ts                # GET all active items
│   ├── gallery/
│   │   └── [id]/
│   │       └── route.ts            # GET gallery items by photo ID
│   ├── products/
│   │   └── route.ts                # GET products (filter by category)
│   ├── slots/
│   │   └── route.ts                # GET slots for date
│   ├── bookings/
│   │   ├── route.ts                # POST create booking
│   │   └── verify/
│   │       └── route.ts            # POST verify payment
│   ├── razorpay/
│   │   └── webhook/
│   │       └── route.ts            # POST webhook handler
│   ├── upload/
│   │   └── signed-url/
│   │       └── route.ts            # POST generate S3 presigned URL
│   └── admin/
│       ├── login/
│       │   └── route.ts            # POST authenticate, set JWT cookie
│       ├── logout/
│       │   └── route.ts            # POST clear JWT cookie
│       ├── me/
│       │   └── route.ts            # GET verify current admin session
│       ├── dashboard/
│       │   └── stats/
│       │       └── route.ts        # GET dashboard statistics
│       ├── hero-video/
│       │   └── route.ts            # GET list, POST upload
│       ├── photos-of-week/
│       │   └── route.ts            # GET list, POST create, PUT, DELETE
│       ├── gallery/
│       │   └── [photoId]/
│       │       └── route.ts        # GET, POST upload, PUT, DELETE
│       ├── products/
│       │   └── route.ts            # GET, POST, PUT, DELETE
│       ├── bookings/
│       │   └── route.ts            # GET list, PUT status, DELETE
│       └── payments/
│           └── route.ts            # GET list, PUT verify
├── globals.css                     # Tailwind directives + custom CSS properties
├── layout.tsx                      # Root layout (public)
components/
├── ui/                             # shadcn/ui components (auto-installed)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── switch.tsx
│   ├── checkbox.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── tooltip.tsx
│   ├── label.tsx
│   └── skeleton.tsx
├── layout/
│   ├── Navbar.tsx                  # Public navbar (transparent→cream)
│   └── Footer.tsx                  # Dark multi-column footer
├── home/
│   ├── HeroVideoSection.tsx        # Full-viewport hero video
│   ├── PhotosOfWeekCarousel.tsx    # Embla carousel
│   ├── PhotoCard.tsx               # Carousel photo card
│   ├── CategoryShowcase.tsx        # 4-column category grid
│   ├── CategoryCard.tsx            # Hover-reveal category card
│   └── StudioIntroSection.tsx      # Editorial split section
├── booking/
│   ├── StepIndicator.tsx           # 4-step progress indicator
│   ├── CalendarGrid.tsx            # Month calendar with availability
│   ├── SlotPicker.tsx              # Time slot grid
│   ├── BookingForm.tsx             # Customer details form
│   ├── RazorpayCheckout.tsx        # Payment integration
│   └── BookingConfirmation.tsx     # Success state
├── admin/
│   ├── AdminLayout.tsx             # Sidebar + content wrapper
│   ├── AdminSidebar.tsx            # Dark sidebar navigation
│   ├── TopBar.tsx                  # Sticky header with notifications
│   ├── NotificationBell.tsx        # Bell + dropdown
│   ├── StatCard.tsx                # Dashboard metric card
│   ├── DataTable.tsx               # Sortable/filterable table
│   ├── StatusBadge.tsx             # Semantic pill badge
│   ├── FileUploader.tsx            # Drag-drop file upload
│   ├── VideoUploader.tsx           # Video upload with poster
│   ├── SortableGrid.tsx            # DnD sortable card grid
│   ├── InlineEdit.tsx              # Click-to-edit input
│   └── FilterBar.tsx               # Search + filter + export bar
└── shared/
    ├── ImageReveal.tsx             # Reusable hover image swap
    ├── AnimatedHeading.tsx         # Scroll-triggered heading reveal
    ├── SectionHeader.tsx           # Centered label + title
    ├── GalleryLightbox.tsx         # Full-screen media viewer
    └── VideoPlayer.tsx             # Custom HTML5 video controls
lib/
├── db/
│   ├── schema.ts                   # Drizzle ORM schema (all tables, enums, indexes)
│   ├── index.ts                    # Database connection (Neon serverless)
│   └── seed.ts                     # Seed script (admin user, slot generation)
├── auth.ts                         # JWT utilities (sign, verify, middleware)
├── s3.ts                           # S3 presigned URL generation, upload helpers
├── razorpay.ts                     # Razorpay client setup, order creation, signature verification
├── email.ts                        # Resend email sending utilities
└── utils.ts                        # General utilities (cn helper, formatters)
├── hooks/
│   ├── useAuth.ts                  # Admin auth hook (verify session)
│   ├── useBooking.ts               # Booking state management (multi-step)
│   ├── useMediaQuery.ts            # Responsive breakpoint hook
│   └── useScrollPosition.ts        # Scroll position for navbar transform
├── types/
│   └── index.ts                    # Shared TypeScript interfaces
public/
├── images/                         # Static assets (logo SVG, favicon)
└── fonts/                          # (if not using next/font)
drizzle.config.ts                   # Drizzle ORM configuration
next.config.js                      # Next.js config (images, rewrites)
tailwind.config.ts                  # Tailwind + custom theme (colors, fonts, spacing)
tsconfig.json
package.json
.env.local.example                  # Environment variable template
```

---

## Key Technical Decisions

### Next.js 15 App Router (over Pages Router)
The project uses the App Router for SSR (critical for fashion SEO), file-based routing, API route colocation, and Server Actions for mutations. Server Components handle data fetching; Client Components handle interactivity.

### Drizzle ORM over Prisma
Drizzle is chosen for its lightweight footprint, type-safe SQL, and better fit with serverless environments (Neon). The schema is defined in pure TypeScript with PostgreSQL-specific features (enums, JSONB).

### Neon PostgreSQL over self-hosted
Neon provides serverless PostgreSQL with automatic scaling, branching (dev/staging/prod), and zero cold starts — ideal for a Vercel-deployed Next.js app.

### S3 Presigned URLs over direct upload
Files are uploaded directly from client to S3 using presigned PUT URLs, bypassing the Next.js server for file data. This avoids request body size limits and improves upload performance.

### tRPC + Server Actions (hybrid)
tRPC handles complex queries with type safety across the stack. Next.js Server Actions handle simple mutations (create, update, delete) for cleaner component code. Both coexist — tRPC for data fetching, Server Actions for form submissions.

### No separate state management library
Booking flow state is page-local (useState). Admin state is server-driven (tRPC/SWR). No Zustand/Redux needed — the application state is simple enough for React's built-in tools.
