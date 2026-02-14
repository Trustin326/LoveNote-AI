# LoveNote AI — V2 Real Payment Locked Sell Version

## What this V2 does
- **Supabase login**
- **Real paywall**: features unlock ONLY when `lovenote_entitlements.active = true` for the logged-in user.
- **Stripe verification is server-side** via Netlify Functions:
  - `create-checkout-session` creates a Checkout session.
  - `verify-session` verifies `session_id` and **writes entitlements** in Supabase using service role key.

## 1) Supabase setup
1. Go to Supabase SQL Editor → run `supabase/schema.sql`.
2. Confirm tables exist:
   - `lovenote_entitlements`
   - `lovenote_events`

## 2) Deploy (recommended: Netlify)
This V2 needs a serverless backend for Stripe verification.
1. Push this repo to GitHub.
2. Create a Netlify site from the repo.
3. In Netlify → Site settings → Environment variables, add:
   - `STRIPE_SECRET_KEY` = your Stripe secret key (sk_live_...)
   - `SUPABASE_URL` = https://xsrgfbhxhavasrjscaik.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
   - `SITE_URL` = your Netlify site URL
   - `PRICE_STARTER` / `PRICE_CREATOR` / `PRICE_DELUXE` = Stripe Price IDs

## 3) Stripe setup (important)
Use **Stripe Checkout with Price IDs** (recommended).
- Create Products + Prices in Stripe, copy Price IDs into Netlify env vars.
- The Pricing buttons on `index.html` call the Netlify function to start checkout.

## Notes
- Your Supabase URL + anon are already embedded in `js/supabase-config.js`.
- Owner bypass: click “Owner Mode” (sets localStorage) — remove this before public launch if you want.
