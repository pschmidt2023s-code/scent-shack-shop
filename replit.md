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
└── supabase/         # Legacy Supabase functions (migrating to Express routes)
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
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add review (auth required)

### Orders
- `GET /api/orders` - Get user orders (auth required)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order (admin)

### User Profile
- `GET /api/profile` - Get profile (auth required)
- `PATCH /api/profile` - Update profile (auth required)
- `GET /api/addresses` - Get addresses (auth required)
- `POST /api/addresses` - Add address (auth required)

### Partners
- `POST /api/partners/apply` - Apply as partner
- `GET /api/partners/me` - Get partner status (auth required)

### Other
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/chat/message` - AI chat support
- `POST /api/contests/:id/enter` - Enter contest

## Development
```bash
npm run dev          # Start development server
npx drizzle-kit push # Push schema to database
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `LOVABLE_API_KEY` - AI chat gateway key (optional)
- `STRIPE_SECRET_KEY` - Stripe payments (optional)
- `PAYPAL_CLIENT_ID` - PayPal payments (optional)

## Recent Changes (Dec 2024)
- Migrated from Supabase to Replit with Neon PostgreSQL
- Implemented Express.js backend with Drizzle ORM
- Session-based authentication replacing Supabase Auth
- Server-side API routes replacing Supabase Edge Functions

## User Preferences
- German language interface (primary market)
- Dark mode support enabled
