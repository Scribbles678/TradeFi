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

    console.log('OANDA Config:', { 
      hasAccountId: !!accountId, 
      hasApiKey: !!apiKey, 
      baseUrl 
    })

    if (!accountId || !apiKey || !baseUrl) {
      console.log('OANDA missing config')
      return {
        success: false,
        exchange: 'OANDA',
        error: 'Missing OANDA configuration'
      }
    }

    console.log('OANDA Fetching balance...')
    const response = await $fetch<OandaResponse>(`${baseUrl}/v3/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('OANDA Response:', response)

    if (!response?.account) {
      console.log('OANDA invalid response')
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
    
    console.log('OANDA balance:', balance)
    console.log('OANDA unrealized P&L:', unrealizedPL)
    console.log('OANDA NAV:', nav)

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
