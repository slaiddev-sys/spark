'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Check if we have a session (which we should after the auth callback exchanges the code)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Invalid or expired reset link. Please try again.')
      }
    }
    checkSession()
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => {
        router.push('/editor')
      }, 2000)
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
              className="rounded-lg w-8 h-8 md:w-10 md:h-10"
            />
          </Link>

          <h1 className="text-3xl font-semibold text-white mb-3">
            Set New Password
          </h1>
          <p className="text-gray-400">
            Please enter your new password below.
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

        {/* Password Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="w-full bg-[#0a0b0f] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#0061e8] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0061e8] hover:bg-[#0051c8] text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  )
}

