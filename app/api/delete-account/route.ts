import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    
    // Create a Supabase client with the user's session using Auth Helpers
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('Deleting account for user:', userId)

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
      return NextResponse.json(
        { error: 'Server configuration error: Missing admin key. Please verify Vercel environment variables.' },
        { status: 500 }
      )
    }

    // Create admin client for deletion (requires SUPABASE_SERVICE_ROLE_KEY)
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete frames (references projects)
    const { error: framesError } = await supabaseAdmin
      .from('frames')
      .delete()
      .eq('user_id', userId)
    
    if (framesError) console.error('Error deleting frames:', framesError)

    // 2. Delete messages (references projects)
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('user_id', userId)
    
    if (messagesError) console.error('Error deleting messages:', messagesError)

    // 3. Delete projects
    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('user_id', userId)
    
    if (projectsError) console.error('Error deleting projects:', projectsError)

    // 4. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) console.error('Error deleting profile:', profileError)

    // 5. Delete the auth user (this removes Google OAuth links automatically)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete authentication account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}

