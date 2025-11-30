import { ref, computed, onMounted, watch } from 'vue'
import { useSupabaseUser } from '#imports'

// Singleton state - shared across all components
const userProfileState = ref<{
  name: string
  email: string
  avatar: string
}>({
  name: 'User',
  email: 'user@example.com',
  avatar: ''
})

let isInitialized = false

export const useUserProfile = () => {
  const user = useSupabaseUser()
  
  // Load user profile from API
  async function loadUserProfile() {
    if (!user.value) {
      userProfileState.value = {
        name: 'User',
        email: 'user@example.com',
        avatar: ''
      }
      return
    }
    
    try {
      const response = await $fetch<{ 
        id: string
        name: string
        email: string
        joinDate: string
        avatarUrl: string | null
      }>('/api/account/profile')
      
      if (response) {
        userProfileState.value = {
          name: response.name || user.value.email?.split('@')[0] || 'User',
          email: response.email || user.value.email || 'user@example.com',
          avatar: response.avatarUrl || user.value.user_metadata?.avatar_url || ''
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Fallback to auth user data
      if (user.value) {
        userProfileState.value = {
          name: user.value.email?.split('@')[0] || 'User',
          email: user.value.email || 'user@example.com',
          avatar: user.value.user_metadata?.avatar_url || ''
        }
      }
    }
  }

  // Initialize on first use
  if (!isInitialized) {
    isInitialized = true
    if (user.value) {
      loadUserProfile()
    }
    
    // Watch for user changes
    watch(user, (newUser) => {
      if (newUser) {
        loadUserProfile()
      } else {
        userProfileState.value = {
          name: 'User',
          email: 'user@example.com',
          avatar: ''
        }
      }
    })
  }

  return {
    userProfile: computed(() => userProfileState.value),
    loadUserProfile
  }
}

