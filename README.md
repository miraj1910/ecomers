# STORE — Modern Essentials

A modern ecommerce storefront built with Next.js 16 (App Router) featuring Google OAuth authentication, Stripe checkout, a dual CMS strategy (Sanity + local MDX), and a minimalist UI.

**Purpose:** Sell curated lifestyle products — clothing, accessories, and home goods — with a focus on quality and timeless design.

---

## Features

### Authentication & Authorization
- **Google OAuth** via NextAuth.js v5 — no email/password login
- JWT-based sessions (no database adapter required)
- Session persisted across page loads via encrypted cookies
- Protected routes enforce authentication at middleware level:
  - `/profile` — account information
  - `/orders` — order history
  - `/wishlist` — saved items
  - `/checkout/*` — payment flow
- Unauthenticated users redirected to `/sign-in`

### User Management
- Google profile data (name, email, avatar) pulled automatically
- User menu dropdown with profile, wishlist, and orders links
- Avatar display with initial-letter fallback when image is missing

### Cart & Checkout
- **Client-side cart** persisted to `localStorage` via Zustand
- Add/remove/update quantities with stock-limit clamping
- Slide-out cart drawer with Framer Motion animation
- **Stripe Checkout** integration — POST to `/api/checkout-session` creates a Stripe payment session
- Success and cancellation pages

### Wishlist
- Persisted to `localStorage` via Zustand
- Add/remove items from product cards
- Dedicated wishlist page with grid layout

### Product Catalog
- Product listing with **filtering** (search, category, price sort)
- Product detail pages with image gallery (mouse-position zoom)
- **Related products** by category
- **Featured products** on the home page
- Badge support (Sale, New, Best Seller)

### Content Management (Dual CMS)
- **Primary:** Sanity CMS — GROQ queries for products, categories, and search
- **Fallback:** Local MDX files in `content/` — auto-detected via `isSanityConfigured()`
- Blog with listing and detail pages (MDX rendered via `next-mdx-remote`)
- About page from MDX

### Store & Categories
- Category pages for accessories, clothing, home (MDX-backed)
- Dynamic category pages (all, new-arrivals, sale) when Sanity is configured
- Home page sections: hero, featured products, categories grid, promo banner, newsletter signup

### UI & Theme
- **Custom dark/light theme** (not `next-themes`) with:
  - System preference detection
  - localStorage persistence
  - Inline script to prevent flash of unstyled content (FOUC)
- Responsive mobile navigation with slide-out drawer
- Toast notification system (with Framer Motion)
- Skeleton loading states throughout
- Search bar with `Cmd+K` shortcut and debounced input
- Quantity selector component

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) 16.2.6 (App Router) |
| **UI Library** | [React](https://react.dev/) 19.2.4 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4 (via `@tailwindcss/postcss`) |
| **Auth** | [NextAuth.js](https://authjs.dev/) 5 (Google OAuth provider) |
| **Payments** | [Stripe](https://stripe.com/) 22 (Checkout Sessions) |
| **CMS** | [Sanity](https://www.sanity.io/) (optional — GROQ queries) |
| **Local Content** | MDX + [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter |
| **MDX Rendering** | [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) 6 |
| **State** | [Zustand](https://github.com/pmndrs/zustand) 5 (cart, wishlist, toasts) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) 12 |
| **Linting** | ESLint 9 (flat config) |
| **Package Manager** | npm |

---

## Architecture

### Frontend
The project follows Next.js 15/16 App Router conventions with a `src/` directory structure. Pages are server-rendered by default. Client interactivity is added via `"use client"` components at the leaf level (cart drawer, user menu, search bar).

**Route structure:**
- **Public routes:** `/`, `/about`, `/blog`, `/blog/[slug]`, `/sign-in`, `/sign-up`, `/products`, `/products/[slug]`, `/category/[slug]`, `/product/[slug]`
- **Protected routes (auth required):** `/profile`, `/orders`, `/wishlist`, `/checkout/*`
- **API routes:** `/api/auth/[...nextauth]` (NextAuth), `/api/checkout-session` (Stripe)

### Backend
There is no custom backend server. Backend logic is handled through:
- **Next.js API routes** — Stripe checkout session creation
- **NextAuth.js** — Authentication via Google OAuth (runs at edge/serverless)
- **Sanity CMS** — Content API (GROQ over HTTPS)
- **Next.js proxy middleware** — Route protection (Next.js 16 `proxy.ts` pattern)

### Data Flow
```
User → Next.js App Router → Page Component
                              ├── isSanityConfigured()?
                              │   ├── YES → sanityFetch() → Sanity CDN
                              │   └── NO  → readMDXFile() → Local filesystem
                              └── Render via next/image + Tailwind
```

### State Management
| Store | Type | Persistence | Purpose |
|---|---|---|---|
| `useCart` | Zustand | `localStorage` | Shopping cart items |
| `useWishlist` | Zustand | `localStorage` | Saved/wishlist items |
| `useToastStore` | Zustand | None | Toast notifications |
| `ThemeProvider` | React Context | `localStorage` | Dark/light/system theme |

### Authentication Flow
```
User clicks "Continue with Google"
  → signIn("google", { callbackUrl: "/" })
  → Redirect to Google consent screen
  → Google redirects to /api/auth/callback/google
  → NextAuth exchanges code for tokens
  → JWT created and stored in encrypted cookie
  → Redirect to callbackUrl
  → SessionProvider reads cookie → session available client-side
  → auth() reads cookie → session available server-side
```

---

## Folder Structure

```
.
├── content/                          # Local MDX content (Sanity fallback)
│   ├── blog/                         #   Blog posts (2 posts)
│   ├── categories/                   #   Category definitions (3 categories)
│   ├── pages/                        #   Static pages (about)
│   └── products/                     #   Product definitions (5 products)
│
├── public/                           # Static assets
│   └── images/                       #   (available for local images)
│
├── src/
│   ├── proxy.ts                      # Next.js 16 proxy middleware (auth guard)
│   │
│   ├── lib/                          # Shared utilities and config
│   │   ├── auth.ts                   #   NextAuth config (Google provider)
│   │   ├── cart.ts                   #   Cart math helpers
│   │   ├── content.ts                #   MDX file reader (gray-matter)
│   │   ├── products.ts               #   Product/category query functions
│   │   ├── stripe.ts                 #   Stripe client singleton
│   │   ├── theme-script.ts           #   Inline FOUC-prevention script
│   │   └── utils.ts                  #   cn(), formatPrice(), absoluteUrl()
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── content.ts                #   Frontmatter types for MDX
│   │   └── index.ts                  #   Shared types (CartItem, FilterGroup, etc.)
│   │
│   ├── store/                        # Zustand state stores
│   │   ├── cart.ts                   #   Shopping cart (persisted)
│   │   ├── toast.ts                  #   Toast notifications
│   │   └── wishlist.ts               #   Wishlist (persisted)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-cart.ts               #   Cart actions with toast feedback
│   │   ├── use-debounce.ts           #   Generic debounce
│   │   ├── use-hydrated.ts           #   SSR hydration guard
│   │   ├── use-scroll.ts             #   Window scroll position
│   │   └── use-toast.ts              #   Toast helper (success/error/info)
│   │
│   ├── sanity/                       # Sanity CMS integration
│   │   ├── lib/client.ts             #   Sanity client + urlFor builder
│   │   ├── lib/fetch.ts              #   sanityFetch wrapper
│   │   ├── queries/index.ts          #   GROQ queries
│   │   └── types/index.ts            #   SanityProduct, SanityCategory
│   │
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── layout.tsx                #   Root layout (Geist font, Navbar, Footer)
│   │   ├── providers.tsx             #   Client providers (Theme + Session)
│   │   ├── globals.css               #   Tailwind v4 + CSS variables
│   │   ├── page.tsx                  #   Home page
│   │   ├── about/page.tsx
│   │   ├── sign-in/page.tsx          #   Google OAuth sign-in
│   │   ├── sign-up/page.tsx          #   Google OAuth sign-up
│   │   ├── profile/page.tsx          #   Account info (protected)
│   │   ├── orders/page.tsx           #   Order history (protected, placeholder)
│   │   ├── wishlist/page.tsx         #   Wishlist (protected)
│   │   ├── blog/page.tsx             #   Blog listing
│   │   ├── blog/[slug]/page.tsx      #   Blog post detail
│   │   ├── products/page.tsx         #   Product listing with filters
│   │   ├── products/[slug]/page.tsx  #   Product detail (new route)
│   │   ├── product/[slug]/page.tsx   #   Product detail (legacy route)
│   │   ├── category/[slug]/page.tsx  #   Category page
│   │   ├── checkout/success/         #   Payment success
│   │   ├── checkout/cancel/          #   Payment cancelled
│   │   └── api/
│   │       ├── auth/[...nextauth]/   #   NextAuth handler
│   │       └── checkout-session/     #   Stripe checkout creation
│   │
│   └── components/                   # React components
│       ├── auth/                     #   Auth buttons, user menu, session provider
│       ├── cart/                     #   Cart drawer, item row, summary, empty state
│       ├── checkout/                 #   Stripe checkout button
│       ├── filters/                  #   Filter sidebar (desktop + mobile)
│       ├── layout/                   #   Navbar, footer, mobile nav, container
│       ├── mdx/                      #   Custom MDX component overrides
│       ├── product/                  #   Legacy product components
│       ├── products/                 #   New product components (grid, card, filters)
│       ├── search/                   #   Search bar with keyboard shortcut
│       ├── shared/                   #   Hero, categories, featured, promo, newsletter, toasts
│       └── ui/                       #   Button, Badge, Card, Input primitives
│
├── next.config.ts                    # Next.js config (image remotePatterns)
├── tsconfig.json                     # TypeScript config (@/ → ./src/*)
├── tailwind.config.ts                # Tailwind v4 config (via PostCSS plugin)
├── eslint.config.mjs                 # ESLint flat config
└── postcss.config.mjs                # PostCSS (Tailwind plugin)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | — | Google OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | — | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Yes | — | NextAuth encryption key (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | — | Canonical URL of your app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | — | Stripe publishable key (test mode for development) |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key (server-side) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | — | Sanity project ID (leave empty to use local MDX content) |
| `NEXT_PUBLIC_SANITY_DATASET` | No | `production` | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | `2024-01-01` | Sanity API version |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | App base URL for redirects |

---

## Google OAuth Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one

### 2. Enable the Google Identity API
1. Navigate to **APIs & Services > Library**
2. Search for "Google Identity Services API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Fill in required fields: App name, User support email, Developer contact info
4. Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`
5. Add test users if in testing mode

### 4. Create OAuth Client ID
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Web application**
4. Name: `STORE Auth`

### 5. Add Authorized Redirect URIs

**Development:**
```
http://localhost:3000/api/auth/callback/google
```

**Production:**
```
https://yourdomain.com/api/auth/callback/google
```

### 6. Copy Credentials
1. Note your **Client ID** and **Client Secret**
2. Add them to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Installation

### Prerequisites
- Node.js 20+
- npm

### Steps

```bash
# Clone the repository
git clone <repository-url>
cd ecommers

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# (Google OAuth, Stripe, and optional Sanity keys)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## API Documentation

### `POST /api/checkout-session`

Creates a Stripe Checkout Session and returns the redirect URL.

**Request body:**
```json
{
  "items": [
    {
      "name": "Premium Cotton T-Shirt",
      "price": 48.00,
      "quantity": 2,
      "image": "https://images.unsplash.com/photo-xxx?w=600&q=80"
    }
  ]
}
```

**Response (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Response (400):**
```json
{
  "error": "No items provided"
}
```

**Response (500):**
```json
{
  "error": "Failed to create checkout session"
}
```

**Authentication:** None required (cart items are sent from client).

### `GET/POST /api/auth/[...nextauth]`

NextAuth.js authentication handler. Handles:
- `GET /api/auth/signin` — OAuth sign-in redirect
- `GET /api/auth/callback/google` — OAuth callback
- `GET /api/auth/session` — Returns current session JSON
- `GET /api/auth/signout` — Sign out
- `POST /api/auth/signout` — Sign out (POST)

---

## Authentication Flow

### Sign In
1. User navigates to `/sign-in`
2. Clicks **"Continue with Google"**
3. Redirected to Google consent screen
4. Upon approval, Google POSTs to `/api/auth/callback/google`
5. NextAuth verifies the authorization code, creates a JWT, stores it in an encrypted cookie
6. User is redirected to `/` (or the original protected route)

### Session Handling
- **Server-side:** `auth()` from `@/lib/auth` returns the session via JWT cookie parsing
- **Client-side:** `useSession()` from `next-auth/react` (wrapped in `SessionProvider`)
- **Middleware:** `proxy.ts` calls `auth()` on every request and redirects unauthenticated users from protected routes

### Sign Out
1. User clicks **"Sign out"** in the user menu dropdown
2. `signOut({ callbackUrl: "/" })` clears the session cookie
3. User is redirected to `/`

### Protected Routes
Protected routes (`/profile`, `/orders`, `/wishlist`, `/checkout/*`) are guarded at two levels:
1. **Middleware level** (`proxy.ts`): checks session before page renders, redirects to `/sign-in`
2. **Server component level** (e.g., `profile/page.tsx`): calls `auth()` and calls `redirect("/sign-in")` if no session

---

## Content Management

### Using Sanity CMS (Production)
1. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`
2. Define schemas matching `SanityProduct` and `SanityCategory` types in your Sanity studio
3. The app fetches content via GROQ queries defined in `src/sanity/queries/index.ts`

### Using Local MDX (Development / Fallback)
When `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty, content is read from MDX files in `content/`.

**Product frontmatter:**
```yaml
---
title: Premium Cotton T-Shirt
slug: premium-cotton-tshirt
description: Everyday essential in heavyweight organic cotton
price: 48.00
category: clothing
image: https://images.unsplash.com/photo-xxx?w=600&q=80
images:
  - https://images.unsplash.com/photo-xxx?w=600&q=80
tags:
  - cotton
  - essential
sizes:
  - S
  - M
  - L
featured: true
inStock: true
rating: 4.7
reviewCount: 203
badge: null
---

Product description in Markdown...
```

---

## Image Guidelines

- **Product images:** Use Unsplash URLs or Sanity CDN URLs
- **Google avatars:** Served from `lh3.googleusercontent.com` (configured in `next.config.ts`)
- **Image component:** Always use `next/image` with explicit `width`/`height` or `fill` + `sizes`
- **Remote hosts** must be listed in `next.config.ts` → `images.remotePatterns`
- **Fallback:** When no user avatar is available, initials derived from the user's name are shown

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
#   GOOGLE_CLIENT_ID
#   GOOGLE_CLIENT_SECRET
#   NEXTAUTH_SECRET
#   NEXTAUTH_URL (your production URL)
#   STRIPE_SECRET_KEY
#   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
#   NEXT_PUBLIC_APP_URL
```

### Production Checklist
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] Google OAuth redirect URI updated for production (`https://yourdomain.com/api/auth/callback/google`)
- [ ] Stripe keys switched from test to live mode
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` set if using Sanity
- [ ] Unsplash images replaced with production-appropriate images

---

## Notes

- **This project has no database.** Orders are a static placeholder (no order persistence). NextAuth uses JWT sessions (no database adapter). For production, consider adding a database for orders, user profiles, and product inventory.
- **Two product route patterns** exist (`/product/[slug]` and `/products/[slug]`) indicating an in-progress route migration. Both currently work.
- **Stripe webhooks** are not implemented. Payment confirmation is handled client-side via redirect to `/checkout/success`.
