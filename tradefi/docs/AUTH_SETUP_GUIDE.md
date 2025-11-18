# Authentication Setup Guide

## 🎯 What We've Built

You now have a complete authentication system with:
- ✅ Modern login/register page
- ✅ User avatar and dropdown in header
- ✅ Protected routes (must be logged in)
- ✅ Database multi-tenancy with RLS
- ✅ User-specific data isolation

---

## 📋 Setup Steps

### **Step 1: Run Database Migration**

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `tradefi/schema/auth_migration.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

This will:
- Add `user_id` columns to all tables
- Enable Row-Level Security (RLS)
- Create RLS policies for data isolation
- Create `user_profiles` table
- Set up auto-profile creation on signup

---

### **Step 2: Handle Existing Data (Choose One)**

#### **Option A: Start Fresh (Recommended)**
If you're okay wiping existing data:

```sql
-- Run this in Supabase SQL Editor
DELETE FROM public.trades;
DELETE FROM public.positions;
DELETE FROM public.strategies;
DELETE FROM public.bot_credentials;
DELETE FROM public.trade_settings_global;
DELETE FROM public.trade_settings_exchange;
```

#### **Option B: Assign to Your User**
If you want to keep existing data:

1. First, register your account at `/login`
2. Go to **Supabase Dashboard** → **Authentication** → **Users**
3. Copy your User ID (UUID)
4. Run this SQL (replace `YOUR_USER_ID` with your actual UUID):

```sql
-- Assign all existing data to your user
UPDATE public.strategies SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE public.trades SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE public.positions SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE public.bot_credentials SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE public.trade_settings_global SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE public.trade_settings_exchange SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
```

---

### **Step 3: Enable Email Auth in Supabase**

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: OFF (for development)
   - **Enable email confirmations**: ON (for production)
4. Save changes

---

### **Step 4: Test the System**

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3001`
3. You should be redirected to `/login`
4. Click "Sign Up" and create an account
5. After registration, sign in
6. You should see:
   - Your initials in a colored circle (top-right)
   - Dropdown menu with "Account Settings" and "Sign Out"
   - Access to all pages

---

## 🔐 How It Works

### **Authentication Flow**
1. User visits any page
2. Middleware checks if user is logged in
3. If not logged in → redirect to `/login`
4. If logged in → allow access

### **Data Isolation**
- Every table has a `user_id` column
- Row-Level Security (RLS) policies enforce:
  - Users can only see their own data
  - Users can only create/update/delete their own data
- Even if someone tries to hack the API, RLS blocks them

### **User Profile**
- Automatically created when user signs up
- Stores: email, full_name, avatar_url
- Can be extended with more fields later

---

## 🚀 What's Next

Now that authentication is working, we need to:

1. **Update API Routes** - Make sure all server routes filter by `user_id`
2. **Update Account Page** - Show real user data from Supabase Auth
3. **Add User Profile Editing** - Let users update their name/avatar
4. **Test Multi-User** - Create a second account and verify data isolation

---

## 🐛 Troubleshooting

### **"User is not authenticated" error**
- Make sure you've run the migration
- Check that RLS is enabled on all tables
- Verify your Supabase keys in `.env`

### **Can't see existing data after login**
- Run Option B from Step 2 to assign data to your user
- Or delete existing data and start fresh

### **Email confirmation required**
- Go to Supabase Dashboard → Authentication → Providers
- Disable "Enable email confirmations" for development

### **Redirect loop**
- Clear your browser cache/cookies
- Check middleware is working correctly

---

## 📝 Environment Variables

Make sure your `.env` file has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from: **Supabase Dashboard** → **Settings** → **API**

---

## ✅ Checklist

- [ ] Run database migration in Supabase
- [ ] Handle existing data (delete or assign)
- [ ] Enable email auth in Supabase
- [ ] Test registration and login
- [ ] Verify user dropdown works
- [ ] Test sign out
- [ ] Create second account to test isolation

---

**You're all set! 🎉**

The authentication foundation is complete. Users can now register, login, and have their data isolated from other users.

