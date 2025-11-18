export default defineEventHandler(async (event) => {
  try {
    // Get user from Supabase session
    const user = await serverSupabaseUser(event)
    
    // Inject user into event context
    event.context.user = user
  } catch (error) {
    // If there's an error, just set user to null
    event.context.user = null
  }
})

