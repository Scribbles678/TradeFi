# Trade Settings UX Improvements

## How Trading Window Selector Works

The trading window selector is a **simplified dropdown** that shows only relevant options per exchange:

### Current Implementation
- **Crypto (Aster)**: Only shows "24/7 (Always On)" - can't be changed
- **Forex (OANDA)**: Only shows "Forex Market Hours (24/5)" - weekdays only
- **Equities/Options (Tradier)**: Only shows "Regular Market Hours" (9:30 AM - 4:00 PM ET)

### How It Works:
1. User opens the dropdown for an exchange
2. System determines available presets based on asset class:
   - Crypto → Always "24/7"
   - Forex → Always "forex-hours" (24/5)
   - Equities/Options → Always "market-hours" (9:30-16:00 ET)
3. When preset is selected, it updates both `trading_hours_preset` and `trading_window` fields
4. Settings save to Supabase immediately (or on "Save Settings" button)

### Data Flow:
```
User selects preset
  ↓
applyTradingPreset() called
  ↓
Updates exchange.settings.tradingHours
Updates exchange.settings.customWindow [start, end]
  ↓
User clicks "Save Settings"
  ↓
Saves to Supabase trade_settings_exchange table
```

---

## UX Improvements (What They Would Look Like)

### 1. **Loading State on Initial Load**

**Current**: Page shows default values instantly, then might jump when data loads

**Improved**:
```vue
<UCard>
  <template #header>
    <div v-if="loading" class="flex items-center gap-2">
      <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
      <span>Loading settings...</span>
    </div>
    <!-- Normal header when loaded -->
  </template>
  
  <div v-if="loading" class="space-y-3">
    <!-- Skeleton loaders for each field -->
    <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  </div>
</UCard>
```

**Visual**: Skeleton loaders pulse while fetching from Supabase

---

### 2. **Unsaved Changes Indicator**

**Current**: No way to know if you've made changes that aren't saved

**Improved**:
```vue
<template #footer>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <UBadge 
        v-if="hasUnsavedChanges(exchange.key)" 
        color="warning" 
        size="xs"
      >
        Unsaved changes
      </UBadge>
      <p class="text-xs text-gray-500">
        Last saved: {{ exchange.lastUpdated }}
      </p>
    </div>
    <div class="flex gap-2">
      <UButton
        label="Reset"
        variant="ghost"
        size="sm"
        :disabled="loading || !hasUnsavedChanges(exchange.key)"
        @click="resetSettings(exchange.key)"
      />
      <UButton
        label="Save Settings"
        icon="i-heroicons-check"
        size="sm"
        :class="[
          'font-semibold',
          hasUnsavedChanges(exchange.key) 
            ? 'bg-orange-600 hover:bg-orange-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        ]"
        :loading="savingKey === exchange.key"
        :disabled="!hasUnsavedChanges(exchange.key)"
        @click="saveSettings(exchange.key)"
      />
    </div>
  </div>
</template>
```

**Visual**: 
- Button changes from blue to orange when there are unsaved changes
- Small "Unsaved changes" badge appears
- Save button is disabled if no changes

---

### 3. **Bulk Save All Exchanges**

**Current**: Must save each exchange individually

**Improved**:
```vue
<!-- Add at top of page -->
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-3xl font-bold">Trade Settings</h1>
    <p class="text-gray-500 dark:text-gray-400">
      Configure how Sparky trades on each exchange.
    </p>
  </div>
  <UButton
    v-if="hasAnyUnsavedChanges"
    label="Save All Changes"
    icon="i-heroicons-check"
    size="lg"
    class="bg-green-600 hover:bg-green-700 text-white font-semibold"
    :loading="savingAll"
    @click="saveAllSettings"
  >
    <template #trailing>
      <UBadge color="warning" size="xs" class="ml-2">
        {{ unsavedCount }} unsaved
      </UBadge>
    </template>
  </UButton>
</div>
```

**Visual**: 
- Button appears at top right when any exchange has unsaved changes
- Shows count of unsaved exchanges
- One-click save for all changes

---

### 4. **Input Validation with Visual Feedback**

**Current**: Can enter negative values or invalid numbers

**Improved**:
```vue
<UFormField 
  label="Max Trades per Day" 
  help="0 = unlimited. Sparky stops opening new positions after this count."
  :error="errors[exchange.key]?.maxTrades"
>
  <UInput 
    v-model.number="exchange.settings.maxTrades" 
    type="number" 
    min="0" 
    max="100"
    placeholder="e.g. 5"
    :class="{
      'border-red-500': errors[exchange.key]?.maxTrades
    }"
    @blur="validateField(exchange.key, 'maxTrades')"
  />
</UFormField>
```

**Visual**:
- Red border on invalid inputs
- Error message below field
- Prevents saving until valid

---

### 5. **Success Toast with Auto-dismiss**

**Current**: Toast notification on save

**Improved**:
```typescript
toast.add({ 
  title: `Settings saved for ${exchange.name}`, 
  color: 'success',
  icon: 'i-heroicons-check-circle',
  timeout: 3000, // Auto-dismiss after 3 seconds
  actions: [{
    label: 'Undo',
    click: () => undoLastSave(exchange.key)
  }]
})
```

**Visual**: 
- Green checkmark icon
- Auto-dismisses after 3 seconds
- Optional "Undo" button for last save

---

### 6. **Confirmation Dialog on Reset**

**Current**: Basic browser confirm() dialog

**Improved**:
```vue
<UModal v-model="showResetConfirm" :ui="{ width: 'sm:max-w-md' }">
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Reset Settings?</h3>
    </template>
    <p class="text-gray-600 dark:text-gray-400">
      This will reset all settings for <strong>{{ resettingExchange?.name }}</strong> 
      to defaults. Any unsaved changes will be lost.
    </p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" variant="ghost" @click="showResetConfirm = false" />
        <UButton 
          label="Reset to Defaults" 
          color="error"
          @click="confirmReset"
        />
      </div>
    </template>
  </UCard>
</UModal>
```

**Visual**: 
- Modern modal with clear messaging
- Shows which exchange will be reset
- Red "Reset" button for danger action

---

## Implementation Priority

1. **High**: Loading states (prevents confusion)
2. **High**: Unsaved changes indicator (prevents data loss)
3. **Medium**: Input validation (prevents invalid data)
4. **Medium**: Better reset confirmation (UX polish)
5. **Low**: Bulk save (nice-to-have)
6. **Low**: Undo functionality (nice-to-have)

