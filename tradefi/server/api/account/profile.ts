import { defineEventHandler, getMethod, readBody, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get or update user profile
 * GET: Get user profile
 * PUT: Update user profile
 */
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useServiceSupabaseClient()

  // Get authenticated user
  const clientSupabase = await serverSupabaseClient(event)
  const { data: { session }, error: sessionError } = await clientSupabase.auth.getSession()
  
  if (sessionError || !session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = session.user.id || (session.user as any).sub

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID'
    })
  }

  switch (method) {
    case 'GET': {
      // Get user profile from user_profiles table, or fallback to auth user
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error)
      }

      // If profile exists, return it; otherwise return auth user data
      if (profile) {
        return {
          profile: {
            id: profile.id,
            email: profile.email || session.user.email,
            full_name: profile.full_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || session.user.created_at
          }
        }
      }

      // Fallback to auth user data
      return {
        profile: {
          id: userId,
          email: session.user.email || '',
          full_name: session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at
        }
      }
    }

    case 'PUT': {
      const body = await readBody<{ full_name?: string; avatar_url?: string }>(event)
      
      // Upsert user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: session.user.email,
          full_name: body.full_name,
          avatar_url: body.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update profile',
          data: error.message
        })
      }

      return {
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at
        }
      }
    }

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
})

