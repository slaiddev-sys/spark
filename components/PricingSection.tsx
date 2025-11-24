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
    monthlyPrice: '$14.99',
    yearlyPrice: '$9',
    originalPrice: '$30',
    originalMonthlyPrice: '$29.99',
    yearlyBilling: '$105 billed once yearly',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '4 Apps',
      '300 AI credits per month',
      'Clone template App Designs',
      'Use images to create app designs',
      'Export App Design'
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
      '10 Apps',
      '500 AI credits per month',
      'Clone template App Designs',
      'Use images to create app designs',
      'Export App Design'
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
      'Unlimited Apps',
      '1000 AI credits per month',
      'Clone template App Designs',
      'Use images to create app designs',
      'Export App Design'
    ],
    buttonText: 'Upgrade to Ultimate',
    hasBlackFriday: true
  }
]

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleUpgrade = async (tier: PricingTier) => {
    if (tier.name === 'Free Trial') return

    // Polar Price IDs
    let priceId = ''
    if (tier.name === 'Starter') {
       priceId = billingCycle === 'yearly' ? '5e2abe25-9930-4f51-a205-c903bb215e52' : '40ff680b-f37e-4cf3-b8a0-685d9de81ee1'
    } else if (tier.name === 'Pro') {
       priceId = billingCycle === 'yearly' ? 'da212809-224c-4fd4-be12-427e128bc8b2' : '9f0c9f0c-82fb-4d58-b251-3c55fb829fab'
    } else if (tier.name === 'Ultimate') {
       priceId = billingCycle === 'yearly' ? '760a85ce-a8bd-4d32-ade5-7beec1f2a95e' : '3231f237-ba27-4773-b87c-cfa7189a12e5'
    }

    // Redirect to checkout
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

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-medium text-white mb-4 tracking-tight">
            Transparent pricing for everyone
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            A fraction of the cost and time of hiring designers or doing it yourself from scratch.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800/50 border border-gray-700 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-[#0061e8] text-white px-2 py-1 rounded-full">
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
                className={`relative rounded-3xl p-8 transition-all ${
                  tier.featured
                    ? 'bg-[#00123d] border-2 border-[#0061e8] shadow-2xl shadow-blue-500/20'
                    : 'bg-[#0a0b0f] border border-gray-700 hover:border-gray-600'
                }`}
              >
                {tier.featured && billingCycle === 'monthly' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#0061e8] text-white text-xs px-3 py-1 rounded-full">
                      Early Bird
                    </span>
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-white text-2xl font-semibold mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="mb-2">
                  {showBlackFriday && originalPrice && (
                    <span className="text-gray-500 text-xl line-through mr-2">
                      {originalPrice}
                    </span>
                  )}
                  <span className="text-white text-4xl font-bold">{displayPrice}</span>
                  <span className="text-gray-400 text-base">{tier.period}</span>
                </div>

                {/* Black Friday Badge */}
                {showBlackFriday && (
                  <div className="mb-4">
                    <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      BLACK FRIDAY DEAL
                    </span>
                  </div>
                )}

                {/* Yearly Billing Info */}
                {billingCycle === 'yearly' && (
                  <p className="text-gray-400 text-sm mb-4">{tier.yearlyBilling}</p>
                )}

                <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#0061e8] mr-3 mt-0.5 flex-shrink-0"
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
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(tier)}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    tier.featured || showBlackFriday
                      ? 'bg-[#0061e8] hover:bg-[#0051c8] text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
