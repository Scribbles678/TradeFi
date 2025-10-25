import { defineEventHandler, useRuntimeConfig } from '#imports'

interface TastyTradeTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const clientId = config.tastytradeClientId
  const clientSecret = config.tastytradeClientSecret
  const username = config.tastytradeUsername
  const password = config.tastytradePassword

  try {
    if (!clientId || !clientSecret || !username || !password) {
      return {
        success: false,
        error: 'Missing Tasty Trade OAuth2 credentials'
      }
    }

    // Tasty Trade OAuth2 token endpoint
    // Based on https://developer.tastytrade.com/ - OAuth2 flow
    const response = await $fetch<TastyTradeTokenResponse>('https://api.tastytrade.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password
      })
    })

    console.log('Tasty Trade OAuth2 Token Response:', response)

    if (!response?.access_token) {
      return {
        success: false,
        error: 'Failed to obtain OAuth2 token from Tasty Trade'
      }
    }

    return {
      success: true,
      access_token: response.access_token,
      token_type: response.token_type,
      expires_in: response.expires_in,
      scope: response.scope
    }
  } catch (error: unknown) {
    console.error('Tasty Trade OAuth2 error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      success: false,
      error: errorMessage
    }
  }
})
