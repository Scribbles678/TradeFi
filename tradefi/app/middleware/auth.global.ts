export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  // If user is logged in and trying to access login/register, redirect to home
  if (user.value && isPublicRoute) {
    return navigateTo('/')
  }

  // If user is not logged in and trying to access protected route, redirect to login
  if (!user.value && !isPublicRoute) {
    return navigateTo('/login')
  }
})

