# Overview

Outfred is a modern fashion discovery platform built with React, TypeScript, and Supabase. It provides smart search capabilities, merchant store management, and AI-powered outfit generation. The platform supports bilingual interfaces (Arabic/English) and features a comprehensive admin panel for managing users, merchants, and products.

**Platform:** Successfully migrated from Vercel to Replit (November 2025)

# Recent Changes

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