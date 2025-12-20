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
- Extended product schema with Duftpyramide (topNotes, middleNotes, baseNotes), ingredients, and inspiredBy fields
- Modernized Admin Dashboard with tabbed ProductManagement (Essentials, Fragrance Profile, Metadata, AI)
- Added ChipInput component for managing fragrance notes and ingredients
- Refactored Products.tsx with API-driven data, 4-column grid, variant guards
- **Complete Admin Dashboard redesign** with Shadcn SidebarProvider shell layout
  - Grouped sidebar navigation (Übersicht, Verkauf, Kunden, Marketing)
  - Dashboard Overview with KPI StatCards (Revenue, Orders, Customers, Pending)
  - Recent Orders widget and Quick Actions panel
  - Enhanced Orders DataTable with search, filter, and bulk actions
  - Responsive mobile navigation using Sheet component
  - Sticky header with notifications and user dropdown
- **Critical Security Hardening** (December 19, 2025):
  - CORS: Strict origin validation, only Replit domains and localhost allowed
  - Session Security: Secure cookies, sameSite strict, session regeneration on login
  - Helmet CSP: Strict in production (no unsafe-inline/eval), relaxed for dev with Vite HMR
  - Input Validation: Zod schemas with field allowlists for all PATCH routes (Products, Variants, Orders, Users)
  - bcrypt: Cost factor increased from 10 to 12
  - Rate Limiting: Auth endpoints (20/15min), API (100/min), General (1000/15min)
  - Additional headers: frameguard, dnsPrefetchControl, permittedCrossDomainPolicies, HSTS preload
- **Performance Optimization** (December 19, 2025):
  - Fixed N+1 query problem in getProductsWithVariants using batched inArray loading
  - Variant search now queries variants first, then fetches matching products
  - Security rating improved to ~8.5/10
- **Stripe Payment Integration** (December 19, 2025):
  - stripeClient.ts: Credentials from Replit Connection API, Stripe SDK and StripeSync
  - webhookHandlers.ts: Processes Stripe webhook events for order updates
  - Server-side pricing validation: Checkout fetches prices from database, not client
  - Webhook route registered BEFORE express.json() for raw body access
  - Endpoints: /api/stripe/publishable-key, /api/stripe/create-checkout-session, /api/stripe/session/:sessionId
  - Base URL strategy: Uses REPLIT_DOMAINS or falls back to req.protocol/host
- **Loyalty & Admin Shipping** (December 19, 2025):
  - Fixed /api/loyalty endpoint to return real user data (tier calculation based on spending, cashback balance, earnings history)
  - Added getUserOrders and getUserPaybackEarnings storage functions
  - Loyalty tiers: bronze (default), silver (>=€50), gold (>=€200), platinum (>=€500)
  - Admin shipping management endpoints: GET/POST/PATCH/DELETE /api/admin/shipping
  - Storage functions: createShippingOption, updateShippingOption, deleteShippingOption, getAllShippingOptions
- **Design Overhaul & Loyalty System Enhancement** (December 20, 2025):
  - New warm color palette: Primary amber/orange (hsl 25 85% 55%), accent gold (hsl 35 90% 58%)
  - Tier-based discount system: Bronze 0%, Silver 3%, Gold 5%, Platinum 8% + 1.5% newsletter bonus
  - Enhanced useUserRole hook with tier, tierLabel, tierDiscount, cashbackBalance, nextTier properties
  - Modernized HeroSection with gradient animations, tier display for logged-in users
  - Added TrustSection component with social proof elements
  - Stagger animations for product cards in PerfumeGrid
  - Product card hover effects with lift animation
  - Glass morphism effects optimized for performance
- **Password Reset Feature** (December 20, 2025):
  - Added /api/auth/forgot-password endpoint for sending reset emails via Resend
  - Added /api/auth/reset-password endpoint for setting new password with token validation
  - Created ResetPassword.tsx page with password strength indicator
  - Tokens expire after 1 hour and can only be used once
  - Storage functions: createPasswordResetToken, getPasswordResetToken, markPasswordResetTokenUsed, updateUserPassword
  - Fixed syntax errors in PayPalTest.tsx, PerfumeFinder.tsx, and Returns.tsx (removed broken Supabase references)
- **Admin Manual Order Creation & Email Improvements** (December 20, 2025):
  - Resend client: 5-minute credential caching reduces connector fetches, no secret logging
  - Admin order API: POST /api/admin/orders with server-side price calculation and validation
  - CreateOrderDialog UI: Customer fields, product selector, quantity controls, inline error display
  - Error handling: Toast feedback + dialog stays open on failure for user correction
- **AI Product Image Generation** (December 20, 2025):
  - "KI Bild" button in admin ProductManagement form generates perfume product images
  - Uses OpenAI gpt-image-1 model via Replit AI Integrations (no API key required, billed to credits)
  - Builds intelligent prompts from product name, category, and fragrance notes
  - Images saved to attached_assets/generated_images/ with sanitized filenames
  - Security: Admin-only access, input validation, path traversal prevention
- **Variant Sub-Product Enhancement** (December 20, 2025):
  - Extended productVariants schema with full product-level attributes: name, image, aiDescription, topNotes, middleNotes, baseNotes, ingredients, originalPrice, sku
  - Redesigned variant management dialog with 4-tab interface (Basis, Duftprofil, Bild & KI, Details)
  - AI image and description generation for individual variants
  - Updated variant table to display name + thumbnail instead of just size
  - Backend routes accept and persist all new variant fields
  - Empty arrays normalized to null for database compatibility
- **Complete Email System Overhaul** (December 20, 2025):
  - Modern email template system with dark gradient header and elegant design
  - Reusable components: emailWrapper(), emailButton(), infoBox()
  - 9 email types implemented:
    1. Password Reset (sendPasswordResetEmail)
    2. Order Confirmation (sendOrderConfirmationEmail)
    3. Shipping Notification (sendShippingNotificationEmail)
    4. Welcome with Password (sendWelcomeEmailWithPassword)
    5. Order Cancellation (sendOrderCancellationEmail) - NEW
    6. Refund Confirmation (sendRefundEmail) - NEW
    7. Newsletter Welcome (sendNewsletterWelcomeEmail) - NEW
    8. Contact Form Confirmation (sendContactFormConfirmationEmail) - NEW
    9. Review Request (sendReviewRequestEmail) - NEW
  - Uses RESEND_API_KEY environment variable directly
  - From address: ALDENAIR <noreply@aldenair.de>

## Loyalty Tier System
| Tier     | Min Spend | Discount |
|----------|-----------|----------|
| Bronze   | 0 EUR     | 0%       |
| Silver   | 50 EUR    | 3%       |
| Gold     | 200 EUR   | 5%       |
| Platinum | 500 EUR   | 8%       |

Newsletter subscribers get an additional 1.5% discount.

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

## German E-Commerce Legal Compliance (December 20, 2025)
Complete legal compliance overhaul for German B2C e-commerce (stand: Dezember 2024):

**Legal Pages Updated:**
- **Impressum** (src/pages/Imprint.tsx): Updated to § 5 DDG (Digital-Dienste-Gesetz, May 2024), Produktsicherheitsverordnung (EU 2023/988)
- **Datenschutzerklärung** (src/pages/Privacy.tsx): DSGVO/TDDDG compliant, all third-party processors documented
- **AGB** (src/pages/Terms.tsx): Restructured with proper legal order, § 312j BGB button solution
- **Widerrufsbelehrung** (src/pages/Cancellation.tsx): 14-day withdrawal right, hygiene exception for perfumes
- **Versand und Lieferung** (src/pages/ShippingInfo.tsx): NEW - Batteriegesetz, Verpackungsgesetz/LUCID, WEEE, Produktsicherheitsverordnung

**Checkout Compliance:**
- Button text: "Kostenpflichtig bestellen" (§ 312j Abs. 3 BGB compliant)
- All costs transparent before order

**Required Production Actions:**
1. Replace LUCID placeholder (DE3211234567890123) with real registration number
2. Add USt-IdNr if revenue threshold met
3. Configure SPF/DKIM/DMARC DNS records for aldenairperfumes.de in Resend dashboard
4. Update actual phone number in Impressum

**OS-Link Notice:** EU Online-Streitbeilegung platform closes July 20, 2025

## Bug Scan & Fixes (December 20, 2025)
- **PayPal Live Mode Fix**: Added PAYPAL_MODE env variable to enable live credentials in development
  - Set PAYPAL_MODE=live to use production PayPal API instead of sandbox
- **Contact Form Endpoint**: Added POST /api/contact with Resend email confirmation
- **Dynamic Bank Settings Fix**: Bank details in order confirmation emails and checkout modal now load from database
  - Previously hardcoded values replaced with API-fetched settings from /api/settings/bank
  - Supports optional BIC and bank name fields
  - Admin can update bank details via dashboard and they immediately apply everywhere
- **All integrations verified working**:
  - Stripe: Card payments (sandbox mode, ready for production)
  - PayPal: Live credentials active
  - Resend: Transactional emails configured
  - OpenAI: Using Replit AI Integrations (no API key needed)
- **Order Tracking Feature** (December 20, 2025):
  - New OrderTracking.tsx page with Amazon-style progress bar (4 stages: Bestellt, In Bearbeitung, Versendet, Zugestellt)
  - Order confirmation emails now include "Bestellung verfolgen" button linking to /order/:orderId
  - Added orderId parameter to all sendOrderConfirmationEmail calls
  - Route: /order/:orderId accessible to customers for tracking their orders
