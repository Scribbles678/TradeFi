import { defineEventHandler } from '#imports'

export default defineEventHandler(async (event) => {
  // Fetch balances from all exchanges
  // Tasty Trade will return disabled: true if not configured, which we'll skip
  const results = await Promise.allSettled([
    $fetch('/api/balance/aster'),
    $fetch('/api/balance/tradier'),
    $fetch('/api/balance/oanda'),
    $fetch('/api/balance/tastytrade').catch(() => ({ success: false, disabled: true }))
  ])

  const balances = []
  let total = 0
  let hasNonNull = false

  for (const result of results) {
    // Skip Tasty Trade if it's disabled or failed
    if (result.status === 'fulfilled') {
      const res = result.value
      // Skip if Tasty Trade is disabled (not configured)
      if (res && res.disabled) {
        continue
      }
      if (res && res.success && typeof res.balance === 'number') {
        balances.push({ exchange: res.exchange, balance: res.balance })
        total += res.balance
        hasNonNull = true
      } else if (res && res.success) {
        balances.push({ exchange: res.exchange, balance: null })
      }
    }
    // If rejected, skip it (don't add to balances)
  }

  return {
    success: true,
    balances,
    total: hasNonNull ? total : null
  }
})
