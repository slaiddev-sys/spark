'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      console.error('Google sign up error:', error)
      setMessage(error.message)
    }
  }


  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          avatar_url: '',
        },
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-nuvix-dark relative overflow-hidden flex items-center justify-center">
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

      {/* Sign Up Form */}
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

          <h1 className="text-4xl font-semibold text-white mb-3">
            Build your app today
          </h1>
          <p className="text-gray-400">
            Create an account to start using Spark.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl ${message.includes('Check') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Social Sign Up Buttons */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={handleGoogleSignUp}
            type="button"
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-nuvix-dark text-gray-400">OR</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-[#0a0b0f] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#0061e8] transition-colors"
            />
          </div>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to the{' '}
          <Link href="/terms" className="text-gray-400 hover:text-white underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-400 hover:text-white underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0061e8] hover:text-[#0051c8] font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

