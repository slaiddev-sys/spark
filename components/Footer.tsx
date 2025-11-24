'use client'

import React from 'react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-gray-800 bg-nuvix-dark/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Copyright */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
              <Image 
                src="/Novix Favicon.png" 
                alt="Spark Logo" 
                width={24} 
                height={24}
                className="rounded-lg"
              />
              <span className="text-white text-2xl font-semibold">Spark</span>
            </a>
            <p className="text-gray-400 text-sm">
              © 2025 Spark. All rights reserved.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pages</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/editor" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Editor
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

