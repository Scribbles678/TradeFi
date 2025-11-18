// Middleware for pages that should only be accessible to guests (not logged in)
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  // If user is logged in, redirect to home
  if (user.value) {
    return navigateTo('/')
  }
})

