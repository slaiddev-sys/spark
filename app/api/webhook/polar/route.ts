import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple GET handler for testing webhook endpoint accessibility
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is live',
    timestamp: new Date().toISOString()
  })
}

// Map Polar Product IDs to Plan Details
const PLAN_MAP: Record<string, { tier: string; credits: number }> = {
  // Starter
  '40ff680b-f37e-4cf3-b8a0-685d9de81ee1': { tier: 'starter', credits: 300 }, // Month
  '5e2abe25-9930-4f51-a205-c903bb215e52': { tier: 'starter', credits: 3600 }, // Annual
  
  // Pro
  '9f0c9f0c-82fb-4d58-b251-3c55fb829fab': { tier: 'pro', credits: 1000 }, // Month
  'da212809-224c-4fd4-be12-427e128bc8b2': { tier: 'pro', credits: 12000 }, // Annual
  
  // Ultimate
  '3231f237-ba27-4773-b87c-cfa7189a12e5': { tier: 'ultimate', credits: 2500 }, // Month
  '760a85ce-a8bd-4d32-ade5-7beec1f2a95e': { tier: 'ultimate', credits: 30000 }, // Annual
}

export async function POST(request: NextRequest) {
  console.log('🔔 Polar Webhook received')
  
  const requestBody = await request.text()
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  // const signature = request.headers.get('polar-webhook-signature')

  if (!webhookSecret) {
    console.error('❌ POLAR_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  // TODO: Enable signature verification in production
  // if (!signature) {
  //   return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  // }

  let event: any
  try {
    event = JSON.parse(requestBody)
  } catch (err) {
    console.error('❌ Invalid JSON body')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log(`📦 Event type: ${event.type}`)
  
  // ONLY process subscription.created to avoid duplicate credit additions
  // (Polar sends created, updated, AND active for the same subscription)
  if (event.type === 'subscription.created') {
    const subscription = event.data
    const productId = subscription.product_id
    let userId = subscription.metadata?.userId

    console.log(`📝 Processing subscription for product ${productId}`)

    // 1. Try finding user by Email if ID missing
    if (!userId) {
      console.warn('⚠️ No userId in metadata, attempting email lookup...')
      // Try to get email from customer object or user object in payload
      const customerEmail = subscription.user?.email || subscription.customer?.email || subscription.email
      
      if (customerEmail) {
        console.log(`🔍 Looking up user by email: ${customerEmail}`)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single()
          
        if (profile) {
          userId = profile.id
          console.log(`✅ Found user ID via email: ${userId}`)
        } else {
          console.error(`❌ No user found with email: ${customerEmail}`)
        }
      } else {
        console.error('❌ No email found in subscription payload')
      }
    }

    if (!userId) {
      console.error('❌ Could not identify user for subscription')
      return NextResponse.json({ error: 'User identification failed' }, { status: 400 })
    }

    const planDetails = PLAN_MAP[productId]

    if (!planDetails) {
      console.error(`❌ Unknown Product ID: ${productId}`)
      // Return success to avoid retries for unknown products
      return NextResponse.json({ received: true, warning: 'Unknown product' }) 
    }

    // Update User in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    try {
      // Get current credits
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits, tier')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching profile:', fetchError)
        throw fetchError
      }

      // Only add credits if it's a new subscription or upgrade (simplification)
      // Ideally we track transaction IDs to avoid double counting
      const currentCredits = profile?.credits || 0
      
      // If event is subscription.created, we definitely add credits
      // If subscription.updated, we might want to be careful, but for now we assume it's an upgrade or renewal
      const newCredits = currentCredits + planDetails.credits

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tier: planDetails.tier,
          credits: newCredits
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error updating profile:', updateError)
        throw updateError
      }

      console.log(`✅ SUCCESSFULLY Updated user ${userId} to tier ${planDetails.tier} with ${newCredits} credits`)
      return NextResponse.json({ success: true })

    } catch (error: any) {
      console.error('❌ Database update failed:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
