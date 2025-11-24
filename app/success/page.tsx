'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get('checkout_id')

  return (
    <main className="min-h-screen bg-[#0a0b0f] flex items-center justify-center relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/Abstract Background 2.png" 
          alt="Abstract Background" 
          fill
          className="object-cover opacity-30 mix-blend-soft-light"
          priority
        />
      </div>

      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <div className="bg-[#1a1b1e] border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-400 mb-8">
            Thank you for upgrading your plan. Your account has been updated.
            {checkoutId && <span className="block mt-2 text-xs text-gray-500">Ref: {checkoutId}</span>}
          </p>

          <Link 
            href="/editor" 
            className="block w-full bg-[#0061e8] hover:bg-[#0051c8] text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Return to Editor
          </Link>
        </div>
      </div>
    </main>
  )
}

