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

  // Early return if Tasty Trade is not configured - fail silently to avoid errors
  if (!clientId || !clientSecret || !username || !password) {
    return {
      success: false,
      error: 'Tasty Trade is not configured (disabled)',
      disabled: true
    }
  }

  try {
    // Tasty Trade OAuth2 token endpoint
    // Based on https://developer.tastytrade.com/ - OAuth2 flow
    const response = await $fetch<TastyTradeTokenResponse>('https://api.tastytrade.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
        scope: 'read'
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
    // Check if it's a 401 error (unauthorized) - means credentials are invalid/missing
    // Don't log 401 errors to avoid console spam
    let is401 = false
    let errorMessage = 'Unknown error occurred'
    
    if (error && typeof error === 'object') {
      // Check for HTTP status code in error response
      const httpError = error as any
      if (httpError.status === 401 || httpError.statusCode === 401) {
        is401 = true
      }
      errorMessage = httpError.message || httpError.statusText || String(error)
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    // Also check error message for 401 indicators
    if (!is401) {
      is401 = errorMessage.includes('401') || 
              errorMessage.includes('Unauthorized') ||
              errorMessage.toLowerCase().includes('unauthorized')
    }
    
    // Only log if it's not a 401 error
    if (!is401) {
      console.error('Tasty Trade OAuth2 error:', error)
    }
    
    return {
      success: false,
      error: is401 ? 'Tasty Trade is disabled (invalid credentials)' : errorMessage,
      disabled: true // Always mark as disabled on error to prevent retries
    }
  }
})
