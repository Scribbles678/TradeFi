// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/supabase',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    'nuxt-charts'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark', // Default to dark mode (TradeFI brand)
    fallback: 'dark'
  },

  fonts: {
    families: [
      { name: 'Public Sans', provider: 'google' }
    ]
  },

  // ESLint is enabled but won't block builds

  icon: {
    serverBundle: 'local',
    collections: ['heroicons', 'lucide', 'simple-icons']
  },

  css: ['~/assets/css/tailwind.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  supabase: {
    redirect: false, // We'll handle redirects manually
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/register']
    },
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    types: false, // Disable type generation warning
  },

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
    // Stripe (server-side only)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      sparkyWebhookUrl: process.env.SPARKY_WEBHOOK_URL || 'http://134.122.8.18/webhook',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  },

  devServer: {
    port: 3001
  },

  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true
    },
    // Ensure proper bundling for Netlify
    node: true,
    minify: true,
  },

  // Add WebSocket configuration
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: {
        port: 3001,
        protocol: 'ws'
      }
    }
  },

  // ShadCN configuration
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: '~/components/ui'
  },

})