# Stripe Integration Setup Guide

## Overview
Stripe integration is now set up for subscription payments. This guide will help you complete the configuration.

## Environment Variables Required

Add these to your `.env` file (and Netlify environment variables):

```bash
# Stripe API Keys (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard > Webhooks

# Stripe Price IDs (OPTIONAL - but recommended)
# If not set, the code will try to look up products by name in Stripe
# However, it's best practice to set these for reliability and to support test/live mode
STRIPE_PRICE_ID_BASIC=price_... # Basic plan ($19/month) - Optional
STRIPE_PRICE_ID_PREMIUM=price_... # Premium plan ($39/month) - Optional
STRIPE_PRICE_ID_PRO=price_... # Pro plan ($59/month) - Optional

# Site URL (for redirects)
SITE_URL=https://yourdomain.com # or http://localhost:3001 for local dev
```

## Step-by-Step Setup

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
5. Add both to your `.env` file

### 2. Create Products and Prices in Stripe

**Why Price IDs?** Stripe uses Price IDs to uniquely identify which product and pricing tier to charge. When you create a product and price in Stripe, you get a Price ID (like `price_1234567890`) that you use in the API.

**Two Options:**

#### Option A: Set Price IDs in Environment (Recommended)
1. Go to **Products** in Stripe Dashboard
2. Create 3 products with these exact names:
   - **Basic** - $19/month (recurring, monthly)
   - **Premium** - $39/month (recurring, monthly)
   - **Pro** - $59/month (recurring, monthly)
3. For each product, create a **Recurring** price (monthly)
4. Copy the **Price ID** for each (starts with `price_`)
5. Add to `.env`:
   - `STRIPE_PRICE_ID_BASIC=price_...`
   - `STRIPE_PRICE_ID_PREMIUM=price_...`
   - `STRIPE_PRICE_ID_PRO=price_...`

**Benefits:**
- ✅ Works with different Price IDs for test/live mode
- ✅ More reliable (no API lookups needed)
- ✅ Faster checkout creation

#### Option B: Auto-Lookup by Product Name (Fallback)
If you don't set Price IDs, the code will:
1. Search Stripe for products matching the plan name ("Basic", "Premium", "Pro")
2. Use the first active price found for that product

**Benefits:**
- ✅ No env vars needed
- ✅ Simpler setup

**Drawbacks:**
- ⚠️ Requires API call to Stripe (slower)
- ⚠️ Must match product names exactly
- ⚠️ Can't easily switch between test/live Price IDs

**Recommendation:** Use Option A (Price IDs in env) for production.

### 3. Set Up Stripe Webhook

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Set Site URL

Add `SITE_URL` to your `.env`:
- **Production**: `https://yourdomain.com`
- **Local dev**: `http://localhost:3001`

## API Endpoints Created

1. **POST `/api/stripe/create-checkout`** - Creates Stripe Checkout session
2. **POST `/api/stripe/webhook`** - Handles Stripe webhook events
3. **GET `/api/stripe/subscription`** - Get user's subscription
4. **POST `/api/stripe/subscription`** - Update subscription (cancel, resume)
5. **DELETE `/api/stripe/subscription`** - Cancel subscription immediately

## How It Works

1. User clicks "Subscribe" on a plan
2. Frontend calls `/api/stripe/create-checkout` with plan name
3. Backend creates Stripe Checkout session and returns URL
4. User is redirected to Stripe Checkout
5. After payment, Stripe sends webhook to `/api/stripe/webhook`
6. Webhook handler updates `subscriptions` table in database
7. User is redirected back to subscription page with success message

## Testing

### Test Mode
- Use `sk_test_...` and `pk_test_...` keys
- Use Stripe test cards: `4242 4242 4242 4242`
- Any future expiry date, any CVC

### Production
- Switch to `sk_live_...` and `pk_live_...` keys
- Update webhook endpoint to production URL
- Update `SITE_URL` to production domain

## Database

The `subscriptions` table stores:
- User's plan and status
- Stripe subscription/customer IDs
- Billing period dates
- Cancellation info

Make sure you've run the `schema/subscriptions.sql` migration!

## Next Steps

1. ✅ Add Stripe keys to `.env`
2. ✅ Create products/prices in Stripe Dashboard
3. ✅ Set up webhook endpoint
4. ✅ Test checkout flow
5. ⏳ (Optional) Implement Stripe Customer Portal for self-service management
6. ⏳ (Optional) Add invoice fetching/display

