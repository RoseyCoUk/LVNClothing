# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build

### Backend Development (Supabase)
- `supabase start` - Start local Supabase development environment
- `supabase stop` - Stop local Supabase services
- `supabase db reset` - Reset local database with migrations and seed data
- `supabase functions serve` - Serve edge functions locally
- `supabase functions deploy [function-name]` - Deploy specific edge function

### Testing Commands
- `npm run test:tshirts` - Test t-shirt variants
- `npm run test:hoodies` - Test hoodie variants  
- `npm run test:caps` - Test cap variants
- `npm run test:totebags` - Test tote bag variants
- `npm run test:waterbottles` - Test water bottle variants
- `npm run test:mousepads` - Test mousepad variants
- `npm run test:mugs` - Test mug variants

### Admin/Setup Commands
- `npm run setup:admin` - Set up admin user and backend
- `npm run deploy:admin` - Deploy admin backend functions
- `npm run printful:sync` - Sync products with Printful API

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Payment**: Stripe integration
- **E-commerce**: Printful integration for print-on-demand products
- **Routing**: React Router DOM v7

### Key Directory Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, Cart, Shipping, Admin)
├── hooks/              # Custom hooks (product variants, bundles, shipping)
├── lib/                # Utility libraries (API, Stripe, Printful, shipping)
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge functions for API endpoints
├── migrations/         # Database schema migrations
└── config.toml         # Local development configuration
```

### Core Architecture Patterns

#### State Management
- React Context API for global state (AuthContext, CartContext, AdminContext, etc.)
- Custom hooks for specific domain logic (useBundlePricing, useShippingQuotes, etc.)

#### API Integration
- Supabase client for database operations (`src/lib/api.ts`)
- Printful API integration through Edge functions (`supabase/functions/printful-*`)
- Stripe payment processing (`src/lib/stripe.ts`)

#### Product Management
- Database-driven product catalog with Printful synchronization
- Variant-based product system (colors, sizes) with dedicated hooks per product type
- Bundle pricing system for multi-product purchases

#### Admin System
- Separate admin context and authentication flow
- Admin-specific Edge functions for management operations
- Real-time product synchronization monitoring

### Development Environment Setup

1. **Database**: Local Supabase instance runs on ports 54321-54327
2. **Frontend**: Vite dev server on port 5173
3. **Authentication**: Configured for localhost with email/password auth
4. **Storage**: Supabase storage for product images (50MiB limit)

### Key Integration Points

#### Printful Integration
- Product variants are synchronized from Printful catalog
- Each product type has dedicated variant hooks (`src/hooks/*-variants.ts`)
- Shipping quotes fetched through Printful API via Edge functions

#### Payment Processing
- Stripe checkout integration with webhook handling
- Order processing through Edge functions (`stripe-checkout`, `stripe-webhook2`)
- Order tracking and customer email notifications

#### Shipping System
- Dynamic shipping quote calculation based on cart contents
- Integration with Printful shipping API
- Support for shipping method selection during checkout

### Important Notes

- The system uses Row Level Security (RLS) policies in Supabase for data access control
- Admin functions require specific user roles and authentication
- Product images are stored in Supabase storage buckets
- Real-time features use Supabase realtime subscriptions
- Edge functions handle sensitive API operations (Printful, Stripe)

### Testing Strategy
- Individual product variant testing through dedicated npm scripts
- Integration testing for admin functions and API endpoints
- Frontend components use responsive design testing hooks