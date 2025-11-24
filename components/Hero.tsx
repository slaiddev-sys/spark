'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to editor with the prompt
    if (inputValue.trim()) {
      window.location.href = `/editor?prompt=${encodeURIComponent(inputValue)}`
    }
  }

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 mb-12">
          <div className="flex -space-x-2">
            <Image 
              src="/Persona 1.jpg" 
              alt="User 1" 
              width={24} 
              height={24}
              className="w-6 h-6 rounded-full border-2 border-gray-800 object-cover"
            />
            <Image 
              src="/Person 2.jpg" 
              alt="User 2" 
              width={24} 
              height={24}
              className="w-6 h-6 rounded-full border-2 border-gray-800 object-cover"
            />
            <Image 
              src="/Persona 3.jpg" 
              alt="User 3" 
              width={24} 
              height={24}
              className="w-6 h-6 rounded-full border-2 border-gray-800 object-cover"
            />
          </div>
          <span className="text-gray-300 text-sm">25K+ Founders build with Spark</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-medium text-white mb-4 tracking-tight whitespace-nowrap">
          Design Apps and Software
        </h1>
        <h2 className="text-4xl md:text-6xl font-medium mb-8 flex items-center justify-center gap-3 tracking-tight">
          <span className="bg-gradient-to-r from-[#0061e8] to-[#039fef] bg-clip-text text-transparent">
            in minutes
          </span>
          <Image 
            src="/Novix Favicon.png" 
            alt="Spark Icon" 
            width={50} 
            height={50}
            className="inline-block"
          />
        </h2>

        {/* Subheading */}
        <p className="text-xl text-gray-400 mb-12">
          Go from idea to beautiful mockups in minutes by chatting with AI.
        </p>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="bg-[#0a0b0f] border border-[#2a3447] rounded-3xl p-5 hover:border-[#3a4557] transition-all shadow-2xl">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Spark to design an app..."
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none text-base min-h-[50px] leading-relaxed"
              rows={2}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2.5 hover:bg-[#2a3447] rounded-xl transition-colors"
                  title="Upload image"
                >
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <button
                type="submit"
                className="bg-[#0061e8] hover:bg-[#0051c8] text-white p-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/50"
                title="Submit"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 19V5M12 5L5 12M12 5L19 12" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

