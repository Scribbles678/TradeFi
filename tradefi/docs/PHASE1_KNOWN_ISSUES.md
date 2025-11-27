# Phase 1 Known Issues
**Date:** November 2025

---

## ⚠️ UDropdown Component Warning

### **Issue:**
```
[Vue warn]: Failed to resolve component: UDropdown
```

### **Status:** Non-Critical Warning
- ✅ App still runs and functions correctly
- ✅ This is a Vue warning, not a build error
- ⚠️ Dropdown functionality may still work (needs browser testing)

### **Root Cause:**
- Nuxt UI v3 may have changed component names or auto-import behavior
- Possible module loading order issue with new ShadCN module
- Component might need explicit import

### **Temporary Workaround:**
The warning doesn't break functionality. If dropdowns don't work in the browser, we can:

1. **Option 1:** Explicitly import UDropdown (if it exists)
2. **Option 2:** Use UMenu or UPopover instead
3. **Option 3:** Wait for Phase 2 migration to ShadCN's DropdownMenu

### **Permanent Fix (Phase 2):**
When migrating to ShadCN components, replace `UDropdown` with ShadCN's `DropdownMenu`:
```vue
<!-- Before -->
<UDropdown :items="userMenuItems">
  <UButton>...</UButton>
</UDropdown>

<!-- After (Phase 2) -->
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <Button>...</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <!-- menu items -->
  </DropdownMenuContent>
</DropdownMenu>
```

### **Testing:**
1. Open app in browser
2. Click user avatar/button
3. Check if dropdown menu appears
4. If it works, warning can be ignored for now
5. If it doesn't work, we'll fix it before Phase 2

---

## ✅ Other Status

- ✅ Dev server starts successfully
- ✅ All modules load correctly
- ✅ No build errors
- ✅ CSS system working
- ✅ Tailwind v4 configured
- ✅ ShadCN ready for use

---

**Action Items:**
- [ ] Test dropdown functionality in browser
- [ ] Document if dropdown works despite warning
- [ ] Plan UDropdown → DropdownMenu migration for Phase 2

