'use client'

import React, { useState } from 'react'

interface PricingTier {
  name: string
  monthlyPrice: string
  yearlyPrice: string
  originalPrice?: string
  originalMonthlyPrice?: string
  yearlyBilling: string
  period: string
  description: string
  features: string[]
  buttonText: string
  featured?: boolean
  hasBlackFriday?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free Trial',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    yearlyBilling: '$0 billed once yearly',
    period: '/month',
    description: 'Try Spark risk-free',
    features: [
      '1 Project',
      '10 AI credits',
      'Limited code exports'
    ],
    buttonText: 'Current Plan',
    hasBlackFriday: false
  },
  {
    name: 'Starter',
    monthlyPrice: '$9.99',
    yearlyPrice: '$9',
    originalPrice: '$30',
    originalMonthlyPrice: '$29.99',
    yearlyBilling: '$105 billed once yearly',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '4 Projects',
      '300 AI credits per month',
      'Clone template Project Designs',
      'Use images to create project designs',
      'Export Project Design'
    ],
    buttonText: 'Upgrade to Starter',
    hasBlackFriday: true
  },
  {
    name: 'Pro',
    monthlyPrice: '$24.99',
    yearlyPrice: '$15',
    originalPrice: '$50',
    originalMonthlyPrice: '$49.99',
    yearlyBilling: '$175 billed once yearly',
    period: '/month',
    description: 'Most popular for growing businesses',
    features: [
      '10 Projects',
      '500 AI credits per month',
      'Clone template Project Designs',
      'Use images to create project designs',
      'Export Project Design'
    ],
    buttonText: 'Upgrade to Pro',
    featured: true,
    hasBlackFriday: true
  },
  {
    name: 'Ultimate',
    monthlyPrice: '$49.99',
    yearlyPrice: '$29',
    originalPrice: '$100',
    originalMonthlyPrice: '$99.99',
    yearlyBilling: '$350 billed once yearly',
    period: '/month',
    description: 'For power users and teams',
    features: [
      'Unlimited Projects',
      '1000 AI credits per month',
      'Clone template Project Designs',
      'Use images to create project designs',
      'Export Project Design'
    ],
    buttonText: 'Upgrade to Ultimate',
    hasBlackFriday: true
  }
]

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleUpgrade = async (tier: PricingTier) => {
    if (tier.name === 'Free Trial') {
      onClose()
      return
    }

    // Polar Price IDs
    let priceId = ''
    if (tier.name === 'Starter') {
       priceId = billingCycle === 'yearly' ? '5e2abe25-9930-4f51-a205-c903bb215e52' : '40ff680b-f37e-4cf3-b8a0-685d9de81ee1'
    } else if (tier.name === 'Pro') {
       priceId = billingCycle === 'yearly' ? 'da212809-224c-4fd4-be12-427e128bc8b2' : '9f0c9f0c-82fb-4d58-b251-3c55fb829fab'
    } else if (tier.name === 'Ultimate') {
       priceId = billingCycle === 'yearly' ? '760a85ce-a8bd-4d32-ade5-7beec1f2a95e' : '3231f237-ba27-4773-b87c-cfa7189a12e5'
    }

    // Redirect to the checkout route
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session:', data.error)
        alert('Failed to initiate checkout. Please try again.')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('An error occurred during checkout. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0a0b0f] rounded-3xl border border-gray-800 w-full max-w-7xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white z-10 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Upgrade your plan</h2>
            <p className="text-gray-400 mb-8 text-lg">Unlock the full potential of Spark AI</p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-800/50 border border-gray-700 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-colors text-sm font-medium ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full transition-colors text-sm font-medium ${
                  billingCycle === 'yearly'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-[#0061e8] text-white px-2 py-0.5 rounded-full">
                  4 months free
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => {
              const displayPrice = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice
              const originalPrice = billingCycle === 'yearly' ? tier.originalPrice : tier.originalMonthlyPrice
              const showBlackFriday = tier.hasBlackFriday
              
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-6 transition-all flex flex-col ${
                    tier.featured
                      ? 'bg-[#00123d] border-2 border-[#0061e8] shadow-2xl shadow-blue-500/20'
                      : 'bg-[#1a1b1e] border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {tier.featured && billingCycle === 'monthly' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#0061e8] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                        Early Bird
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-white text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline mb-1">
                      {showBlackFriday && originalPrice && (
                        <span className="text-gray-500 text-lg line-through mr-2">
                          {originalPrice}
                        </span>
                      )}
                      <span className="text-white text-3xl font-bold">{displayPrice}</span>
                      <span className="text-gray-400 text-sm ml-1">{tier.period}</span>
                    </div>
                    
                    {showBlackFriday && (
                      <div className="mt-2 mb-2">
                        <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                          BLACK FRIDAY DEAL
                        </span>
                      </div>
                    )}

                    {billingCycle === 'yearly' && (
                      <p className="text-gray-400 text-xs">{tier.yearlyBilling}</p>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-6 min-h-[40px]">{tier.description}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, idx) => {
                      // Adjust credit amount for annual plans
                      let featureText = feature
                      if (billingCycle === 'yearly' && feature.includes('AI credits per month')) {
                         const credits = parseInt(feature.split(' ')[0])
                         if (!isNaN(credits)) {
                            featureText = `${credits * 12} AI credits per year`
                         }
                      }
                      return (
                      <li key={idx} className="flex items-start text-sm">
                        <svg
                          className="w-4 h-4 text-[#0061e8] mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-300">{featureText}</span>
                      </li>
                    )})}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(tier)}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                      tier.featured || showBlackFriday
                        ? 'bg-[#0061e8] hover:bg-[#0051c8] text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
