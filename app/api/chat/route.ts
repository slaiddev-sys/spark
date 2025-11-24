import { NextRequest, NextResponse } from 'next/server'
import { generateUIWithGeminiStream } from '@/lib/gemini'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

    // Check user credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.credits || 0) < 5) { // Minimum credits to start
       return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 } // Payment Required
      )
    }

    const { message, image, history, deviceMode, currentDesign } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('Sending request to Gemini with mode:', deviceMode)

    // Get the Gemini result (contains stream and response promise)
    const result = await generateUIWithGeminiStream(message, history || [], image, deviceMode, currentDesign)
    
    // Create a ReadableStream to pipe the Gemini content to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          // Stream chunks
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }

          // Stream finished, calculate cost
          const response = await result.response
          const usage = response.usageMetadata
          
          if (usage) {
            // Calculate cost in cents (1 credit = 1 cent = $0.01)
            // Pricing based on Gemini 1.5 Pro / 3 Pro Preview (approximate):
            // Input: $3.50 / 1M tokens = $0.0000035/token = 0.00035 cents/token = 0.35 cents/1k tokens
            // Output: $10.50 / 1M tokens = $0.0000105/token = 0.00105 cents/token = 1.05 cents/1k tokens
            
            const inputCost = (usage.promptTokenCount || 0) / 1000 * 0.35
            const outputCost = (usage.candidatesTokenCount || 0) / 1000 * 1.05
            const totalCost = Math.max(1, Math.ceil(inputCost + outputCost))
            
            console.log(`Usage: Input ${usage.promptTokenCount}, Output ${usage.candidatesTokenCount}. Cost: ${totalCost} credits`)

            // Deduct from DB
            const { error: creditError } = await supabase.rpc('deduct_credits', {
              user_id_arg: session.user.id,
              amount: totalCost
            })
            
            // If RPC fails (maybe doesn't exist), fallback to direct update (less safe for concurrency but okay for now)
            if (creditError) {
               // Fallback
               const { data: currentProfile } = await supabase.from('profiles').select('credits').eq('id', session.user.id).single()
               if (currentProfile) {
                 const newBalance = Math.max(0, currentProfile.credits - totalCost)
                 await supabase.from('profiles').update({ credits: newBalance }).eq('id', session.user.id)
                 // Send usage info to client
                 const usageInfo = `<!-- CREDITS_DEDUCTED: ${totalCost} -->`
                 controller.enqueue(encoder.encode(usageInfo))
               }
            } else {
                 // Send usage info to client
                 const usageInfo = `<!-- CREDITS_DEDUCTED: ${totalCost} -->`
                 controller.enqueue(encoder.encode(usageInfo))
            }
          }

          controller.close()
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.error(error)
        }
      }
    })

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
