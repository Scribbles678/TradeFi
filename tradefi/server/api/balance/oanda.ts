import { defineEventHandler, useRuntimeConfig } from '#imports'

interface OandaAccount {
  balance: string
  unrealizedPL: string
  NAV: string
  marginUsed: string
  marginAvailable: string
  currency: string
  hedgingEnabled: boolean
}

interface OandaResponse {
  account: OandaAccount
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const accountId = config.oandaAccountId
    const apiKey = config.oandaApiKey
    const baseUrl = config.oandaBaseUrl

    if (!accountId || !apiKey || !baseUrl) {
      console.log('OANDA missing config')
      return {
        success: false,
        exchange: 'OANDA',
        error: 'Missing OANDA configuration'
      }
    }

    // Ensure baseUrl doesn't end with slash to avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const response = await $fetch<OandaResponse>(`${cleanBaseUrl}/v3/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Only log essential balance info to avoid console flooding
    console.log('OANDA Balance:', response?.account?.balance)

    if (!response?.account) {
      return {
        success: false,
        exchange: 'OANDA',
        error: 'Invalid response from OANDA API'
      }
    }

    const balance = parseFloat(response.account.balance)
    const unrealizedPL = parseFloat(response.account.unrealizedPL)
    const nav = parseFloat(response.account.NAV)
    const marginUsed = parseFloat(response.account.marginUsed)
    const marginAvailable = parseFloat(response.account.marginAvailable)

    return {
      success: true,
      exchange: 'OANDA',
      balance,
      unrealizedPL,
      nav,
      marginUsed,
      marginAvailable,
      currency: response.account.currency,
      hedgingEnabled: response.account.hedgingEnabled
    }
  } catch (error: unknown) {
    console.error('OANDA balance error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      success: false,
      exchange: 'OANDA',
      error: errorMessage
    }
  }
})
