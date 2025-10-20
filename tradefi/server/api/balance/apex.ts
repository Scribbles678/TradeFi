import { defineEventHandler, useRuntimeConfig } from '#imports'
import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiKey = config.apexApiKey
  const apiSecret = config.apexApiSecret
  const apiPassphrase = config.apexApiPassphrase

  try {
    // Prepare request details
    const baseUrl = 'https://omni.apex.exchange'
    const endpoint = '/api/v3/account-balance'
    const url = baseUrl + endpoint
    const method = 'GET'
    const timestamp = Date.now().toString()
    const prehash = `${timestamp}${method}${endpoint}`
    const signature = createHmac('sha256', apiSecret).update(prehash).digest('hex')

    // Make the API request
    const response = await $fetch<any>(url, {
      method,
      headers: {
        'APEX-API-KEY': apiKey,
        'APEX-SIGNATURE': signature,
        'APEX-TIMESTAMP': timestamp,
        'APEX-PASSPHRASE': apiPassphrase,
        'Accept': 'application/json'
      }
    })

    console.log('ApeX API Response:', response)

    // Parse the response - using totalEquityValue as the balance
    const balance = response?.totalEquityValue ? parseFloat(response.totalEquityValue) : null

    return {
      success: true,
      exchange: 'ApeX',
      balance,
      availableBalance: response?.availableBalance ? parseFloat(response.availableBalance) : null,
      initialMargin: response?.initialMargin ? parseFloat(response.initialMargin) : null,
      maintenanceMargin: response?.maintenanceMargin ? parseFloat(response.maintenanceMargin) : null
    }
  } catch (error) {
    console.error('ApeX API Error:', error)
    return {
      success: false,
      exchange: 'ApeX',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}) 