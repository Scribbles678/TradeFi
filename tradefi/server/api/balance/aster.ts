import { defineEventHandler, useRuntimeConfig } from '#imports'
import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiKey = config.asterApiKey
  const apiSecret = config.asterApiSecret

  try {
    // Prepare request details for Aster DEX
    const baseUrl = 'https://fapi.asterdex.com'
    const endpoint = '/fapi/v1/account'
    const url = baseUrl + endpoint
    const method = 'GET'
    const timestamp = Date.now().toString()
    
    // Create query string for signature
    const queryString = `timestamp=${timestamp}`
    const signature = createHmac('sha256', apiSecret).update(queryString).digest('hex')

    // Make the API request
    const response = await $fetch<any>(`${url}?${queryString}&signature=${signature}`, {
      method,
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('Aster DEX API Response:', response)

    // Parse the response - using totalWalletBalance as the balance
    const balance = response?.totalWalletBalance ? parseFloat(response.totalWalletBalance) : null

    return {
      success: true,
      exchange: 'Aster DEX',
      balance,
      availableBalance: response?.availableBalance ? parseFloat(response.availableBalance) : null,
      totalUnrealizedPnl: response?.totalUnrealizedPnl ? parseFloat(response.totalUnrealizedPnl) : null,
      totalMarginBalance: response?.totalMarginBalance ? parseFloat(response.totalMarginBalance) : null
    }
  } catch (error) {
    console.error('Aster DEX API Error:', error)
    return {
      success: false,
      exchange: 'Aster DEX',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
