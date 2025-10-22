import { defineEventHandler, useRuntimeConfig } from '#imports'

interface TradierBalances {
  total_equity: number
  total_cash: number
  total_margin_equity: number
  total_market_value: number
  option_market_value: number
  stock_market_value: number
  buying_power: {
    cash_available: number
    day_trade: number
    overnight: number
  }
  cash: {
    cash_available: number
    cash_held: number
    cash_sweep: number
  }
}

interface TradierResponse {
  balances: TradierBalances
}

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const token = config.tradierToken
  const accountId = config.tradierAccountId

  try {
    const response: TradierResponse = await $fetch<TradierResponse>(`https://sandbox.tradier.com/v1/accounts/${accountId}/balances`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    
    console.log('Tradier API Response:', response)
    
    const balances = response?.balances
    if (!balances) {
      return {
        success: false,
        exchange: 'Tradier',
        balance: null,
        error: 'Invalid response from Tradier API'
      }
    }

    const totalEquity = balances.total_equity
    const totalCash = balances.total_cash
    const totalMarketValue = balances.total_market_value
    const buyingPower = balances.buying_power?.cash_available || 0
    const cashAvailable = balances.cash?.cash_available || 0

    return {
      success: true,
      exchange: 'Tradier',
      balance: totalEquity,
      totalCash,
      totalMarketValue,
      buyingPower,
      cashAvailable,
      optionMarketValue: balances.option_market_value,
      stockMarketValue: balances.stock_market_value
    }
  } catch (error) {
    console.error('Tradier API Error:', error)
    return {
      success: false,
      exchange: 'Tradier',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
