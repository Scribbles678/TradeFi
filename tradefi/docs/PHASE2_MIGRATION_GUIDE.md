# Phase 2: Component Migration Guide
**Date:** November 2025

---

## Component Mapping

### **Button (UButton → Button)**

**Nuxt UI:**
```vue
<UButton size="sm" variant="ghost" icon="i-heroicons-home">
  Click me
</UButton>
```

**ShadCN:**
```vue
<Button size="sm" variant="ghost">
  <Icon name="i-heroicons-home" />
  Click me
</Button>
```

**Key Differences:**
- `icon` prop → Use `<Icon>` component inside
- `label` prop → Just use slot content
- `size` values: `sm`, `default`, `lg`, `icon`
- `variant` values: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

---

### **Badge (UBadge → Badge)**

**Nuxt UI:**
```vue
<UBadge :color="isConnected ? 'success' : 'error'" size="lg">
  Status
</UBadge>
```

**ShadCN:**
```vue
<Badge :variant="isConnected ? 'success' : 'error'" class="text-sm px-3 py-1">
  Status
</Badge>
```

**Key Differences:**
- `color` prop → `variant` prop
- `size` prop → Use `class` for sizing (no built-in size prop)
- Color mapping:
  - `success` → `success` (same)
  - `error` → `error` (same)
  - `primary` → `default`
  - `neutral` → `outline`

---

### **Card (UCard → Card + CardHeader + CardContent)**

**Nuxt UI:**
```vue
<UCard class="custom-class">
  <template #header>
    <h3>Title</h3>
  </template>
  <p>Content</p>
</UCard>
```

**ShadCN:**
```vue
<Card class="custom-class">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

**Key Differences:**
- `#header` slot → `<CardHeader>` + `<CardTitle>`
- Content → Wrap in `<CardContent>`
- `#footer` slot → `<CardFooter>`
- More explicit structure

---

## Migration Strategy

### **Step 1: Test Components (Current)**
- ✅ Added Button, Badge, Card components
- ✅ Replaced one Badge in index.vue
- ⏳ Test in browser

### **Step 2: Replace Simple Components**
1. Replace all UBadge → Badge
2. Replace simple UButton → Button (without complex props)
3. Test each page

### **Step 3: Replace Complex Components**
1. Replace UCard → Card (requires structure changes)
2. Replace complex UButton (with icons)
3. Test thoroughly

### **Step 4: Final Testing**
- Test all pages
- Test all interactions
- Verify styling
- Check responsive design

---

## Files to Migrate

### **High Priority (Most Used)**
1. `app/pages/index.vue` - Dashboard (many UButton, UCard, UBadge)
2. `app/app.vue` - Header (UButton, UDropdown)
3. `app/pages/Account.vue` - Account page (UCard, UButton)

### **Medium Priority**
4. `app/pages/Strategies.vue` - Strategies page
5. `app/pages/trade-settings.vue` - Trade settings
6. `app/pages/performance.vue` - Performance page

### **Low Priority**
7. `app/pages/login.vue` - Login (UCard, UInput, UFormField)
8. `app/pages/sparky-dashboard.vue` - Sparky dashboard

---

## Testing Checklist

After each migration:
- [ ] Component renders correctly
- [ ] Styling matches (or improves)
- [ ] Interactions work (clicks, hovers)
- [ ] Responsive design works
- [ ] No console errors
- [ ] No TypeScript errors

---

## Notes

- **Keep Nuxt UI for now:** We're not removing Nuxt UI yet, both can coexist
- **Gradual migration:** Replace components one page at a time
- **Test as you go:** Don't replace everything at once
- **Preserve functionality:** Make sure all features still work

---

**Status:** In Progress - Testing first replacement

