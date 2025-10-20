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

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  runtimeConfig: {
    apexApiKey: process.env.APEX_API_KEY,
    apexApiSecret: process.env.APEX_API_SECRET,
    apexApiPassphrase: process.env.APEX_API_PASSPHRASE,
    tradierToken: process.env.TRADIER_TOKEN,
    tradierAccountId: process.env.TRADIER_ACCOUNT_ID,
    oandaApiKey: process.env.OANDA_API_KEY,
    oandaAccountId: process.env.OANDA_ACCOUNT_ID,
    oandaBaseUrl: process.env.OANDA_BASE_URL || 'https://api-fxtrade.oanda.com',
    sparkyBotUrl: process.env.SPARKY_BOT_URL || 'http://localhost:3000',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://yfzfdvghkhctzqjtwajy.supabase.co',
      supabaseKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmemZkdmdoa2hjdHpxanR3YWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI0NjUsImV4cCI6MjA3NjQ2ODQ2NX0.CpOU5V-kkzHQA4Z-hQ51rXQlyPlQHaRQHynAU6E6UiU'
    }
  },

  devServer: {
    port: 3001
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
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
  }
})