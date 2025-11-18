<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">TradeFI</h1>
        <p class="text-gray-400">Automated Trading Dashboard</p>
      </div>

      <!-- Auth Card -->
      <UCard class="backdrop-blur-sm bg-gray-800/50 border border-gray-700">
        <template #header>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-white">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ isLogin ? 'Sign in to your account' : 'Get started with TradeFI' }}
            </p>
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Email Field -->
          <UFormField label="Email" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              size="lg"
              :disabled="loading"
              autocomplete="email"
              class="w-full"
              :ui="{ base: 'w-full' }"
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField label="Password" required>
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              size="lg"
              :disabled="loading"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  variant="ghost"
                  color="gray"
                  size="xs"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Confirm Password (Register only) -->
          <UFormField v-if="!isLogin" label="Confirm Password" required>
            <UInput
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              size="lg"
              :disabled="loading"
              autocomplete="new-password"
            />
          </UFormField>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            <p class="text-sm text-green-400">{{ success }}</p>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {{ isLogin ? 'Sign In' : 'Create Account' }}
          </UButton>

          <!-- Toggle Login/Register -->
          <div class="text-center pt-2">
            <button
              type="button"
              @click="toggleMode"
              class="text-sm text-gray-400 hover:text-white transition-colors"
              :disabled="loading"
            >
              {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
              <span class="text-blue-400 font-semibold">{{ isLogin ? 'Sign Up' : 'Sign In' }}</span>
            </button>
          </div>
        </form>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-gray-500">
        <p>Secure authentication powered by Supabase</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

definePageMeta({
  layout: false,
  middleware: 'guest'
})

// State
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

// Toggle between login and register
function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  success.value = ''
  confirmPassword.value = ''
}

// Handle form submission
async function handleSubmit() {
  error.value = ''
  success.value = ''

  // Validation
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    if (isLogin.value) {
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (signInError) {
        error.value = signInError.message
        return
      }

      if (data.user) {
        toast.add({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
          icon: 'i-heroicons-check-circle',
          color: 'success'
        })
        
        // Redirect to home
        await router.push('/')
      }
    } else {
      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })

      if (signUpError) {
        error.value = signUpError.message
        return
      }

      if (data.user) {
        success.value = 'Account created! Please check your email to verify your account.'
        
        toast.add({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
          icon: 'i-heroicons-check-circle',
          color: 'success'
        })

        // Clear form
        email.value = ''
        password.value = ''
        confirmPassword.value = ''
        
        // Switch to login mode after 2 seconds
        setTimeout(() => {
          isLogin.value = true
          success.value = ''
        }, 2000)
      }
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

