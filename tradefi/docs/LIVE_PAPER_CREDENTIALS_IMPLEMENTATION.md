# Live/Paper Credentials Implementation

## Overview
This implementation allows users to save and manage **separate credentials** for Live (production) and Paper (practice) trading environments for each exchange. Users can toggle between environments and the system automatically loads the appropriate credentials.

## Changes Made

### 1. Database Migration

**File**: `schema/bot_credentials_environment_migration.sql`

- Added unique constraint on `(user_id, exchange, environment)` instead of just `(user_id, exchange)`
- This allows storing **multiple credentials per exchange** (one for production, one for practice)
- Safe to run multiple times (idempotent)

**To Apply**:
```sql
-- Run this in your Supabase SQL Editor
-- See: schema/bot_credentials_environment_migration.sql
```

### 2. Backend API Changes

**File**: `server/api/bot/credentials/index.ts`

**POST (Save)**:
- Now queries by `exchange` AND `environment` when checking for existing credentials
- Allows separate Live and Paper credentials to be saved independently

**DELETE**:
- Now requires `environment` query parameter
- Only deletes the credential for the specific environment (Live OR Paper, not both)

### 3. Frontend Changes

**File**: `app/pages/Account.vue`

**New Data Structure**:
```typescript
// OLD: Single form per exchange
credentialForms = {
  aster: CredentialForm,
  oanda: CredentialForm,
  ...
}

// NEW: Separate forms for Live and Paper
credentialStore = {
  aster: {
    production: CredentialForm,  // Live keys
    practice: CredentialForm     // Paper keys
  },
  oanda: {
    production: CredentialForm,
    practice: CredentialForm
  },
  ...
}

// Computed property exposes active form based on toggle
credentialForms = computed(() => {...})
```

**Toggle Behavior**:
- When you toggle Live/Paper, the UI switches to show the credentials for that environment
- Both sets of credentials are preserved independently
- Saving only affects the currently selected environment

## How It Works

### Saving Credentials

1. **Enter Live Keys**:
   - Ensure toggle is set to "Live"
   - Enter your production API keys
   - Click "Save"
   - ✅ Live credentials are saved

2. **Enter Paper Keys**:
   - Toggle to "Paper"
   - Enter your practice/paper API keys
   - Click "Save"
   - ✅ Paper credentials are saved (Live credentials remain unchanged)

### Switching Between Environments

1. **Toggle Live/Paper**:
   - Click the toggle switch on any exchange card
   - The form automatically loads the credentials for that environment
   - If credentials exist, they are displayed
   - If no credentials exist for that environment, the form is empty

### Testing Connections

- The "Test" button tests the **currently displayed** environment
- You can test both Live and Paper credentials separately
- Each environment maintains its own test status and timestamp

### Deleting Credentials

- The "Delete" button only removes credentials for the **currently displayed** environment
- Your other environment's credentials remain intact
- Example: Deleting "Paper" credentials doesn't affect "Live" credentials

## User Experience Flow

```
┌─────────────────────────────────────────┐
│  OANDA Exchange Card                    │
│  ┌─────────────────────────────────┐   │
│  │ Toggle: [Paper] ●━━━○ [Live]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Currently showing: Paper credentials   │
│                                         │
│  API Token: paper_token_12345          │
│  Account ID: PAPER-001                  │
│                                         │
│  [Test]  [Delete]  [Save]              │
└─────────────────────────────────────────┘

        ↓ User toggles to Live

┌─────────────────────────────────────────┐
│  OANDA Exchange Card                    │
│  ┌─────────────────────────────────┐   │
│  │ Toggle: [Paper] ○━━━● [Live]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Currently showing: Live credentials    │
│                                         │
│  API Token: live_token_67890           │
│  Account ID: LIVE-001                   │
│                                         │
│  [Test]  [Delete]  [Save]              │
└─────────────────────────────────────────┘
```

## Technical Details

### Environment Values
- `production` = Live trading
- `practice` = Paper/practice trading
- `sandbox` = Testing (future use)

### API Key Storage in Database
Each credential is stored as a separate row:

| user_id | exchange | environment | api_key | api_secret |
|---------|----------|-------------|---------|------------|
| user123 | oanda    | production  | live123 | secret456  |
| user123 | oanda    | practice    | paper123| secret789  |

### Toggle Sync
The toggle state (`isLive`) is synchronized across both environments to ensure UI consistency. When you toggle, both production and practice forms update their `isLive` field, but only the active environment's credentials are displayed.

## Migration Notes

1. **Existing Data**: Existing credentials will work unchanged. They will be treated as "production" (Live) credentials by default.

2. **No Data Loss**: The migration is non-destructive. All existing credentials are preserved.

3. **Gradual Adoption**: You don't need to add Paper credentials immediately. You can continue using only Live credentials if desired.

## Testing Checklist

- [ ] Run the SQL migration
- [ ] Save Live credentials for an exchange
- [ ] Toggle to Paper and save Paper credentials
- [ ] Toggle back to Live - verify Live credentials are still there
- [ ] Test both Live and Paper connections independently
- [ ] Delete Paper credentials - verify Live credentials remain
- [ ] Verify webhook tab works with toggle

## Benefits

✅ **Separate Environments**: Keep Live and Paper keys completely separate
✅ **Safe Testing**: Test strategies on Paper without risking Live keys
✅ **Quick Switching**: Toggle between environments instantly
✅ **No Overwrites**: Saving one environment never overwrites the other
✅ **Independent Management**: Delete, test, or modify each environment separately

---

**Status**: ✅ Implementation Complete
**Date**: 2024-11-20

