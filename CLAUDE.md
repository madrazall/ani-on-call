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

## What This App Is

**Ani On Call** is a credit-based shipping analytics SaaS named after the founder's mom Annie. Users upload CSV/Excel shipping exports, answer a guided decision tree to identify their problem, and consume credits to run an analysis. Results are plain-English summaries with labeled findings, downloadable as a spreadsheet.

**Brand voice:** Warm, direct, no jargon. Ani is like a mom and a therapist — she's seen this before and she'll tell you straight. Never condescending, never corporate.

**Live at:** `https://ani-on-call.vercel.app` (also `https://anioncall.digital` — DNS connected, SSL pending full propagation)

---

## Architecture

### Auth

Supabase email/password auth. Middleware in `proxy.ts` (exported as `middleware`) protects `/upload`, `/reports`, `/admin` and refreshes sessions on every request. OAuth callback at `/auth/callback` exchanges the code for a session and redirects to `/upload`.

Email confirmation is sent via Resend SMTP. Supabase SMTP settings point to `smtp.resend.com` with the Resend API key as password. Sender address is `noreply@send.anioncall.digital` — the `send.` subdomain is what's verified in Resend, not the root domain.

### Credit System

Three packages defined in `lib/packages.ts` (Starter $5/5cr, Standard $12/15cr, Pro $35/50cr). Purchase flow: `/buy` page → server action `createCheckoutSession` → Stripe-hosted checkout → webhook at `/api/webhooks/stripe` calls the `increment_credits(user_id, amount)` Supabase RPC.

Credit deduction at `/api/analyze` is atomic via `deduct_credits(user_id, amount)` RPC (returns false if balance insufficient). The `credits` table holds balances; `credit_transactions` is the audit log with a `stripe_session_id` column for idempotency.

Both RPCs (`increment_credits`, `deduct_credits`) must exist in Supabase and have `EXECUTE` granted to `service_role`. The webhook uses the admin client (service role key) — if this key is wrong, credits will silently fail to update.

### Intake Engine (Decision Tree)

Before uploading, users answer a short question tree defined in `lib/intake/shipping.ts`. Three categories:
- `losing-money` — binary questions → routes to margin-erosion / duplicate-charges / budget-breakdown
- `unpredictable-costs` — binary questions → routes to carrier-variance / packaging-variance / budget-breakdown
- `operational-issues` — select question → routes to carrier-performance / fulfillment-integrity / return-pressure

`resolveRoute(category, answers)` in `lib/intake/index.ts` returns a single outcome ID. The upload flow then proceeds with that outcome pre-selected.

### Upload & Analysis Flow

Multi-step client component in `app/upload/upload-flow.tsx` — 6 steps:

1. **Select** — intake engine (category → Q&A → outcome resolved)
2. **Guide** — shows required columns for the resolved outcome, credit cost
3. **Upload** — drag/drop CSV or Excel (max 5MB, client-side parse)
4. **Map** — column mapping; `lib/column-detection.ts` auto-detects headers, user confirms
5. **Confirm** — shows credit cost vs live balance; blocks if insufficient
6. **Submitting** — animated dots while POST is in flight

`/api/analyze` deducts credits atomically, creates a `reports` row, runs all 8 analyzers synchronously, updates the row with results and `status: 'complete'`, then returns `{ reportId }`. The client redirects to `/reports/[id]`.

### Analysis Engine

Eight analyzers in `lib/analyzers/index.ts`:

| ID | Credits | What it does |
|---|---|---|
| `carrier-performance` | 1 | Groups by carrier, counts shipments, calculates share |
| `duplicate-charges` | 3 | Finds order IDs and tracking numbers that appear more than once |
| `budget-breakdown` | 2 | Sums ship_cost by carrier, calculates total and per-carrier spend |
| `margin-erosion` | 3 | Cost-per-weight analysis, flags outliers >2× average |
| `carrier-variance` | 2 | Min/max/avg/spread per carrier |
| `packaging-variance` | 2 | Cost by weight bucket (under 1lb, 1–5, 5–10, over 10) |
| `fulfillment-integrity` | 3 | Missing tracking + tracking numbers linked to multiple orders |
| `return-pressure` | 2 | Multi-shipment orders as proxy for returns/re-ships |

`extractRows(rawRows, columnMap)` maps raw spreadsheet rows to concept-keyed objects before analysis.

### Reports

`/reports/[id]` shows three states: pending (animated dots), error, complete. Complete state shows outcome name, intro paragraph, plain-English summary, and findings rows. Highlighted findings render in copper. A **Download as spreadsheet** button (client component `download-button.tsx`) generates an XLSX with one sheet per outcome.

### Landing Page

Full marketing page at `/` with four sections:
1. **Hero** — "Not Ani's first rodeo." eyebrow + rotating quote component (`components/rotating-quote.tsx`) that cycles through 8 real business owner pain points every 4.5s with a card flip animation
2. **The problem** — three things users aren't checking (duplicates, rate inconsistency, weight bracket creep)
3. **How it works** — three numbered steps
4. **Bottom CTA** — "Ani's seen this before."

### Background Sketches

`components/background-sketches.tsx` renders 6 fixed-position SVG illustrations at 14–20% opacity (route network, packing slip, isometric box, barcode strip, location pins, weight scale). Wired into `app/layout.tsx` before the nav.

---

## Key Non-Obvious Details

- `proxy.ts` (not `middleware.ts`) is where Next.js middleware is exported — the auth guard lives in `lib/supabase/middleware.ts` called from there
- The Stripe API version in `lib/stripe.ts` is `2026-04-22.dahlia` — don't change it
- Column detection runs entirely on the client; the server only receives the resolved `columnMap`
- `app/buy/actions.ts` is a `'use server'` file imported by a client page — keep it server-only
- Nav (`components/nav.tsx`) is a server component that fetches the live credit balance on every render
- The `SUPABASE_SERVICE_ROLE_KEY` must NOT have a leading `y` — it should start with `eyJ`. If credits aren't updating after purchase, check this first
- `NEXT_PUBLIC_APP_URL` must be set in Vercel env vars (not just `.env.local`) — Stripe uses it to build `success_url` and `cancel_url`
- The Stripe webhook endpoint must point to the Vercel URL (`https://ani-on-call.vercel.app/api/webhooks/stripe`), not the custom domain, until SSL is fully provisioned on `anioncall.digital`
- Each outcome in `lib/outcomes.ts` has an `intro` field — this renders as contextual text above the summary in the report card
- `.env.local` is gitignored — never commit it

---

## In Progress / Next Up

- **Platform presets** — hardcoded column maps for known shipping platforms (ShipStation, Pirateship, EasyPost, FedEx billing, UPS billing) so users don't need to do column mapping. Waiting on sample export files to extract exact column names. Architecture is planned: each preset is a `Record<ConceptId, string>` stored in `lib/presets/`.
- **Multi-source merge** — allow uploading multiple files from different platforms, applying a preset to each, merging normalized rows before analysis
- **Custom domain SSL** — `anioncall.digital` is connected to Vercel DNS but SSL cert may still be propagating. Once live, update the Stripe webhook URL.
- **Sign in / sign up visual polish** — pages are functional and on-brand; could go further if needed
