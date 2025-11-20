# ⚡ Quick Netlify Deployment Checklist

## 🎯 Before You Start

Run this test locally (in the `tradefi` directory):

**Windows:**
```bash
test-build.bat
```

**Mac/Linux:**
```bash
chmod +x test-build.sh
./test-build.sh
```

If it passes, you're ready to deploy! ✅

---

## 📝 5-Minute Deployment Steps

### **1. Push Your Code** (2 min)
```bash
cd tradefi
git add .
git commit -m "Fix Netlify deployment configuration"
git push origin main
```

### **2. Configure Netlify** (2 min)

Go to [Netlify Dashboard](https://app.netlify.com/) and:

1. Click **"Add new site"** → **"Import an existing project"**
2. Select your Git provider and the `TradeFI` repository
3. Set build configuration:

```
Base directory:    tradefi
Build command:     npm run build
Publish directory: tradefi/.output/public
```

4. Add environment variables (Site Settings → Environment Variables):

**Minimum Required:**
```
SUPABASE_URL=https://yfzfdvghkhctzqjtwajy.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NODE_ENV=production
```

### **3. Deploy!** (1 min)

Click **"Deploy site"** and wait for the build to complete.

---

## ✅ Verify Deployment

After deployment:

1. Visit your Netlify URL
2. Go to `/login` and sign in
3. Check that dashboard loads
4. Open browser DevTools (F12) → Console tab
5. Verify no errors

---

## 🚨 If Deployment Fails

1. **Check build log** in Netlify dashboard
2. **Find the error** (scroll to bottom of log)
3. **Common fixes**:

| Error | Fix |
|-------|-----|
| "Module not found" | Delete `package-lock.json`, run `npm install`, commit, push |
| "Supabase URL undefined" | Check env vars in Netlify settings |
| "Command failed" | Run `npm run build` locally to see error |
| "404 errors" | Verify Base directory is `tradefi` |
| "Blank page" | Check browser console for errors |

---

## 📚 Full Documentation

- **Complete Guide**: See `NETLIFY_DEPLOYMENT.md`
- **What Changed**: See `DEPLOYMENT_FIXES.md`

---

## 🆘 Quick Test Commands

```bash
# Test build locally
cd tradefi
npm run build

# Test preview
npm run preview

# Open browser to http://localhost:3000
```

---

## 🎉 Success Criteria

- [ ] Site loads on Netlify URL
- [ ] Login works
- [ ] Dashboard displays after login
- [ ] No console errors
- [ ] Page refresh doesn't 404

---

**Need More Help?** Check `NETLIFY_DEPLOYMENT.md` for detailed troubleshooting.

