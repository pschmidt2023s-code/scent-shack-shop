# ALDENAIR Parfum E-Commerce Platform

## Overview
Complete German-language luxury perfume e-commerce platform migrated from Lovable/Supabase to Replit with Neon Postgres database. Features product catalog, shopping cart, multi-payment checkout, user authentication, admin dashboard, review system, partner program, cashback system, and sample sets (Probensets).

## Migration Status: COMPLETED
- Database: Neon Postgres with all 20+ tables
- Backend: Express.js API server
- Frontend: React + Vite with TanStack Query
- Authentication: Session-based with bcrypt password hashing

## Admin Access
- **Email:** admin@aldenair.de
- **Password:** Admin123!

## Project Structure
```
/client (frontend - React + Vite)
  /src
    /pages - Route components (Products, SampleSets, Auth, Admin, etc.)
    /components - UI components (Navigation, Footer, Cards, etc.)
    /contexts - React contexts (Auth, Cart, Language)
    /hooks - Custom hooks
    /lib - Utilities (api.ts for HTTP requests)
/server
  /index.ts - Express server entry point
  /routes.ts - API endpoints
  /storage.ts - Database operations interface
  /db.ts - Drizzle ORM database connection
  /seed.ts - Database seeding script
/shared
  /schema.ts - Drizzle schema definitions (shared between frontend/backend)
```

## Key Features
1. **Products**: 6 categories, 25+ variants (50ml bottles, Testerkits, Sparkits, Autoparfum, 3D Collection)
2. **Sample Sets (Probensets)**: 5 curated sets for testing fragrances
3. **Authentication**: Login/Register with session management
4. **Admin Dashboard**: User management, order tracking, product management
5. **Multi-Payment**: Stripe, PayPal, Bank Transfer support (requires API keys)
6. **Partner Program**: Affiliate system with partner codes
7. **AI Features**: Product recommendations, chat support (requires OpenAI key)

## Required Environment Variables
For full functionality, add these secrets:
- `STRIPE_SECRET_KEY` - For card payments
- `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET_KEY` - For PayPal integration
- `RESEND_API_KEY` - For email notifications
- `OPENAI_API_KEY` - For AI product descriptions and chat

## Commands
- `npm run dev` - Start development server (port 5000)
- `npx tsx server/seed.ts` - Re-seed database with products
- `npm run db:push` - Push schema changes to database

## Recent Changes (December 2025)
- Migrated from Supabase to Neon Postgres
- Fixed OpenAI lazy loading (app works without API key)
- Added default queryFn to TanStack Query for API calls
- Seeded database with products, variants, and sample sets
- Created admin user for platform management

## User Preferences
- German language interface
- Dark mode support
- Mobile-responsive design
- Cookie consent banner

## Architecture Notes
- Frontend fetches data via TanStack Query with automatic queryFn
- Backend uses Express with session-based auth
- Database operations through Drizzle ORM
- All API endpoints under /api prefix
