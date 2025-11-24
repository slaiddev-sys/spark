import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Polar } from '@polar-sh/sdk'

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('Canceling subscription for user:', userId)

    // Get user's profile to retrieve subscription ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the user's profile to check for subscription_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('polar_subscription_id, tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user has an active subscription
    if (profile.tier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Cancel the subscription in Polar
    if (!process.env.POLAR_ACCESS_TOKEN) {
      console.error('POLAR_ACCESS_TOKEN is missing')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: 'production',
    })

    let subscriptionId = profile.polar_subscription_id

    // If no subscription ID stored, try to find it by email
    if (!subscriptionId) {
      console.log('No stored subscription ID, looking up by email:', user.email)
      
      try {
        // List subscriptions (Polar will return subscriptions for this API key's org)
        const subscriptions = await polar.subscriptions.list({})
        
        // Find subscription matching user's email
        const userSubscription = subscriptions.result.items?.find(
          (sub: any) => (sub.user?.email === user.email || sub.customer?.email === user.email) && 
                        (sub.status === 'active' || sub.status === 'trialing')
        )
        
        if (userSubscription) {
          subscriptionId = userSubscription.id
          console.log('Found subscription by email:', subscriptionId)
          
          // Save it for future use
          await supabaseAdmin
            .from('profiles')
            .update({ polar_subscription_id: subscriptionId })
            .eq('id', userId)
        }
      } catch (lookupError) {
        console.error('Error looking up subscription:', lookupError)
      }
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Could not find active subscription. Please contact support.' },
        { status: 404 }
      )
    }

    try {
      console.log('Attempting to cancel subscription:', subscriptionId)
      
      const result = await polar.subscriptions.cancel({
        id: subscriptionId
      })
      
      console.log('✅ Polar subscription canceled successfully:', subscriptionId, result)
    } catch (polarError: any) {
      console.error('Error canceling Polar subscription:', polarError)
      console.error('Error details:', JSON.stringify(polarError, null, 2))
      
      // Return more detailed error
      return NextResponse.json(
        { 
          error: 'Failed to cancel subscription with payment provider',
          details: polarError.message || polarError.toString()
        },
        { status: 500 }
      )
    }

    // Update user's profile - keep tier but mark subscription as canceled
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        polar_subscription_id: null // Remove subscription ID since it's canceled
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Don't fail the request since Polar cancellation succeeded
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription canceled successfully' 
    })

  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

