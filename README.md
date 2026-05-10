# SHIT — UI Redesign

Complete visual overhaul for your shipping analysis app. Same functionality, much better feel.

## What's changed

### Visual system
- **Warm cream background** (`#faf9f7`) instead of cold gray — feels human, not corporate
- **Warm charcoal text** (`#1c1917`) — easier on the eyes than pure black
- **Subtle card-based layout** with soft borders — content breathes better
- **Improved spacing and typography hierarchy** — Geist font stays, but used better

### Pages redesigned

| Page | What's new |
|------|-----------|
| **Homepage** (`app/page.tsx`) | Stats grid, clearer CTA hierarchy, warmer feel |
| **Sign up** (`app/sign-up/page.tsx`) | Cleaner layout, email icon confirmation state, friendlier error styling |
| **Sign in** (`app/sign-in/page.tsx`) | Matching layout, redirects to `/upload` on success |
| **Buy credits** (`app/buy/page.tsx`) | Card-based pricing with "Best value" badge, feature lists, clearer value prop |
| **Upload + analyze** (`app/upload/page.tsx`) | **New 2-step flow**: 1) Pick outcome, 2) Upload file. Progress bar, drag-and-drop zone, clear states |
| **Navigation** (`components/nav.tsx`) | Cleaner auth states, pill-style buttons, sticky header |

### New files
- `lib/packages.ts` — Credit package data (Starter/Standard/Pro)
- `lib/outcomes.ts` — Your existing analysis types (moved from `app/outcomes.ts` for consistency)
- `app/buy/actions.ts` — Stripe checkout server action
- `app/sign-in/page.tsx` — New login page

## How to apply

1. **Back up your current files**
2. **Replace these files** in your project:
   - `app/globals.css`
   - `app/layout.tsx`
   - `app/page.tsx`
   - `app/sign-up/page.tsx`
   - `app/sign-in/page.tsx` (new)
   - `app/buy/page.tsx` (new)
   - `app/buy/actions.ts` (new — or keep your existing `actions.ts`)
   - `app/upload/page.tsx` (new)
   - `components/nav.tsx`
   - `lib/packages.ts` (new)
   - `lib/outcomes.ts` (move from `app/outcomes.ts` if you had it there)
3. **Update imports** if your `outcomes.ts` was in a different location
4. **Add your analysis API call** in `app/upload/page.tsx` where the `// TODO: call your analysis API` comment is
5. **Wire up results page** — the upload page currently has a commented-out redirect to `/results`

## What you still need to build

- **Results page** (`app/results/page.tsx`) — where users see their plain-English analysis output
- **Checkout success/cancel pages** if you don't have them
- Your actual analysis API integration in the upload page

## Key design decisions

- **No shadcn/ui** — kept it lightweight with Tailwind + custom CSS variables
- **CSS variables** in `globals.css` make it easy to tweak colors globally
- **2-step upload flow** reduces overwhelm — pick what you want first, then give us the file
- **Progress bar** gives users a sense of where they are in the process
- **Friendly microcopy preserved** — "Either way, now you know" and similar tone stays intact
