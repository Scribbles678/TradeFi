# Phase 1 Installation Notes
**Date:** November 2025  
**Status:** Dependencies Installed

---

## ⚠️ Important: Nuxt Version Compatibility

The template project uses **Nuxt 4**, but TradeFI is currently on **Nuxt 3.16.2**. This creates some peer dependency conflicts.

### **Solution Applied:**
Used `--legacy-peer-deps` flag during installation to resolve conflicts:
```bash
npm install --legacy-peer-deps
```

### **Why This Works:**
- Most packages are backward compatible
- `--legacy-peer-deps` allows npm to install despite peer dependency warnings
- TradeFI continues to work on Nuxt 3
- Can upgrade to Nuxt 4 later if needed

### **Packages That May Have Warnings:**
- `vue-sonner@2.0.8` - Prefers Nuxt 4, but works with Nuxt 3
- `shadcn-nuxt@2.2.0` - Should work with Nuxt 3
- `nuxt-charts@1.0.2` - Should work with Nuxt 3

---

## ✅ Installation Complete

**Dependencies Added:**
- ✅ shadcn-nuxt
- ✅ nuxt-charts
- ✅ @tailwindcss/vite
- ✅ tailwindcss@4.1.12
- ✅ reka-ui
- ✅ lucide-vue-next
- ✅ vue-sonner
- ✅ class-variance-authority
- ✅ clsx
- ✅ tailwind-merge
- ✅ tw-animate-css

**Files Created:**
- ✅ `components.json` - ShadCN config
- ✅ `app/utils/cn.ts` - Utility function
- ✅ `app/assets/css/tailwind.css` - New CSS system

**Files Updated:**
- ✅ `package.json` - Added dependencies
- ✅ `nuxt.config.ts` - Added modules

---

## 🧪 Testing

### **Expected Behavior:**
1. Dev server should start
2. All existing pages should load
3. TradeFI styling should be preserved
4. No console errors

### **Known Warnings:**
- Component directory warning: `app/components/ui` doesn't exist yet (expected)
- This will be created when you add your first ShadCN component

---

## 🚀 Next Steps

1. **Verify Dev Server:**
   - Check that `npm run dev` starts successfully
   - Visit http://localhost:3000 (or 3001 if available)
   - Verify all pages load

2. **Test Existing Functionality:**
   - Dashboard loads
   - Account page works
   - Login works
   - All existing features function

3. **If Everything Works:**
   - Proceed to Phase 2 (Component Migration)
   - Start replacing Nuxt UI components with ShadCN

---

## 🔧 Troubleshooting

### **If Dev Server Fails:**

**Error: Cannot find module 'shadcn-nuxt'**
- Solution: Run `npm install --legacy-peer-deps` again

**Error: Tailwind CSS not found**
- Solution: Verify `@tailwindcss/vite` is installed
- Check `nuxt.config.ts` has Tailwind plugin

**Error: Component directory missing**
- Solution: This is expected - will be created when adding components
- Or create manually: `mkdir -p app/components/ui`

### **If Styles Look Wrong:**

1. Check browser console for CSS errors
2. Verify `tailwind.css` is being loaded
3. Check that old `main.css` isn't conflicting
4. Clear browser cache

---

## 📝 Notes

- **Nuxt UI Still Active:** Both Nuxt UI and ShadCN can coexist
- **No Breaking Changes:** Existing code should work as-is
- **Gradual Migration:** Can adopt ShadCN components incrementally
- **CSS Variables:** New system is ready, but old styles still work

---

**Status:** ✅ Ready for Testing

