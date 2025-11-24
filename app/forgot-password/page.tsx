'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the password reset link.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0a0b0f] relative overflow-hidden flex items-center justify-center">
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

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-8">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center space-x-2 mb-8 hover:opacity-80 transition-opacity">
            <Image 
              src="/Novix Favicon.png" 
              alt="Spark Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
          </Link>

          <h1 className="text-3xl font-semibold text-white mb-3">
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter your email to receive a reset link.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-green-900/20 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-[#0a0b0f] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#0061e8] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0061e8] hover:bg-[#0051c8] text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Remember your password?{' '}
          <Link href="/login" className="text-[#0061e8] hover:text-[#0051c8] font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  )
}

