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
            in seconds
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
          <div className="bg-[#0a0b0f] border border-[#2a3447] rounded-3xl p-5 hover:border-[#3a4557] transition-all shadow-2xl relative z-10">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask Spark to design an app..."
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none text-base min-h-[50px] leading-relaxed"
              rows={2}
            />
          </div>
          
          {/* Suggestion Pills */}
          <div className="mt-8 flex flex-col items-center space-y-3 relative z-0">
            <button
              type="button"
              onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Create a calorie tracking app')}`}
              className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-6 py-2.5 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
            >
              Calorie tracking app
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Design a productivity app')}`}
              className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-6 py-2.5 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
            >
              Productivity App
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Create a meditation app')}`}
              className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-6 py-2.5 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
            >
              Meditation App
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Design a sleep tracker app')}`}
              className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-6 py-2.5 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
            >
              Sleep tracker App
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

