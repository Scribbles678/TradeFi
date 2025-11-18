# 🚀 Quick Start - Authentication Setup

## ⚡ 3-Minute Setup

### **Step 1: Run Database Migration** (2 minutes)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy/paste contents of `tradefi/schema/auth_migration.sql`
4. Click **Run**

### **Step 2: Start Dev Server** (30 seconds)

```bash
cd tradefi
npm run dev
```

### **Step 3: Register Your Account** (30 seconds)

1. Visit `http://localhost:3001`
2. You'll be redirected to `/login`
3. Click "Sign Up"
4. Enter your email and password
5. Click "Create Account"
6. Sign in with your credentials

---

## ✅ What You Should See

### **After Login:**
- ✅ Your initials in a colored circle (top-right)
- ✅ Dropdown menu with "Account Settings" and "Sign Out"
- ✅ Access to all pages (Dashboard, Performance, etc.)
- ✅ Account page shows your real email

### **Header:**
- **Desktop**: Navigation links + User avatar with dropdown
- **Mobile**: User avatar + hamburger menu

---

## 🔧 Optional: Clean Up Existing Data

If you have existing API keys/data, run this in Supabase SQL Editor:

```sql
-- Option 1: Delete all existing data (start fresh)
DELETE FROM public.trades;
DELETE FROM public.positions;
DELETE FROM public.strategies;
DELETE FROM public.bot_credentials;

-- Option 2: Assign to your user (replace YOUR_USER_ID)
-- Get your user ID from: Dashboard → Authentication → Users
UPDATE public.bot_credentials SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
```

---

## 🎯 Test It Works

1. **Sign In** - Should redirect to dashboard
2. **Check Header** - See your avatar
3. **Click Avatar** - Dropdown appears
4. **Go to Account** - See your real email
5. **Sign Out** - Redirects to login
6. **Try to access pages** - Redirects to login

---

## 📚 Full Documentation

- **Setup Guide**: `docs/AUTH_SETUP_GUIDE.md`
- **Phase 1 Complete**: `docs/PHASE1_COMPLETE.md`
- **Migration SQL**: `schema/auth_migration.sql`

---

## 🐛 Issues?

### **Can't access pages**
- Make sure you've run the migration
- Check you're signed in (avatar in header)

### **Don't see existing API keys**
- Run Option 2 above to assign data to your user

### **Redirect loop**
- Clear browser cookies/cache
- Restart dev server

---

## 🎉 You're Done!

Your authentication system is ready. Users can now:
- Register and login
- Have their data isolated
- See their profile info
- Sign out securely

**Next:** Phase 2 - Complete multi-tenancy for all features!

