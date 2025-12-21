# ALDENAIR Parfum E-Commerce Platform

## Overview
ALDENAIR is a complete German-language luxury perfume e-commerce platform. It provides a sophisticated online shopping experience with a comprehensive product catalog, secure multi-payment checkout, robust user authentication, and an intuitive admin dashboard. The platform aims to offer a premium selection of fragrances, including unique sample sets and a loyalty program, catering to discerning customers. Key capabilities include managing products, processing orders, user management, and an affiliate program. The platform is designed for market potential in the luxury fragrance sector, emphasizing compliance with German e-commerce regulations.

## User Preferences
- German language interface
- Dark mode support
- Mobile-responsive design
- Cookie consent banner

## System Architecture
The platform is built with a clear separation of concerns, featuring a React + Vite frontend and an Express.js backend, both interacting with a Neon Postgres database.

**UI/UX Decisions:**
- **Color Scheme:** Warm palette with primary amber/orange (hsl 25 85% 55%) and accent gold (hsl 35 90% 58%).
- **Design Elements:** Modern HeroSection with gradient animations, TrustSection for social proof, staggered animations for product cards, and glass morphism effects.
- **Admin Dashboard:** Shadcn-based sidebar layout with grouped navigation, KPI StatCards, recent orders, quick actions, and an enhanced Orders DataTable with search, filter, and bulk actions. Responsive mobile navigation.
- **Email Templates:** Modern, elegant design with a dark gradient header and reusable components.

**Technical Implementations:**
- **Frontend:** React + Vite, utilizing TanStack Query for data fetching with automatic `queryFn`.
- **Backend:** Express.js for API services.
- **Database:** Neon Postgres, managed via Drizzle ORM.
- **Authentication:** Session-based authentication with bcrypt for password hashing.
- **API Endpoints:** All under `/api` prefix.
- **Security:** Strict CORS, secure session cookies (`sameSite strict`, session regeneration), Helmet CSP, Zod-based input validation for all PATCH routes, increased bcrypt cost factor, and rate limiting on key endpoints. Additional security headers are implemented.
- **Performance:** Optimized N+1 query problems and efficient variant search.
- **Payment Processing:** Server-side pricing validation for Stripe and PayPal integrations.
- **Loyalty System:** Tier-based discounts (Bronze, Silver, Gold, Platinum) with additional newsletter bonus. Loyalty tiers are calculated based on user spending.
- **Product Management:** Admin interface includes comprehensive product and variant management with support for AI-generated images and descriptions.
- **Email System:** Comprehensive email notification system with 9 distinct email types, using Resend for delivery.
- **Legal Compliance:** Full compliance with German e-commerce laws (DDG, DSGVO, TDDDG, BGB, Produktsicherheitsverordnung, Batteriegesetz, Verpackungsgesetz/LUCID) for Impressum, Privacy Policy, Terms & Conditions, Cancellation Policy, and Shipping Info. Checkout button text is legally compliant.
- **Order Management:** Admin panel supports manual order creation, cancellation, and refunding (including automatic Stripe/PayPal refunds). Order tracking for customers.
- **AI Features:** Product recommendations, chat support (using Replit AI Integrations for OpenAI), and AI-driven product image generation for admin.
- **Bundles:** Implemented Sparsets and Probensets with fixed pricing and deterministic IDs for cart management.
- **Password Reset:** Secure password reset functionality via email with token validation.

**Feature Specifications:**
- **Product Catalog:** 6 categories, 25+ variants, including detailed fragrance profiles (Duftpyramide, ingredients, inspiredBy).
- **Sample Sets (Probensets):** Curated sets for fragrance testing.
- **Admin Dashboard:** User management, order tracking, product management, shipping management.
- **Multi-Payment:** Stripe, PayPal, and Bank Transfer support.
- **Partner Program:** Affiliate system with partner codes.
- **AI Duft Stylist:** Personalized perfume recommendations based on user preferences.
- **Order Tracking:** Amazon-style progress bar for customer order tracking.

## External Dependencies
- **Neon Postgres:** Primary database.
- **Stripe:** Payment gateway for card payments.
- **PayPal:** Payment gateway.
- **Resend:** Email delivery service for transactional emails and password resets.
- **OpenAI (via Replit AI Integrations):** For AI product descriptions, chat support, and AI product image generation (does not require a direct OpenAI API key due to Replit integration).
- **Vite:** Frontend build tool.
- **TanStack Query:** Data fetching library for the frontend.
- **Drizzle ORM:** Database ORM.
- **Express.js:** Backend web framework.
- **bcrypt:** Password hashing library.
- **Zod:** Schema validation library.
- **Shadcn UI:** UI component library used for Admin Dashboard.

## Data Backup & Restoration
A database backup script is available at `server/data-backup.sql` containing:
- **Products:** ALDENAIR 111, 632, 888 with full details (notes, ingredients, seasons, occasions)
- **Variants:** 50 ML (€59.99) and 5 ML Probe (€9.99) for each product
- **AI-generated images** for 5ml sample bottles

To restore data after switching AI or fresh setup:
```bash
psql $DATABASE_URL < server/data-backup.sql
```

## Current Product Catalog
| Product | Inspired By | Price (50ML) | Price (5ML) |
|---------|-------------|--------------|-------------|
| ALDENAIR 111 | Sauvage Elixir® | €59.99 | €9.99 |
| ALDENAIR 632 | Imagination® | €59.99 | €9.99 |
| ALDENAIR 888 | Ombre Nomade® | €59.99 | €9.99 |

## Admin Credentials
- **Email:** admin@aldenair.de
- **Password:** Admin123!