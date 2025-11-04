# Overview

Outfred is a modern fashion discovery platform built with React, TypeScript, and Supabase. It provides smart search capabilities, merchant store management, and AI-powered outfit generation. The platform supports bilingual interfaces (Arabic/English) and features a comprehensive admin panel for managing users, merchants, and products.

**Platform:** Successfully migrated from Vercel to Replit (November 2025)

# Recent Changes

## November 4, 2025 - Complete Subscription System with Rate Limiting & Paymob Integration
- **Subscription System Fully Implemented:**
  - User subscription fields added to KV store: subscription_plan, searches_count, searches_limit, subscription_expires_at, payment_status, last_search_reset
  - Three plans: Free (5 searches/month, $0), Basic (100 searches/month, $29), Pro (Unlimited searches, $99)
  - Database tables created: payments (transaction history), subscription_plans with bilingual features
- **Rate Limiting on Search:** Search endpoint enforces limits based on subscription tier
  - Free users: 5 searches/month maximum
  - Basic users: 100 searches/month
  - Pro users: Unlimited (999999/month)
  - Auto-downgrade expired subscriptions to free plan
  - Monthly reset logic based on last_search_reset timestamp
  - Returns 429 error with bilingual message when limit reached
- **Pricing Page Created:** pages/Pricing.tsx - Public-facing subscription selection page
  - Displays all plans with features, pricing, and current plan badge
  - Upgrade/downgrade buttons with loading states
  - Bilingual UI (Arabic/English) with color-coded plan badges
  - Integrated into Header navigation with 💎 icon
- **Admin Subscription Management:** Admins can now manage user subscriptions from Users section
  - Added "Subscription Plan" and "Searches Used" columns to user cards
  - "Edit Plan" button opens dialog to modify: plan, searches_count, searches_limit, payment_status, subscription_expires_at
  - Auto-fills searches_limit when plan is selected (Free=5, Basic=100, Pro=999999)
  - Glass effect UI with bilingual labels and validation
- **Backend Subscription Endpoints:** 4 new API endpoints created
  - GET /api/subscriptions/plans - Returns all available plans with bilingual features
  - GET /api/subscriptions/current - Returns user's current subscription with remaining searches
  - POST /api/subscriptions/upgrade - Upgrades user plan (sets expiration, resets count)
  - POST /admin/users/:userId/subscription - Admin endpoint to modify any user's subscription
- **Paymob Payment Integration (DEMO MODE):**
  - PaymobCheckout.tsx component created with payment flow skeleton
  - PAYMOB_INTEGRATION_GUIDE.md with complete 6-step implementation guide
  - Currently simulates successful payment after 2 seconds
  - Ready for production Paymob API integration (needs API keys from admin settings)
- **User Registration Enhanced:** New users automatically get Free plan with 5 searches/month

## November 4, 2025 - Complete Admin Panel Overhaul & Backend Integration
- **Backend API Implementation:** Created complete backend API for admin panel with PostgreSQL database
  - Database migration: cms_pages, site_settings, payment_settings, smtp_settings, subscription_plans tables
  - 12 new endpoints: /admin/cms, /admin/site-settings, /admin/payment-settings, /admin/smtp, /admin/subscriptions
  - Proper database connection handling with try-finally blocks to prevent connection leaks
- **Admin Pages Backend Integration:** All admin pages now use real backend API instead of localStorage
  - AdminCMS.tsx: Fetches and updates CMS pages from database
  - AdminSiteSettings.tsx: Manages SEO, branding, social links via API
  - AdminPaymentSettings.tsx: Paymob + SMTP configuration with backend persistence
  - AdminSubscriptions.tsx: User and merchant plan management via API
- **SMTP Test Email Enhancement:** Added email address selection dialog for test emails (user chooses recipient)
- **Admin Panel Complete Redesign:**
  - Sidebar navigation (vertical) replacing horizontal tabs
  - Dashboard overview as landing page with quick stats and actions
  - Organized sections: Management (Users/Merchants/Products), Engagement (Analytics/Debug), Configuration (Design/CMS/Payment/AI/Subscriptions)
  - Responsive design: Fixed sidebar on desktop, collapsible drawer on mobile
  - Icons for every section using lucide-react
  - AdminDashboard.tsx: New overview page with metrics, quick actions, pending approvals, recent activity
- **Replit Auto-Refresh Fix:** Added watch.ignored in vite.config.ts to prevent constant page reloads from Replit config files
- **API Helper Module:** Created utils/adminApi.ts with type-safe API functions for all admin endpoints

## November 4, 2025 - Critical Bug Fixes & Feature Enhancements
- **Product Import Fixed:** All imported products now default to `isActive: true`, `status: 'active'`, and `views: 0`
- **Stock Handling Improved:** Fixed stock parsing to preserve zero-stock items using `Number.isFinite()` instead of `||` operator
- **Merchant Statistics Enhanced:** Upgraded MerchantDashboardNew to use `/merchant-stats` endpoint for accurate view counts
- **Top Products Section:** Added "Most Viewed Products" section in merchant dashboard showing top 5 products by views
- **NaN Prevention:** Fixed merchant stats to use nullish coalescing (`?? 0`) preventing NaN totals when backend omits fields
- **AI Image Search:** Implemented real AI-powered image search using GPT-4 Vision to analyze uploaded images, extract dominant colors, and find matching products
- **Search Improvements:** Image search now uses `analyzeProductImage` to provide color-based product recommendations
- **Color Scheme:** Confirmed unified burgundy/maroon color palette (#3B1728, #8B4665) in styles/globals.css

## November 4, 2025 - Major Feature Addition: Admin Management System
- **NEW PAGES CREATED:**
  - `AccountSettings.tsx` - User account management page with email verification, password reset, and OAuth (Google/Facebook) placeholders
  - `AdminSubscriptions.tsx` - Complete subscription management for user plans (Free, Basic, Pro) and merchant packages (Basic, Silver, Gold) with pricing and feature controls
  - `AdminCMS.tsx` - Content Management System for editing static pages (About Us, Privacy Policy, Contact Us) with bilingual support
  - `AdminSiteSettings.tsx` - SEO settings, logo/favicon upload, social media links, and footer/header customization
  - `AdminPaymentSettings.tsx` - Paymob payment gateway integration settings and SMTP email configuration
  - `AdminAnalytics.tsx` - Advanced analytics dashboard with comprehensive platform statistics
- **Admin Panel Enhanced:** Added Quick Access cards in Analytics tab linking to all new admin pages
- **Routing Updated:** All new pages integrated into App.tsx hash routing system
- **UI/UX:** Professional, glassmorphic design with bilingual support (Arabic/English) across all new pages
- **Framework Ready:** Pages prepared for backend integration - all settings save to localStorage temporarily until backend endpoints are implemented

## November 4, 2025 - Merchant Import Security & Statistics Improvements
- **Merchant import security:** Merchants now automatically import products to their own store only - removed merchant selector for merchant-role users and added server-side enforcement in startImport function
- **Product status management:** Added isActive field to all products (defaults to true), with toggle switch in Admin product dialog for easy activation/deactivation
- **Stock management:** Added Stock field to product management forms in Admin panel
- **Import UX improvements:** Clarified that import URL should be a collection/category page (e.g., your-store.com/collections/all) with bilingual instructions
- **Real statistics:** Replaced random/mock data in MerchantDashboard with real metrics - product views aggregated from actual data, page views fetched from API
- **API enhancements:** Added merchantsApi.getUserMerchant() method to fetch current user's merchant store

## November 4, 2025 - Admin Panel Enhancements & AI Configuration
- **Product filtering & bulk operations:** Added merchant/store dropdown filter, product checkboxes, "Select All" and "Delete Selected" buttons in admin panel
- **AI Settings page:** Created AdminAISettings.tsx with full control over AI provider (OpenAI/Anthropic/Custom), model selection, API key, temperature, max tokens, and system prompts
- **AI integration fixes:** Updated utils/aiSearch.ts to dynamically read custom AI settings from localStorage - all AI functions (smart search, image analysis, outfit generation) now honor user-configured settings
- **Data persistence:** AI settings stored in localStorage with reset-to-defaults option
- **Bug fixes:** Fixed productForm state to preserve stock field including zero values using nullish coalescing operator

## November 4, 2025 - Vercel to Replit Migration
- Configured Vite to bind to 0.0.0.0:5000 for Replit compatibility
- Fixed all versioned imports (removed @version suffixes from imports)
- Installed missing dependencies: @types/node, @tailwindcss/postcss, motion, next-themes
- Fixed asset imports to use relative paths instead of figma: protocol
- Configured deployment for Replit autoscale with npm run build/preview
- App now runs successfully on Replit with all features intact

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Hash-based routing for single-page application navigation
- Tailwind CSS v4 with custom design tokens for styling

**UI Component System:**
- Radix UI primitives for accessible components (dialogs, dropdowns, tabs, etc.)
- Custom glassmorphism design system with CSS variables for theming
- Responsive layouts with mobile-first approach
- Motion (Framer Motion) for animations and transitions

**State Management:**
- React Context API for global state (Language, Authentication)
- Local component state with useState hooks
- No external state management library (Redux, Zustand, etc.)

**Key Design Patterns:**
- Custom hook pattern for reusable logic (useLanguage, useAuth)
- Component composition with Radix UI slots
- CSS-in-JS through Tailwind classes and CSS variables
- Bilingual content through context switching

## Backend Architecture

**Platform:**
- Supabase Edge Functions (Deno runtime, not Node.js)
- Custom REST API endpoints using Hono framework
- Deployed separately from frontend (not bundled with Vite)

**Authentication:**
- Custom token-based authentication (NOT Supabase Auth)
- Base64-encoded JSON tokens with 30-day expiration
- Dual-header approach:
  - `Authorization: Bearer {SUPABASE_ANON_KEY}` for Edge Function access
  - `X-Access-Token: {USER_TOKEN}` for user authentication
- Manual token validation in Edge Functions

**API Structure:**
- RESTful endpoints under `/make-server-dec0bed9/` prefix
- Separate endpoints for users, merchants, products, statistics, imports
- Role-based access control (admin, merchant, user)
- CORS enabled for cross-origin requests

**Data Models:**
- Users: id, email, name, password (hashed), role
- Merchants: id, userId, brandName, status (pending/approved/rejected), contact info
- Products: id, merchantId, name, price, category, image, stock
- Import sessions: tracking for CSV/website/API imports
- Statistics: search queries, product views, merchant page views

## Data Storage

**Database:**
- Supabase PostgreSQL (though application may use Drizzle ORM without Postgres initially)
- In-memory arrays for demo/development data
- Edge Function local storage for session management

**File Storage:**
- External URLs for product images (no CDN integration yet)
- No file upload system implemented (URLs only)

**Caching Strategy:**
- No explicit caching layer implemented
- Browser localStorage for authentication tokens
- No Redis or in-memory cache

## External Dependencies

**Third-Party Services:**
- **Supabase:** Edge Functions hosting, future database integration
- **Replit:** Frontend deployment configured with autoscale (migrated from Vercel Nov 2025)

**External APIs:**
- Shopify JSON API for product imports (collections endpoint)
- WooCommerce support planned but not implemented
- Generic website scraping for product extraction

**NPM Packages (Key Dependencies):**
- `@supabase/supabase-js` - Supabase client
- `@radix-ui/*` - Accessible UI primitives
- `motion` (Framer Motion) - Animations
- `lucide-react` - Icon system
- `sonner` - Toast notifications
- `date-fns` - Date utilities
- `class-variance-authority` - Conditional className utility
- `hono` - Edge Function routing (in supabase/functions)

**Development Tools:**
- TypeScript 5.x for type checking
- Vite for bundling and HMR
- Tailwind CSS v4 with PostCSS
- ESLint for code quality (configuration present)

**Image Processing:**
- No image processing library (sharp, jimp, etc.)
- Image hashing planned but not implemented
- URL validation only

**AI/ML Integration:**
- OpenAI integration via javascript_openai_ai_integrations
- AI-powered smart search with Arabic/English support, color detection, and autocorrect (utils/aiSearch.ts)
- Outfit generator with image analysis, color selection, budget ranges, and custom prompts
- Product image color analysis using GPT-4 Vision
- Admin-configurable AI settings (provider, model, temperature, max tokens, system prompts) stored in localStorage
- Dynamic AI client initialization based on custom settings (getAISettings, getOpenAIClient)