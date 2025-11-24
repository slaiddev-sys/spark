import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Initialize Supabase Admin Client with Service Role Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const userId = session.user.id

    // 1. Delete from public.profiles (if cascade delete isn't set up on auth.users -> profiles)
    // Actually, best practice is to delete auth.users and let cascade handle the rest.
    // But to be absolutely sure, we can delete public data first.
    // Assuming CASCADE DELETE is set up on foreign keys:
    // deleting auth.users should cascade to public.profiles, public.projects, etc.
    
    // Let's try deleting the user directly from Auth Admin.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteError) {
      console.error('Error deleting user from Auth:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    // If successful, sign out the user session
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error in delete-account API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

