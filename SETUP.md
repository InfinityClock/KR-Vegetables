# KR Vegetables & Fruits — Setup Guide

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## 1 · Supabase Setup

### 1.1 Create a project
1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **anon public key** from Project Settings → API

### 1.2 Run migrations
In the Supabase Dashboard → SQL Editor, run **in order**:

```
supabase/migrations/001_initial_schema.sql   ← tables + RLS
supabase/migrations/002_seed_data.sql        ← 80+ products seeded
```

### 1.3 Create Storage bucket
Dashboard → Storage → New Bucket:
- Name: `product-images`
- Public bucket: ✅ Yes

Add this policy on the bucket (Storage → Policies):
```sql
-- Allow anyone to read
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow admin to upload
CREATE POLICY "admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.jwt() ->> 'role' = 'admin'
  );
```

### 1.4 Create the Admin user
In Supabase Dashboard → Authentication → Users → Invite User:
- Email: `admin@krvegetables.com`
- After creation, run this SQL to grant admin role:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@krvegetables.com';
```

---

## 2 · Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## 3 · Razorpay Setup

### 3.1 Get keys
1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate Key
3. Copy **Key ID** (starts with `rzp_test_`) → `.env`
4. Copy **Key Secret** → Supabase Edge Function secrets (below)

### 3.2 Edge Function secrets
```bash
# Install Supabase CLI first: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_here

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy auto-expire-offers
```

---

## 4 · Enable Phone Auth (OTP)

Dashboard → Authentication → Providers → Phone:
- Enable Phone provider ✅
- Configure your SMS provider (Twilio recommended)
  - Get free trial at https://twilio.com
  - Add Account SID, Auth Token, and Twilio phone number

> **Dev shortcut**: In Supabase Auth settings, enable "Disable email confirmation" and use test phone numbers with OTP `123456`.

---

## 5 · Realtime (for live order tracking)

Dashboard → Database → Replication:
- Enable realtime for: `orders`, `order_tracking`

---

## 6 · Supabase Settings

Update `store_settings` table with your real values:

```sql
UPDATE store_settings SET value = '+91XXXXXXXXXX' WHERE key = 'whatsapp_number';
UPDATE store_settings SET value = 'your-store@upi' WHERE key = 'upi_id';
UPDATE store_settings SET value = 'Your Store Address' WHERE key = 'store_address';
```

---

## 7 · Project Structure

```
/src
  /components      BottomNav, ProductCard, Skeleton, Onboarding...
  /pages
    /customer      Home, Shop, ProductDetail, Cart, Checkout,
                   OrderSuccess, OrderTracking, Orders, Profile, Auth
    /admin         Layout, Login, Dashboard, Orders, Products,
                   Categories, Offers, Delivery, Settings
  /store           cartStore, authStore, uiStore (Zustand)
  /hooks           useProducts, useOrders, useAuth
  /lib             supabase.js, razorpay.js
  /utils           format.js (₹ formatting, dates, order numbers)
  /constants       delivery slots, status labels, colors
/supabase
  /migrations      001_initial_schema.sql, 002_seed_data.sql
  /functions       create-razorpay-order, verify-razorpay-payment,
                   auto-expire-offers
```

---

## 8 · URLs

| Route | Description |
|-------|-------------|
| `/` | Customer home |
| `/shop` | Product catalogue |
| `/product/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (login required) |
| `/order-success/:id` | Order confirmation |
| `/track/:id` | Live order tracking |
| `/orders` | Order history |
| `/profile` | Customer profile |
| `/auth` | Phone OTP login |
| `/admin` | Admin dashboard |
| `/admin/orders` | Order management |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/offers` | Offers & promotions |
| `/admin/delivery` | Delivery slot settings |
| `/admin/settings` | Store settings |

---

## 9 · Deploy

```bash
npm run build      # outputs to /dist

# Deploy to Vercel (recommended)
npx vercel --prod

# Or Netlify
npx netlify deploy --prod --dir=dist
```

Add your environment variables in the hosting provider's dashboard.

---

## 10 · Schedule auto-expire offers

In Supabase Dashboard → Edge Functions → Schedules, add:
- Function: `auto-expire-offers`
- Schedule: `0 * * * *` (every hour)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand v5 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Payments | Razorpay |
| Charts | Recharts |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Fonts | Playfair Display + DM Sans |
