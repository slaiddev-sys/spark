'use client'

import React from 'react'
import Image from 'next/image'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nuvix-dark/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/Novix Favicon.png" 
              alt="Spark Logo" 
              width={24} 
              height={24}
              className="rounded-lg w-5 h-5 md:w-6 md:h-6"
            />
            <span className="text-white text-2xl md:text-3xl font-semibold">Spark</span>
          </a>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-8 ml-12">
            <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <a href="/login" className="text-white hover:text-gray-300 transition-colors px-3 md:px-4 py-2 text-sm md:text-base">
              Login
            </a>
            <a href="/signup" className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-4 md:px-6 py-2 rounded-lg transition-colors font-medium text-sm md:text-base">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

