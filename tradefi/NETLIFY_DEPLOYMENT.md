# 🚀 Netlify Deployment Guide for TradeFI Dashboard

## ✅ Pre-Deployment Checklist

### 1. **Repository Setup**
- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible to Netlify
- [ ] All changes are committed

### 2. **Build Configuration**
- [x] `netlify.toml` is configured with Node.js version 22.12.0
- [x] Build command: `npm run build`
- [x] Publish directory: `.output/public`
- [x] Nuxt preset set to `netlify` in `nuxt.config.ts`

### 3. **Base Directory Configuration**
⚠️ **CRITICAL**: Your project is in a subdirectory called `tradefi`

In Netlify dashboard:
- **Base directory**: `tradefi`
- **Build command**: `npm run build`
- **Publish directory**: `tradefi/.output/public`

## 🔐 Required Environment Variables

Configure these in **Netlify Dashboard → Site Settings → Environment Variables**:

### **Essential (Required for app to work):**
```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://yfzfdvghkhctzqjtwajy.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_KEY=your_supabase_anon_key_here  # Same as SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Node Environment
NODE_ENV=production
```

### **Exchange APIs (Optional - app will show errors for missing exchanges):**
```bash
# Aster DEX (Crypto)
ASTER_API_KEY=your_aster_key
ASTER_API_SECRET=your_aster_secret

# OANDA (Forex)
OANDA_API_KEY=your_oanda_token
OANDA_ACCOUNT_ID=your_account_id
OANDA_BASE_URL=https://api-fxpractice.oanda.com

# Tradier (Stocks/Options)
TRADIER_TOKEN=your_tradier_token
TRADIER_ACCOUNT_ID=your_account_id

# Tasty Trade (Futures)
TASTYTRADE_CLIENT_ID=your_client_id
TASTYTRADE_CLIENT_SECRET=your_client_secret
TASTYTRADE_USERNAME=your_username
TASTYTRADE_PASSWORD=your_password
TASTYTRADE_ACCOUNT_ID=your_account_id

# Sparky Bot (Optional)
SPARKY_BOT_URL=your_bot_url
SPARKY_WEBHOOK_URL=your_webhook_url
```

## 📋 Step-by-Step Deployment

### **Step 1: Connect Repository to Netlify**

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `TradeFI` repository

### **Step 2: Configure Build Settings**

In the "Site settings" page:

```
Base directory: tradefi
Build command: npm run build
Publish directory: tradefi/.output/public
```

⚠️ **Important**: Do NOT use `.output/public` alone - must be `tradefi/.output/public`

### **Step 3: Set Environment Variables**

1. Go to **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Add all required variables from the list above (at minimum, all Supabase variables)

### **Step 4: Deploy**

1. Click "Deploy site"
2. Netlify will:
   - Install dependencies (`npm install`)
   - Build the app (`npm run build`)
   - Deploy to their CDN

### **Step 5: Verify Deployment**

After deployment completes:

✅ **Check these:**
- [ ] Site loads without errors
- [ ] Login page is accessible
- [ ] Can log in with Supabase credentials
- [ ] Dashboard loads after login
- [ ] No console errors in browser dev tools

## 🐛 Common Deployment Issues & Solutions

### **Issue 1: "Page Not Found" on refresh**

**Symptom**: App works on first load, but refreshing any page shows 404

**Solution**: Already fixed in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

### **Issue 2: "Build Failed - Module not found"**

**Symptom**: Build fails with missing module errors

**Solution**:
1. Delete `node_modules` and `package-lock.json` locally
2. Run `npm install`
3. Commit the new `package-lock.json`
4. Push to trigger new build

### **Issue 3: "Supabase URL is not defined"**

**Symptom**: Runtime error about missing Supabase URL

**Solution**:
1. Verify environment variables in Netlify dashboard
2. Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Clear cache and redeploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### **Issue 4: "Function bundling error"**

**Symptom**: Build fails during Nitro bundling

**Solution**:
Already fixed in `nuxt.config.ts`:
```typescript
nitro: {
  preset: 'netlify',
  node: true,
  minify: true,
}
```

### **Issue 5: "Crypto module not found"**

**Symptom**: Runtime error about `node:crypto` module

**Solution**: Already using Node.js 22.12.0 which includes native crypto. If issue persists:
1. Check Netlify build logs for Node version
2. Verify `NODE_VERSION = "22.12.0"` in `netlify.toml`

### **Issue 6: Build succeeds but site shows blank page**

**Symptom**: Deployment succeeds but site doesn't load

**Checklist**:
1. Check browser console for JavaScript errors
2. Verify base directory is set to `tradefi` in Netlify
3. Verify publish directory is `tradefi/.output/public`
4. Check that all Supabase env vars are set
5. Try clearing Netlify cache: **Site settings** → **Build & deploy** → **Clear cache**

### **Issue 7: "Failed to load module"**

**Symptom**: Build or runtime errors about missing modules

**Solution**:
```bash
# Locally:
cd tradefi
rm -rf node_modules .nuxt .output
npm install
npm run build

# Test locally first:
npm run preview

# If it works, commit and push:
git add .
git commit -m "Fix dependencies"
git push
```

## 🔍 Debugging Build Failures

### **View Build Logs:**
1. Go to Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click on the failed deploy
5. Click "Deploy log" to see full output

### **Common Log Errors:**

**"Command failed with exit code 1"**
- Check for TypeScript errors in your code
- Run `npm run build` locally to reproduce

**"Error: Cannot find module"**
- Missing dependency in `package.json`
- Run `npm install <missing-package>` and commit

**"Killed" or "Out of memory"**
- Build process ran out of memory
- Upgrade Netlify plan or optimize build
- Try reducing bundle size

## 🎯 Optimization Tips

### **1. Reduce Bundle Size**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ... existing config
  build: {
    transpile: ['chart.js']
  }
})
```

### **2. Enable Compression**
Already enabled via Netlify automatically

### **3. Optimize Images**
Images in `/public` folder are automatically optimized by Netlify

### **4. Enable Edge Functions (Optional)**
For faster API responses, consider Netlify Edge Functions

## 📊 Post-Deployment Monitoring

### **Check these regularly:**
- [ ] Netlify Analytics (built-in)
- [ ] Deploy preview logs
- [ ] Function logs (for API routes)
- [ ] Supabase usage (database calls)

### **Set up Notifications:**
1. Go to **Site settings** → **Notifications**
2. Add email for deploy failures
3. Add Slack/Discord webhook for alerts

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main  # Triggers automatic deploy
```

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Netlify environment variables** for all secrets
3. **Enable branch deploys** for testing before production
4. **Set up deploy previews** for pull requests
5. **Use HTTPS** (enabled by default on Netlify)

## 🎉 Success Checklist

After successful deployment, verify:

- [ ] Site loads on Netlify URL
- [ ] Login/authentication works
- [ ] Dashboard shows data from Supabase
- [ ] All pages are accessible
- [ ] API routes work (check Network tab)
- [ ] No console errors
- [ ] Images load correctly
- [ ] Mobile responsive design works
- [ ] Custom domain configured (optional)

## 🔗 Useful Links

- [Netlify Dashboard](https://app.netlify.com/)
- [Netlify Docs - Nuxt](https://docs.netlify.com/integrations/frameworks/nuxt/)
- [Nuxt 3 Deployment Docs](https://nuxt.com/docs/getting-started/deployment#netlify)
- [Supabase Dashboard](https://supabase.com/dashboard)

## 💡 Pro Tips

1. **Use Deploy Previews**: Every pull request gets its own preview URL
2. **Branch Deploys**: Set up staging environment on `develop` branch
3. **Split Testing**: A/B test different versions
4. **Custom Domain**: Add your own domain in Site settings
5. **Analytics**: Enable Netlify Analytics for visitor insights

---

**Need Help?** 
- Check Netlify Status: https://www.netlifystatus.com/
- Netlify Support: https://answers.netlify.com/
- Nuxt Discord: https://discord.com/invite/nuxt

