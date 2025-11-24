'use client'

import React from 'react'
import Image from 'next/image'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nuvix-dark/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/Novix Favicon.png" 
              alt="Spark Logo" 
              width={24} 
              height={24}
              className="rounded-lg"
            />
            <span className="text-white text-3xl font-semibold">Spark</span>
          </a>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#explore" className="text-gray-300 hover:text-white transition-colors">
              Explore
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <a href="/login" className="text-white hover:text-gray-300 transition-colors px-4 py-2">
              Login
            </a>
            <a href="/signup" className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-6 py-2 rounded-lg transition-colors font-medium">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

