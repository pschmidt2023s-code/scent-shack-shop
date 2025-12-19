# ALDENAIR - Premium Perfume E-Commerce Platform

## Overview
ALDENAIR is a comprehensive e-commerce platform for premium perfumes featuring product catalogs, shopping cart, user authentication, reviews, partner/affiliate programs, cashback systems, and an admin dashboard.

## Project Structure
```
├── server/           # Express.js backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Database storage layer
│   ├── db.ts         # Drizzle database connection
│   └── vite.ts       # Vite middleware for development
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle ORM schema definitions
├── src/              # React frontend (Vite)
│   ├── components/   # React components
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Page components
│   └── lib/          # Utility functions
```

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, Drizzle ORM, PostgreSQL (Neon)
- **Authentication**: Session-based (express-session + connect-pg-simple)
- **State Management**: TanStack Query, React Context

## Database
Using Neon PostgreSQL with Drizzle ORM. Schema includes:
- `users` - User accounts with roles and payback balances
- `products` - Perfume products with categories
- `product_variants` - Product sizes/variants with pricing
- `orders` / `order_items` - Order management
- `reviews` / `review_votes` - Product reviews
- `partners` / `partner_sales` - Affiliate/partner program
- `payback_earnings` / `payback_payouts` - Cashback system
- `newsletter_subscriptions` - Newsletter
- `contests` / `contest_entries` - Contest management
- `chat_sessions` / `chat_messages` - Live chat support

## API Endpoints
### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product with variants
- `GET /api/products/:id/variants` - Get product variants
- `GET /api/products/:id/reviews` - Get product reviews (supports ?variantId filter)
- `POST /api/products/:id/reviews` - Add review (auth required)

### Orders
- `GET /api/orders` - Get user orders (auth required)
- `POST /api/orders` - Create order with bank transfer payment
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order (admin)
- `DELETE /api/orders/:id` - Delete order (admin)
- `GET /api/orders/check-purchase` - Verify purchase for reviews

### User Profile
- `GET /api/profile` - Get profile (auth required)
- `PATCH /api/profile` - Update profile (auth required)
- `GET /api/addresses` - Get addresses (auth required)
- `POST /api/addresses` - Add address (auth required)
- `DELETE /api/addresses/:id` - Delete address (auth required)

### Partners
- `POST /api/partners/apply` - Apply as partner
- `GET /api/partners/me` - Get partner status (auth required)

### Payback System
- `GET /api/payback` - Get user's payback status (auth required)
- `POST /api/payback/payout` - Request payout (auth required)

### Other Features
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/chat/message` - AI chat support
- `POST /api/contests/:id/enter` - Enter contest
- `POST /api/stock-notifications` - Stock availability notifications
- `GET/POST/PATCH/DELETE /api/auto-reorder` - Auto-reorder subscriptions
- `POST/DELETE /api/push-subscriptions` - Push notification subscriptions

## Development
```bash
npm run dev          # Start development server
npx drizzle-kit push # Push schema to database
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `LOVABLE_API_KEY` - AI chat gateway key (optional)

## Payment Method
- Bank Transfer (Banküberweisung) is the active payment method
- Order confirmation shows bank details and reference number

## Recent Changes (Dec 2024)
### Phase 2: Performance & UX Improvements (Dec 19, 2024)
- **Lazy Loading**: PerfumeCard now uses OptimizedImage with IntersectionObserver
- **Debounced Search**: New SearchWithSuggestions component with 300ms debounce and typeahead
- **useDebounce Hook**: Reusable hook for debouncing values
- Skeleton loading states already existed in ProductSkeleton.tsx
- Quick-View Modal and Wishlist already implemented

### Product Scent Information Feature (Dec 19, 2024)
- Extended products table with: scentNotes (array), inspiredBy, aiDescription, seasons (array), occasions (array)
- Admin Panel: New "Duftnoten & KI-Beschreibung" expandable section in product form
  - Add/remove scent notes with tags
  - Inspired by field for original perfume reference
  - AI description generation button using OpenAI gpt-4o-mini
  - Toggleable seasons and occasions badges
- Product detail page: New "Duftprofil" card showing all scent information with icons
- API endpoint: POST /api/admin/generate-description for AI perfume descriptions
- Uses Replit AI Integrations (no API key required, billed to credits)

### Complete Redesign (Dec 19, 2024)
- About page added at /about with company values, story, and statistics
- AdminNew.tsx deprecated file removed - /admin route now uses rebuilt Admin.tsx
- All navigation links verified working (Home, Shop, Über uns, Kontakt)
- Light/Dark mode fully functional across all pages using semantic CSS variables

### Previous Changes (Dec 2024)
- Complete migration from Supabase to local Express.js API
- All customer-facing components use local API endpoints
- Bank transfer checkout flow implemented
- Product reviews with variant filtering
- Payback/cashback system endpoints
- Stock notifications and auto-reorder placeholders
- Session-based authentication with PostgreSQL session store

### Admin Dashboard Updates (Dec 18, 2024)
- New Dashboard tab with analytics (revenue, orders, customers, products)
- Complete Product Management with CRUD for products and variants
- Admin API endpoints with Zod validation:
  - GET /api/admin/products - list all products
  - DELETE /api/products/:id - delete product
  - POST /api/products/:productId/variants - create variant
  - PATCH /api/variants/:id - update variant
  - DELETE /api/variants/:id - delete variant
  - GET /api/admin/analytics - dashboard statistics

### Website Redesign (Dec 18, 2024)
- Modern HeroSection with gradient background and trust badges
- Cleaner PerfumeGrid with category filter buttons
- Improved typography and spacing throughout

## User Preferences
- German language interface (primary market)
- Dark mode support enabled

## Admin Credentials (Development)
- Email: admin@aldenair.de
- Password: Admin123!
