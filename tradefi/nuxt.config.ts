// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts'
  ],

  icon: {
    serverBundle: 'local',
    collections: ['heroicons', 'lucide', 'simple-icons']
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  runtimeConfig: {
    // Aster DEX (Crypto) - for account balances
    asterApiKey: process.env.ASTER_API_KEY,
    asterApiSecret: process.env.ASTER_API_SECRET,
    // Tradier (Stocks/Options) - for account balances
    tradierToken: process.env.TRADIER_TOKEN,
    tradierAccountId: process.env.TRADIER_ACCOUNT_ID,
    // OANDA (Forex) - for account balances
    oandaApiKey: process.env.OANDA_API_KEY,
    oandaAccountId: process.env.OANDA_ACCOUNT_ID,
    oandaBaseUrl: process.env.OANDA_BASE_URL || 'https://api-fxpractice.oanda.com',
    // Tasty Trade (Futures) - OAuth2 credentials
    tastytradeClientId: process.env.TASTYTRADE_CLIENT_ID,
    tastytradeClientSecret: process.env.TASTYTRADE_CLIENT_SECRET,
    tastytradeUsername: process.env.TASTYTRADE_USERNAME,
    tastytradePassword: process.env.TASTYTRADE_PASSWORD,
    tastytradeAccountId: process.env.TASTYTRADE_ACCOUNT_ID,
    // Sparky Bot (for health checks)
    sparkyBotUrl: process.env.SPARKY_BOT_URL || 'http://localhost:3000',
    // Supabase service role key stays server-side only
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      sparkyWebhookUrl: process.env.SPARKY_WEBHOOK_URL || 'http://localhost:3000/webhook'
    }
  },

  devServer: {
    port: 3001
  },

  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true
    }
  },

  // Add WebSocket configuration
  vite: {
    server: {
      hmr: {
        port: 3001,
        protocol: 'ws'
      }
    }
  },

})