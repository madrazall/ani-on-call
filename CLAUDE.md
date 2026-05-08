# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite exists yet.

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS 4 · Supabase (auth + DB) · Stripe · XLSX

## Architecture

**Ani On Call** is a credit-based shipping analytics SaaS. Users upload CSV/Excel shipping exports, select analysis types, and consume credits per analysis.

### Auth

Supabase email/password auth. Middleware in `proxy.ts` (exported as `middleware`) protects `/upload`, `/reports`, `/admin` and refreshes sessions on every request. OAuth callback at `/auth/callback` exchanges the code for a session and redirects to `/upload`.

### Credit System

Three packages defined in `lib/packages.ts`. Purchase flow: `/buy` page → server action `createCheckoutSession` → Stripe-hosted checkout → webhook at `/api/webhooks/stripe` calls the `increment_credits(user_id, amount)` Supabase RPC. Credit deduction at `/api/analyze` is atomic via `deduct_credits(user_id, amount)` RPC (returns error if balance insufficient). The `credits` table holds balances; `credit_transactions` is the audit log.

### Upload & Analysis Flow

Multi-step client component in `app/upload/upload-flow.tsx`:

1. Select outcome(s) from `lib/outcomes.ts` (4 types, 1–3 credits each)
2. Upload file — XLSX parsing happens **client-side** to extract headers only
3. Column mapping — `lib/column-detection.ts` scores header aliases and greedily assigns the best unique match per concept (carrier, ship_date, order_id, tracking_number, ship_cost, service, weight)
4. Confirm credit cost
5. POST FormData to `/api/analyze` with `outcomeIds` + `columnMap`

`/api/analyze` deducts credits atomically, creates a `reports` row with `status: 'pending'`, and returns `{ reportId }`. Actual analysis logic is Phase 3 (not yet built).

### Key Non-Obvious Details

- `proxy.ts` (not `middleware.ts`) is where Next.js middleware is exported
- The Stripe API version in `lib/stripe.ts` is `2026-04-22.dahlia` — don't change it
- Column detection runs entirely on the client; the server only receives the resolved `columnMap`
- `app/buy/actions.ts` is a `'use server'` file imported by a client page — keep it server-only
- Nav (`components/nav.tsx`) is a server component that fetches the live credit balance on every render
- Vendor detection (`lib/vendors.ts`) is UX-only context — it doesn't change analysis logic
