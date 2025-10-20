import { defineEventHandler } from '#imports'

export default defineEventHandler(async (event) => {
  const results = await Promise.all([
    $fetch('/api/balance/apex'),
    $fetch('/api/balance/tradier'),
    $fetch('/api/balance/oanda')
  ]).catch(() => [null, null, null])

  const balances = []
  let total = 0
  let hasNonNull = false

  for (const res of results) {
    if (res && res.success && typeof res.balance === 'number') {
      balances.push({ exchange: res.exchange, balance: res.balance })
      total += res.balance
      hasNonNull = true
    } else if (res && res.success) {
      balances.push({ exchange: res.exchange, balance: null })
    }
  }

  return {
    success: true,
    balances,
    total: hasNonNull ? total : null
  }
}) 