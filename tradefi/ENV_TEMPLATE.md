# Environment Variables Template

## 🔐 Tasty Trade API Setup

Based on the [Tasty Trade API documentation](https://developer.tastytrade.com/), here's the correct template for your `.env` file:

```env
# ===========================================
# EXISTING EXCHANGES
# ===========================================

# Aster DEX (Crypto) - for account balances
ASTER_API_KEY=your_aster_api_key_here
ASTER_API_SECRET=your_aster_api_secret_here

# Tradier (Stocks/Options) - for account balances  
TRADIER_TOKEN=your_tradier_token_here
TRADIER_ACCOUNT_ID=your_tradier_account_id_here

# OANDA (Forex) - for account balances
OANDA_API_KEY=your_oanda_api_key_here
OANDA_ACCOUNT_ID=your_oanda_account_id_here
OANDA_BASE_URL=https://api-fxpractice.oanda.com

# ===========================================
# NEW: TASTY TRADE (FUTURES)
# ===========================================

# Tasty Trade (Futures) - OAuth2 credentials
# Get these from: https://developer.tastytrade.com/
TASTYTRADE_CLIENT_ID=your_tastytrade_client_id_here
TASTYTRADE_CLIENT_SECRET=your_tastytrade_client_secret_here
TASTYTRADE_USERNAME=your_tastytrade_username_here
TASTYTRADE_PASSWORD=your_tastytrade_password_here
TASTYTRADE_ACCOUNT_ID=your_tastytrade_account_id_here

# ===========================================
# SPARKY BOT INTEGRATION
# ===========================================

# Sparky Bot (for health checks)
SPARKY_BOT_URL=http://localhost:3000

# ===========================================
# SUPABASE DATABASE
# ===========================================

# Supabase (Read-Only Access for Dashboard)
SUPABASE_URL=https://yfzfdvghkhctzqjtwajy.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🚀 Tasty Trade API Setup Instructions

### **1. Get Your Credentials**

Based on the [Tasty Trade API documentation](https://developer.tastytrade.com/):

1. **Go to** [https://developer.tastytrade.com/](https://developer.tastytrade.com/)
2. **Create account** or login to existing account
3. **Get OAuth2 token** using their authentication flow
4. **Find your account ID** in the Tasty Trade platform

### **2. Authentication Pattern**

Tasty Trade uses **OAuth2 Bearer token** authentication:

```typescript
headers: {
  'Authorization': `Bearer ${TASTYTRADE_API_TOKEN}`,
  'Content-Type': 'application/json'
}
```

### **3. API Endpoints**

The implementation uses these endpoints from the [Tasty Trade API docs](https://developer.tastytrade.com/):

- **Account Info**: `GET https://api.tastytrade.com/accounts/{account_id}`
- **Positions**: `GET https://api.tastytrade.com/accounts/{account_id}/positions`

### **4. Sandbox vs Production**

**For Sandbox Testing:**
```env
# Use sandbox base URL (if different from production)
TASTYTRADE_API_TOKEN=your_sandbox_token
TASTYTRADE_ACCOUNT_ID=your_sandbox_account_id
```

**For Production:**
```env
# Use production credentials
TASTYTRADE_API_TOKEN=your_production_token
TASTYTRADE_ACCOUNT_ID=your_production_account_id
```

## 🔧 Implementation Details

### **Updated API Integration**

I've corrected the implementation to match the [Tasty Trade API documentation](https://developer.tastytrade.com/):

1. **OAuth2 Bearer Token** authentication
2. **Correct API endpoints** from their docs
3. **Proper error handling** for API responses
4. **Account and positions** data structure

### **Key Changes Made**

- ✅ **Updated authentication** to use Bearer token
- ✅ **Corrected API endpoints** to match Tasty Trade docs
- ✅ **Fixed environment variable** names (`TASTYTRADE_API_TOKEN`)
- ✅ **Proper error handling** for API responses

## 🎯 Next Steps

1. **Add your credentials** to the `.env` file using the template above
2. **Restart the development server**:
   ```bash
   cd tradefi
   npm run dev
   ```
3. **Test the integration**:
   - Open http://localhost:3001
   - Click "Futures" filter
   - Check Account page for Tasty Trade card
   - Verify API connectivity

## 🔍 Testing API Connectivity

You can test the Tasty Trade API endpoints directly:

```bash
# Test account balance
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.tastytrade.com/accounts/YOUR_ACCOUNT_ID

# Test positions
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.tastytrade.com/accounts/YOUR_ACCOUNT_ID/positions
```

## ⚠️ Security Notes

- **Never commit** your `.env` file to version control
- **Keep API credentials** secure and private
- **Use different credentials** for development vs production
- **Regularly rotate** your API keys
- **Monitor API usage** for unauthorized access

The implementation now correctly follows the [Tasty Trade API documentation](https://developer.tastytrade.com/) patterns and should work seamlessly with your credentials! 🚀
