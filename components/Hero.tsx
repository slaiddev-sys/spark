'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [inputValue, setInputValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to signup with the prompt
    if (inputValue.trim()) {
      // TODO: Handle image upload if selectedImage exists
      window.location.href = `/signup?prompt=${encodeURIComponent(inputValue)}`
    }
  }

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-full px-3 md:px-4 py-2 mb-8 md:mb-12">
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
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium text-white mb-3 md:mb-4 tracking-tight">
          Design Apps and Software
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium mb-6 md:mb-8 flex items-center justify-center gap-2 md:gap-3 tracking-tight">
          <span className="bg-gradient-to-r from-[#0061e8] to-[#039fef] bg-clip-text text-transparent">
            in seconds
          </span>
          <Image 
            src="/Novix Favicon.png" 
            alt="Spark Icon" 
            width={50} 
            height={50}
            className="inline-block w-10 h-10 md:w-12 md:h-12"
          />
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-xl text-gray-400 mb-8 md:mb-12 px-4">
          Go from idea to beautiful mockups in minutes by chatting with AI.
        </p>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-2">
          <div className="bg-[#0a0b0f] border border-[#2a3447] rounded-2xl md:rounded-3xl p-4 md:p-5 hover:border-[#3a4557] transition-all shadow-2xl relative z-10">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Spark to design an app..."
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none text-base min-h-[50px] leading-relaxed"
              rows={2}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2 mb-1">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-700 group">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 rounded-full p-1 transition-colors"
                    title="Remove image"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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

          {/* Suggestion Pills - Horizontal Layout */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 relative z-0">
             <button
               type="button"
               onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Create a calorie tracking app')}`}
               className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-5 py-2 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
             >
               Calorie tracking app
             </button>
             <button
               type="button"
               onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Design a productivity app')}`}
               className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-5 py-2 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
             >
               Productivity App
             </button>
             <button
               type="button"
               onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Create a meditation app')}`}
               className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-5 py-2 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
             >
               Meditation App
             </button>
             <button
               type="button"
               onClick={() => window.location.href = `/editor?prompt=${encodeURIComponent('Design a sleep tracker app')}`}
               className="bg-[#0a0b0f]/80 border border-[#2a3447] text-gray-400 hover:text-white hover:border-gray-500 px-5 py-2 rounded-full text-sm transition-all hover:bg-[#1a1b1e]"
             >
               Sleep tracker App
             </button>
          </div>
        </form>
      </div>
    </section>
  )
}

