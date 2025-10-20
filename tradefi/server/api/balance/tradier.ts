import { defineEventHandler, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const token = config.tradierToken
  const accountId = config.tradierAccountId

  try {
    const response: any = await $fetch<any>(`https://sandbox.tradier.com/v1/accounts/${accountId}/balances`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    // Tradier wraps the balances in a 'balances' object
    const totalEquity: any = response?.balances?.total_equity ?? null
    return {
      success: true,
      exchange: 'Tradier',
      balance: typeof totalEquity === 'number' ? totalEquity : null
    }
  } catch (error) {
    return {
      success: false,
      exchange: 'Tradier',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}) 