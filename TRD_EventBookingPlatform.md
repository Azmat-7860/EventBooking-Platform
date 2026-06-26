# TRD — Event Services Booking Platform
**Version:** 1.0 | **Date:** June 2026 | **Status:** Final Draft  
**Stack:** Next.js (Netlify) + Spring Boot (Render) + Supabase (PostgreSQL) + Cloudinary

---

## Architecture Overview

```
[Client Browser]
      │
      ▼
[Next.js — Netlify]
      │  REST /api/v1/*
      ▼
[Spring Boot — Render]
      │              │
      ▼              ▼
[Supabase DB]   [Cloudinary]
(PostgreSQL)    (photos/videos)
      │
[Spring Boot Mail — SMTP]
```

---

## Design System (Global — All Phases)

### ColorContext (React Context)
All colors live in `ColorContext.tsx`. Every component consumes from context — never hardcoded.

```tsx
// context/ColorContext.tsx
export const defaultColors = {
  bgPrimary:     '#0A0A0F',
  bgSurface:     '#12121A',
  bgElevated:    '#1A1A28',
  accent:        '#00D4FF',
  accentGlow:    'rgba(0, 212, 255, 0.15)',
  accentHover:   '#00B8E0',
  textPrimary:   '#FFFFFF',
  textMuted:     '#8A8A9A',
  textSubtle:    '#555566',
  success:       '#00FF88',
  error:         '#FF4466',
  warning:       '#FFB800',
  border:        '#2A2A3A',
  borderAccent:  'rgba(0, 212, 255, 0.3)',
}
// Light theme overrides bgPrimary/bgSurface — accent stays same
```

### Static Assets via ENV
```env
NEXT_PUBLIC_BRAND_NAME=EventPro
NEXT_PUBLIC_LOGO_URL=https://res.cloudinary.com/.../logo.png
NEXT_PUBLIC_HERO_IMAGE_URL=https://res.cloudinary.com/.../hero.jpg
NEXT_PUBLIC_FAVICON_URL=https://res.cloudinary.com/.../favicon.ico
NEXT_PUBLIC_OG_IMAGE_URL=https://res.cloudinary.com/.../og.jpg
NEXT_PUBLIC_API_BASE_URL=https://your-app.onrender.com/api/v1
```

### Tailwind + Shadcn Setup
- Tailwind config maps CSS variables to ColorContext tokens
- Shadcn components overridden to use brand tokens
- All colors via `var(--accent)`, `var(--bg-primary)` etc.

### Animation Standards (Framer Motion)
```tsx
// Shared animation variants — used across ALL pages
export const fadeUp    = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
export const fadeIn    = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
export const scaleIn   = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 } }
export const staggerContainer = { visible: { transition: { staggerChildren: 0.08 } } }
```
- Page transitions: `fadeUp` on every route change
- Modal: `scaleIn` on open, `fadeIn` reverse on close
- Cards: `fadeUp` with stagger on list render
- Hover: Tailwind `hover:scale-[1.02] hover:shadow-accent transition-all duration-300`
- Buttons: `hover:brightness-110 active:scale-95 transition-all duration-150`
- Skeleton loaders on all data-fetching states

### Responsive Breakpoints
```
Mobile:  < 640px   (sm)
Tablet:  640–1024px (md)
Desktop: > 1024px  (lg/xl)
```
Every page tested across all three. Vendor/admin sidebar collapses to bottom nav on mobile.

### Folder Structure (Frontend)
```
/src
  /app                    # Next.js app router pages
    /(public)             # Home, item detail, auth
    /(customer)           # Profile, bookings, thank-you
    /(vendor)             # Dashboard, items, analytics
    /(admin)              # Admin panel routes
  /components
    /ui                   # Shadcn base components
    /shared               # Navbar, Footer, Sidebar, ThemeToggle
    /forms                # Reusable form components
    /cards                # ItemCard, BookingCard, ReviewCard
    /modals               # BookingModal, ProfileModal
    /skeletons            # Skeleton loaders
  /context
    ColorContext.tsx
    AuthContext.tsx
    ThemeContext.tsx
  /hooks
    useAuth.ts
    useItems.ts
    useBooking.ts
    useVendor.ts
    useAdmin.ts
  /services
    api.ts                # Axios instance + interceptors
    items.service.ts
    booking.service.ts
    auth.service.ts
    vendor.service.ts
    admin.service.ts
  /lib
    queryClient.ts        # React Query config
    utils.ts
    constants.ts
  /types
    index.ts              # All TypeScript interfaces
```

### Folder Structure (Backend)
```
/src/main/java/com/eventbooking
  /auth           # JWT, OAuth, filters
  /user           # User + profile
  /vendor         # Vendor profile
  /category       # Admin-managed categories
  /item           # Item CRUD, upload
  /booking        # Inquiry flow
  /review         # Reviews + moderation
  /analytics      # Event tracking + aggregation
  /admin          # Admin-specific endpoints
  /email          # Mail service + Thymeleaf templates
  /storage        # Cloudinary integration
  /config         # Security, CORS, Async, Flyway
  /common         # ApiResponse, GlobalExceptionHandler, DTOs
```

---

## Database Schema (Full)

```sql
-- V1__create_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer','vendor','admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  theme_preference VARCHAR(10) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW()
);

-- V2__create_profiles.sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  mobile VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- V3__create_categories.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- V4__create_items.sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  starting_from_text VARCHAR(100),
  video_url TEXT,
  external_url TEXT,
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_name VARCHAR(255),
  bundle_description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published')),
  meta_title VARCHAR(255),
  meta_desc TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_items_vendor ON items(vendor_id);
CREATE INDEX idx_items_slug ON items(slug);
CREATE INDEX idx_items_category ON items(category_id);

-- V5__create_item_photos.sql
CREATE TABLE item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0
);

-- V6__create_availability.sql
CREATE TABLE item_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL
);

-- V7__create_bundles.sql
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE
);

-- V8__create_bookings.sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  customer_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES users(id),
  preferred_date DATE,
  from_time TIME,
  to_time TIME,
  from_location TEXT,
  to_location TEXT,
  name VARCHAR(255),
  mobile VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);

-- V9__create_reviews.sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES users(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- V10__create_analytics.sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES users(id),
  event_type VARCHAR(20) CHECK (event_type IN ('view','share','inquiry')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_analytics_item ON analytics_events(item_id);
CREATE INDEX idx_analytics_vendor ON analytics_events(vendor_id);

-- V11__create_email_verifications.sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);
```

---

## API Endpoints (All Phases)

### Auth `/api/v1/auth`
```
POST /register              → Register (customer or vendor)
POST /login                 → Login, returns JWT
POST /google                → Google OAuth callback
GET  /verify?token=         → Email verification
POST /forgot-password       → Send reset email
POST /reset-password        → Reset with token
POST /refresh               → Refresh JWT
```

### User Profile `/api/v1/profile`
```
GET    /                    → Get my profile
POST   /                    → Create profile (first login)
PUT    /                    → Update profile
PUT    /theme               → Save theme preference
```

### Vendor Profile `/api/v1/vendor/profile`
```
GET    /                    → Get vendor profile
POST   /                    → Create vendor profile
PUT    /                    → Update vendor profile
```

### Categories `/api/v1/categories`
```
GET    /                    → List all (public)
POST   /                    → Create (admin only)
PUT    /:id                 → Update (admin only)
DELETE /:id                 → Delete (admin only)
```

### Items `/api/v1/items`
```
GET    /                    → List published items (public, filter: category, date, search, page)
GET    /:slug               → Item detail (public)
POST   /                    → Create item (vendor)
PUT    /:id                 → Update item (vendor)
DELETE /:id                 → Delete item (vendor)
POST   /:id/photos          → Upload photos (vendor, multipart)
DELETE /:id/photos/:photoId → Delete photo (vendor)
POST   /:id/video           → Upload video (vendor, multipart)
GET    /vendor/mine         → Vendor's own items list
PUT    /:id/status          → Toggle draft/published (vendor)
```

### Availability `/api/v1/items/:id/availability`
```
GET    /                    → Get blocked dates
POST   /                    → Block a date (vendor)
DELETE /:dateId             → Unblock date (vendor)
```

### Bookings `/api/v1/bookings`
```
POST   /                    → Submit inquiry (customer)
GET    /mine                → Customer booking history
GET    /vendor              → Vendor inquiry list
PUT    /:id/status          → Confirm or cancel (vendor)
```

### Reviews `/api/v1/reviews`
```
POST   /                    → Submit review (customer, requires booking)
GET    /item/:itemId        → Get reviews for item (public)
```

### Analytics `/api/v1/analytics`
```
POST   /event               → Log view/share/inquiry event (internal)
GET    /vendor              → Vendor analytics summary
GET    /vendor/items        → Per-item breakdown
GET    /admin               → Platform-wide analytics (admin)
GET    /admin/vendors       → Per-vendor breakdown (admin)
```

### Admin `/api/v1/admin`
```
GET    /users               → List all users + vendors
PUT    /users/:id/suspend   → Suspend user
PUT    /users/:id/reinstate → Reinstate user
GET    /bookings            → All platform bookings
GET    /reviews             → All reviews
PUT    /reviews/:id/flag    → Flag review
DELETE /reviews/:id         → Delete review
```

---

## Phase 1 — Foundation

**Goal:** Auth, role routing, design system, base layout working end to end.

### Backend Tasks
- Spring Boot project setup, Flyway, Supabase connection
- Run V1, V11 migrations
- `POST /auth/register` — hash password (BCrypt), send verification email
- `GET /auth/verify` — activate account
- `POST /auth/login` — return JWT with role claim
- `POST /auth/google` — Google OAuth2, create user if new
- `POST /auth/forgot-password` + `POST /auth/reset-password`
- `POST /auth/refresh`
- JWT filter chain, role-based route protection
- `ApiResponse<T>` wrapper, `GlobalExceptionHandler`
- CORS locked to Netlify domain
- Spring Boot Mail + Thymeleaf: verification email template, reset email template

### Frontend Tasks
- Next.js project setup, Tailwind, Shadcn, Framer Motion
- `ColorContext.tsx` — all tokens, theme toggle logic
- `ThemeContext.tsx` — light/dark, localStorage, system detection
- `AuthContext.tsx` — JWT storage, user state, role detection
- Axios instance (`services/api.ts`) — attaches JWT header, handles 401
- React Query `queryClient.ts` setup
- ENV file — brand name, logo, hero image, API base URL
- Layout components: `Navbar`, `Footer`, `Sidebar` (vendor/admin), `MobileNav`
- All layouts responsive (mobile/tablet/desktop)
- Dual theme toggle in navbar (sun/moon, smooth transition)
- Pages: `/auth` — register/login tabs, Google OAuth button
- Email verification landing page `/auth/verify`
- Forgot/reset password pages
- Role-based redirect after login:
  - `customer` → `/`
  - `vendor` → `/vendor/dashboard`
  - `admin` → `/admin`
- Protected route HOC per role
- Framer Motion page transition wrapper

**✅ Phase 1 Done When:** Register → verify email → login → land on correct dashboard. Google OAuth works. Theme toggle works. All responsive.

---

## Phase 2 — Vendor Core

**Goal:** Vendors can complete profile, manage categories (admin), add/edit/publish items with photos and video.

### Backend Tasks
- Run V2, V3, V4, V5, V6, V7 migrations
- `POST/PUT /vendor/profile`
- Full CRUD `/api/v1/categories` (admin protected)
- Full CRUD `/api/v1/items` (vendor protected)
- Photo upload endpoint:
  - Accept multipart (max 5 files, 5MB each)
  - Cloudinary upload with auto-compress transform
  - Save URLs to `item_photos`
- Video upload endpoint:
  - Accept multipart (max 50MB)
  - Compress via FFmpeg wrapper in Spring Boot
  - Upload compressed to Cloudinary
  - Save URL to `items.video_url`
- Slug auto-generation from title (kebab-case, unique check)
- `PUT /:id/status` — toggle draft/published
- Availability block/unblock endpoints
- Bundle endpoints

### Frontend Tasks
- Vendor profile popup modal (first login detection via `AuthContext`)
- `/admin/categories` page:
  - Table: name, icon, image, sort order
  - Add/edit category form with image upload (Cloudinary direct upload)
  - Delete with confirm dialog
- `/vendor/items` page:
  - Table with thumbnail, title, category, status badge, actions
  - Animated row hover, skeleton loader
- `/vendor/items/new` and `/vendor/items/[id]` (Add/Edit):
  - Title, category dropdown, description, starting from text
  - Photo uploader: drag & drop, up to 5, preview, alt text per photo, reorder
  - Video uploader: single file, progress bar, preview
  - External URL field
  - Bundle toggle — search and link existing items
  - Availability calendar — click to block/unblock dates
  - SEO fields: meta title, meta description
  - Save as Draft / Publish buttons
- All forms: React Hook Form + Zod validation
- Toast notifications on success/error

**✅ Phase 2 Done When:** Admin creates categories. Vendor completes profile. Vendor adds item with photos/video, sets availability, publishes. Item appears in vendor item table.

---

## Phase 3 — Customer Core

**Goal:** Public-facing platform is live. Customers can browse, filter, search, and view item details with full SEO.

### Backend Tasks
- Run V2 migration for customer profiles
- `POST/PUT /profile` (customer)
- `GET /items` — published only, filters: `category`, `date` (checks availability), `search`, `page`, `size`
- `GET /items/:slug` — full detail with photos, vendor info, avg rating
- Analytics event logging: `POST /analytics/event` type=`view` on item detail load (async, `@Async`)

### Frontend Tasks
- Customer profile popup modal (first login)
- `/` Home page:
  - Hero banner (image from ENV, brand name from ENV)
  - Category filter bar — horizontal scroll on mobile, icons + images
  - Date filter (optional, DatePicker component)
  - Search bar with debounce (300ms)
  - Item cards grid: photo, title, vendor, starting from text, avg rating stars, WA share button
  - Infinite scroll (React Query `useInfiniteQuery`)
  - Skeleton loaders for cards
  - Hover: card lifts with accent glow shadow
- `/items/[slug]` Item Detail page:
  - Photo gallery (lightbox on click)
  - Video player
  - Title, description, starting from text, vendor name
  - Availability calendar (read-only, blocked dates greyed)
  - Reviews section with star breakdown
  - "Send Inquiry" CTA button (accent colored, glow on hover)
  - WhatsApp share button: `wa.me/?text=Check this out: [item URL]`
  - SEO: `next/head` dynamic meta, OG tags, JSON-LD Service schema
- `next-sitemap` config for auto sitemap from published items
- Log `view` event on item detail mount

**✅ Phase 3 Done When:** Home page loads with items, filters work, search works, item detail opens with correct data, SEO meta tags present in page source, sitemap.xml generated.

---

## Phase 4 — Booking Inquiry

**Goal:** Customer submits inquiry. Both vendor and customer get email. Vendor manages status. Customer sees history.

### Backend Tasks
- Run V8 migration
- `POST /bookings`:
  - Save booking (status = pending)
  - Log analytics event type=`inquiry` (async)
  - Send email to vendor (HTML template: item, date, time, from/to location, name, mobile, message)
  - Send confirmation email to customer (HTML template)
- `GET /bookings/mine` — customer history, paginated
- `GET /bookings/vendor` — vendor inquiry list, filterable by status/date
- `PUT /bookings/:id/status`:
  - Vendor sets confirmed or cancelled
  - If confirmed: send email to customer
  - If cancelled: send email to customer
- Email templates (Thymeleaf HTML):
  - `inquiry-vendor.html` — new inquiry notification to vendor
  - `inquiry-customer.html` — confirmation to customer
  - `booking-confirmed.html` — sent to customer on confirm
  - `booking-cancelled.html` — sent to customer on cancel

### Frontend Tasks
- Booking inquiry modal (opens from item detail CTA):
  - Fields: preferred date (DatePicker, blocks unavailable dates), from time, to time, from location, to location (both optional for non-vehicle items), name, mobile, optional message
  - Zod validation
  - Submit → loading state → success
- `/booking/success` Thank You page:
  - Animated checkmark (Framer Motion)
  - Summary of inquiry
  - "Browse more" CTA
- `/bookings` Customer booking history:
  - Table: item photo + name, vendor, date, status badge (color-coded)
  - Pagination
- Vendor dashboard `/vendor/dashboard`:
  - Notification bell with unread count badge
  - Inquiry table: customer name, item, date/time, mobile, status, Confirm/Cancel action buttons
  - Summary cards: Total, Pending, Confirmed, This Month
  - Skeleton loaders, animated card entrance

**✅ Phase 4 Done When:** Customer submits inquiry → both emails arrive → vendor sees inquiry in dashboard → vendor confirms → customer gets email → status updates in customer history.

---

## Phase 5 — Trust & Engagement

**Goal:** Reviews live, WhatsApp share tracked, availability enforced, bundles visible.

### Backend Tasks
- Run V9 migration
- `POST /reviews`:
  - Validate: booking must exist for this customer + item
  - One review per booking
  - Save rating + comment
- `GET /reviews/item/:itemId` — paginated, with customer name, rating, comment, date
- `GET /items/:slug` — include avg rating + review count in response
- WhatsApp share: `POST /analytics/event` type=`share` (logged when WA button clicked)
- Bundle display: include bundle info in item detail response
- Availability: date filter on `GET /items` excludes items with all dates blocked

### Frontend Tasks
- Reviews section on item detail:
  - Star rating display (avg + breakdown bar chart)
  - Review cards: customer name, stars, comment, date
  - "Write a Review" button (only shown if customer has a completed booking for this item)
  - Review submission form in modal: star picker + textarea
  - Animated review card entrance (stagger)
- WhatsApp share button:
  - Logs share event to analytics before opening WA link
  - `wa.me/?text=Check this: ${itemUrl}`
- Bundle display on item detail:
  - "Part of a Package" section showing linked items
  - Links to each bundled item
- Date filter on home page now greys out fully-booked dates

**✅ Phase 5 Done When:** Customer can leave review after booking. Reviews show on item page with avg rating. WhatsApp share opens correctly and logs event. Bundle items visible on detail page.

---

## Phase 6 — Dashboards & Admin

**Goal:** Vendor analytics live. Full admin panel live. Platform is production-ready.

### Backend Tasks
- Analytics aggregation endpoints:
  - `GET /analytics/vendor` — total views, shares, inquiries; monthly inquiry trend (last 6 months)
  - `GET /analytics/vendor/items` — per-item: views, shares, inquiries, avg rating
  - `GET /analytics/admin` — platform totals: vendors, customers, inquiries (monthly)
  - `GET /analytics/admin/vendors` — per-vendor: items count, total inquiries, total views, top item
- Admin endpoints:
  - `GET /admin/users` — paginated, filterable by role/status
  - `PUT /admin/users/:id/suspend` + `/reinstate`
  - `GET /admin/bookings` — all platform bookings, filterable
  - `GET /admin/reviews` — all reviews, filterable by flagged
  - `PUT /admin/reviews/:id/flag`
  - `DELETE /admin/reviews/:id`

### Frontend Tasks
- `/vendor/analytics`:
  - Summary cards: total views, total inquiries, total shares
  - Bar chart: inquiries per month (last 6 months) — Recharts
  - Per-item table: title, views, inquiries, shares, avg rating
  - Date range filter
- `/admin` Admin Dashboard:
  - Summary cards: total vendors, customers, inquiries this month
  - Monthly inquiry trend chart (platform-wide)
  - Top 5 vendors by inquiries leaderboard
- `/admin/users`:
  - Table: name, email, role, status, joined date
  - Suspend / Reinstate action with confirm dialog
  - Filter by role, status
- `/admin/categories` (already built in Phase 2, just linked here)
- `/admin/bookings`:
  - All platform bookings table
  - Filter by vendor, status, date range
- `/admin/reviews`:
  - All reviews table: item, customer, rating, comment, flagged status
  - Flag / Delete actions
- All admin pages use same design system — sidebar nav, consistent card/table style

**✅ Phase 6 Done When:** Vendor sees analytics with real data. Admin can suspend vendors, delete reviews, view all bookings. Platform analytics show correct totals and per-vendor breakdown.

---

## Email Templates (Thymeleaf)

All HTML emails share a base layout with brand logo (from ENV), brand name, accent color, and footer.

| Template | Trigger | To |
|---|---|---|
| `verify-email.html` | Register | Customer / Vendor |
| `reset-password.html` | Forgot password | Customer / Vendor |
| `inquiry-vendor.html` | New booking inquiry | Vendor |
| `inquiry-customer.html` | New booking inquiry | Customer |
| `booking-confirmed.html` | Vendor confirms | Customer |
| `booking-cancelled.html` | Vendor cancels | Customer |

---

## File Upload Specs

| Type | Max Size | Count | Processing |
|---|---|---|---|
| Item photo | 5MB | Up to 5 | Cloudinary auto-compress + resize to 1200px wide |
| Item video | 50MB | 1 | Spring Boot FFmpeg compress → Cloudinary |
| Profile photo | 2MB | 1 | Cloudinary auto-compress |
| Vendor logo | 2MB | 1 | Cloudinary auto-compress |
| Category image | 2MB | 1 | Cloudinary auto-compress |

---

## Security Checklist

- [ ] BCrypt password hashing
- [ ] JWT expiry: access token 1hr, refresh token 7 days
- [ ] Email verification before login allowed
- [ ] Role claims in JWT, validated server-side on every request
- [ ] `@PreAuthorize` on all protected endpoints
- [ ] CORS: allow only Netlify domain + localhost in dev
- [ ] Rate limiting on `/auth/register`, `/auth/login`, `/bookings` (Spring rate limiter)
- [ ] Multipart file type validation (MIME check, not just extension)
- [ ] Suspended user JWT rejected on next request
- [ ] Env secrets never committed (`.env` in `.gitignore`)

---

## ENV Summary

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_BRAND_NAME=
NEXT_PUBLIC_LOGO_URL=
NEXT_PUBLIC_HERO_IMAGE_URL=
NEXT_PUBLIC_FAVICON_URL=
NEXT_PUBLIC_OG_IMAGE_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### Backend (application.properties / env)
```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRY_MS=3600000
REFRESH_EXPIRY_MS=604800000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
FRONTEND_URL=
```

---

## Phase Delivery Summary

| Phase | What's Delivered | Dependency |
|---|---|---|
| 1 | Auth, roles, design system, dual theme, layout | None |
| 2 | Vendor profile, categories, item CRUD, uploads | Phase 1 |
| 3 | Public home, item listing, detail, SEO | Phase 2 |
| 4 | Booking inquiry, emails, vendor dashboard, history | Phase 3 |
| 5 | Reviews, WA share, availability, bundles | Phase 4 |
| 6 | Vendor analytics, admin panel | Phase 5 |
