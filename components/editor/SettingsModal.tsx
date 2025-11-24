'use client'

import React from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false)
  const [isCanceling, setIsCanceling] = React.useState(false)

  if (!isOpen) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleCancelPlan = async () => {
    setIsCanceling(true)
    
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      // Close modal and refresh
      setShowCancelConfirm(false)
      router.refresh()
      onClose()
      
      alert('Your subscription has been canceled. You can continue using your current plan until the end of the billing period.')
    } catch (error: any) {
      console.error('Error canceling subscription:', error)
      alert(error.message || 'Failed to cancel subscription. Please try again.')
    } finally {
      setIsCanceling(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      // Sign out and redirect to home
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting account:', error)
      alert(error.message || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JD'
  }

  const getPlanDetails = (tier: string) => {
    switch (tier) {
      case 'starter':
        return { name: 'Starter Plan', price: '$14.99/month', desc: 'Perfect for hobbyists.' }
      case 'pro':
        return { name: 'Pro Plan', price: '$24.99/month', desc: 'For professional developers.' }
      case 'ultimate':
        return { name: 'Ultimate Plan', price: '$49.99/month', desc: 'For agencies and teams.' }
      default:
        return { name: 'Free Trial', price: 'Free', desc: 'Try Spark risk-free.' }
    }
  }

  const plan = getPlanDetails(user?.tier || 'free')

  const handleContactSupport = () => {
    const win = window as any
    
    // Try to open Featurebase widget
    if (win.Featurebase && typeof win.Featurebase === 'function') {
      win.Featurebase('show')
    }
    
    // Close the settings modal
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[500px] bg-[#0a0b0f] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <h2 className="text-white font-semibold text-lg">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Account Section */}
          <div>
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Account</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0061e8] to-[#039fef] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user?.full_name ? getInitials(user.full_name) : 'JD'}
                </div>
                <div>
                  <h4 className="text-white font-medium text-base">{user?.full_name || 'John Doe'}</h4>
                  <p className="text-gray-500 text-sm">{user?.email || 'john.doe@example.com'}</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-[#1a1b1e] hover:bg-[#25262b] border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Subscription Plan */}
          <div>
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Subscription Plan</h3>
            <div className="border border-gray-800 rounded-xl p-5 bg-[#1a1b1e]">
              <div className="mb-4">
                 <h4 className="text-white font-bold text-base mb-1">{plan.name}</h4>
                 <p className="text-gray-400 text-sm">{plan.price}</p>
                 <p className="text-gray-500 text-xs mt-2">{plan.desc}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => router.push('/pricing')}
                  className="bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Plan
                </button>
                {user?.tier && user.tier !== 'free' && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-gray-400 hover:text-red-400 text-xs text-left transition-colors"
                  >
                    Cancel plan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Contact</h3>
            <div className="border border-gray-800 rounded-xl p-5 bg-[#1a1b1e]">
              <p className="text-gray-400 text-sm mb-4">
                Need help or have questions? Contact our support team.
              </p>
              <button
                onClick={handleContactSupport}
                className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
          
          {/* Delete Account */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3">Delete Account</h3>
            <div className="border border-gray-800 rounded-xl p-5 bg-[#1a1b1e]">
              <p className="text-gray-400 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              {showDeleteConfirm && (
                <p className="text-yellow-500 text-sm mb-4 font-medium">
                  ⚠️ Are you absolutely sure? Click "Confirm Delete" again to permanently delete your account.
                </p>
              )}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20"
                >
                  {isDeleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
                </button>
                {showDeleteConfirm && (
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[400px] bg-[#1a1b1e] rounded-xl border border-gray-800 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-3">Cancel Subscription?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancelPlan}
                disabled={isCanceling}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {isCanceling ? 'Canceling...' : 'Yes, Cancel Plan'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCanceling}
                className="flex-1 bg-[#1f2937] hover:bg-[#374151] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Keep Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
