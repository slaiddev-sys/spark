import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Polar } from '@polar-sh/sdk'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId } = await req.json()

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
  }

  const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: 'production', // Defaults to production
  })

  try {
    // Using the 'products' array as per the SDK definition. 
    // We assume the 'priceId' passed is actually a Product ID (since the user referred to them as Product IDs).
    // If they are strictly Price IDs, this might need adjustment, but passing it as a product is the standard way to create a checkout.
    const result = await polar.checkouts.create({
      products: [priceId],
      successUrl: `${req.nextUrl.origin}/success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        userId: session.user.id,
      },
      customerEmail: session.user.email,
    })

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Error creating Polar checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session', details: error }, { status: 500 })
  }
}
