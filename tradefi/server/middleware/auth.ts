import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get user from Supabase session (this reads from cookies automatically)
    const user = await serverSupabaseUser(event)
    
    if (user) {
      // Normalize user ID - JWT tokens use 'sub' field, database users use 'id'
      const userId = (user as any).id || (user as any).sub
      
      if (userId) {
        // Normalize user object to always have 'id' field
        event.context.user = {
          ...user,
          id: userId
        }
        return
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('serverSupabaseUser returned user without ID or sub:', { user })
        }
      }
    }
    
    // Fallback: try to get user from session using serverSupabaseClient
    const supabase = await serverSupabaseClient(event)
    
    // Try getSession() first (reads from cookies)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (!sessionError && session?.user) {
      const userId = session.user.id || (session.user as any).sub
      if (userId) {
        event.context.user = {
          ...session.user,
          id: userId
        }
        return
      }
    }
    
    // Last resort: try getUser() (requires valid access token)
    const { data: { user: sessionUser }, error } = await supabase.auth.getUser()
    if (!error && sessionUser) {
      const userId = sessionUser.id || (sessionUser as any).sub
      if (userId) {
        event.context.user = {
          ...sessionUser,
          id: userId
        }
      } else {
        event.context.user = null
      }
    } else {
      // No user found - this is OK, some routes don't require auth
      event.context.user = null
    }
  } catch (error: any) {
    // If there's an error, just set user to null (don't block the request)
    // Only log in development to avoid cluttering production logs
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth middleware error:', error?.message || error)
    }
    event.context.user = null
  }
})

