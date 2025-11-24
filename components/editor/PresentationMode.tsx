'use client'

import React, { useState, useEffect } from 'react'
import { DesignFrame } from '@/app/editor/page'
import MockupRenderer from './MockupRenderer'
import PricingModal from './PricingModal'

interface PresentationModeProps {
  frames: DesignFrame[]
  initialFrameIndex: number
  onClose: () => void
  deviceMode: 'mobile' | 'desktop'
  hidePresentationButton?: boolean
}

export default function PresentationMode({ frames, initialFrameIndex, onClose, deviceMode, hidePresentationButton = false }: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialFrameIndex)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const currentFrame = frames[currentIndex]
  const frameType = currentFrame.type || deviceMode // Prefer frame's type, fallback to prop

  const handleNext = () => {
    if (currentIndex < frames.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'Escape' && !hidePresentationButton) onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, frames.length, onClose, hidePresentationButton])

  if (!currentFrame) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0b0f] flex flex-col items-center justify-center">
      {/* Header / Controls */}
      {!hidePresentationButton && (
        <div className="absolute top-6 right-6 flex items-center space-x-4 z-20">
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-800 transition-colors group"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-red-400 transition-colors">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex items-center justify-center w-full h-full p-8 relative">
        
        {/* Prev Button */}
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`absolute left-6 p-3 rounded-full transition-all transform hover:scale-110 ${
            currentIndex === 0 
              ? 'text-gray-800 cursor-not-allowed bg-gray-900/50' 
              : 'text-gray-400 hover:text-white bg-[#1a1b1e] border border-gray-800 hover:border-gray-600 shadow-xl'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Device Frame */}
        <div className="relative transition-all duration-500 ease-in-out flex-shrink-0"
             style={{
               width: frameType === 'mobile' ? '375px' : '1280px',
               height: frameType === 'mobile' ? '812px' : '800px',
               maxHeight: '90vh',
               maxWidth: '90vw',
               aspectRatio: frameType === 'mobile' ? '375/812' : '1280/800',
             }}
        >
            {/* Phone/Desktop Bezel */}
            <div className={`absolute -inset-[16px] pointer-events-none z-10 border-[16px] border-[#121212] shadow-2xl
                ${frameType === 'mobile' ? 'rounded-[3rem]' : 'rounded-2xl'}
            `}>
               {/* Mobile Notch / Speaker */}
               {frameType === 'mobile' && (
                 <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-[24px] bg-black rounded-b-2xl z-20"></div>
               )}
               
               {/* Desktop Camera / Dots */}
               {frameType === 'desktop' && (
                 <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-[12px] bg-black rounded-b-lg z-20 flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                 </div>
               )}
            </div>
            
            {/* Monitor Stand (Desktop only) */}
            {frameType === 'desktop' && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-full flex justify-center pointer-events-none">
                <div className="relative">
                   <div className="w-32 h-16 bg-gradient-to-b from-[#1a1b1e] to-[#111] -mt-4 mx-auto relative z-0"></div> {/* Neck */}
                   <div className="w-64 h-3 bg-[#222] rounded-full shadow-2xl -mt-1 relative z-10"></div> {/* Base */}
                </div>
              </div>
            )}
            
            {/* Screen Content */}
            <div className={`w-full h-full bg-white overflow-hidden relative z-0
                ${frameType === 'mobile' ? 'rounded-[2.2rem]' : 'rounded-xl'}
            `}>
                {currentFrame.isLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
                    {/* Blurred Background Mockup */}
                    <div className="absolute inset-0 p-6 space-y-8 bg-[#f8f9fa] opacity-50 filter blur-sm select-none pointer-events-none flex flex-col">
                       <div className="w-full flex justify-between items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div className="w-24 h-4 bg-gray-300 rounded"></div>
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                       </div>
                       <div className="w-full h-12 bg-gray-300 rounded-xl"></div>
                       <div className="flex space-x-4">
                          <div className="w-1/3 h-32 bg-gray-300 rounded-2xl"></div>
                          <div className="w-1/3 h-32 bg-gray-300 rounded-2xl"></div>
                          <div className="w-1/3 h-32 bg-gray-300 rounded-2xl"></div>
                       </div>
                       <div className="w-full h-64 bg-gray-300 rounded-2xl"></div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-30">
                       <div className="bg-white/10 border border-white/20 p-8 rounded-3xl flex flex-col items-center backdrop-blur-xl shadow-2xl mx-4">
                         <div className="w-14 h-14 bg-gradient-to-br from-[#0061e8] to-[#039fef] rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                         </div>
                         <h3 className="text-white font-bold text-xl mb-2">Full App Flow</h3>
                         <p className="text-gray-200 text-sm mb-6 text-center max-w-[220px] leading-relaxed">
                           Upgrade to Spark Pro to unlock the complete 6-screen user journey.
                         </p>
                         <button 
                           onClick={() => setIsPricingModalOpen(true)}
                           className="bg-white text-[#0061e8] hover:bg-gray-50 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg transform hover:scale-105 active:scale-95"
                         >
                            Upgrade Plan
                         </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <MockupRenderer designHtml={currentFrame.content} />
                )}
            </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          disabled={currentIndex === frames.length - 1}
          className={`absolute right-6 p-3 rounded-full transition-all transform hover:scale-110 ${
            currentIndex === frames.length - 1
              ? 'text-gray-800 cursor-not-allowed bg-gray-900/50' 
              : 'text-gray-400 hover:text-white bg-[#1a1b1e] border border-gray-800 hover:border-gray-600 shadow-xl'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

      </div>
      
      {/* Branding / Footer */}
      <div className="absolute bottom-8 flex flex-col items-center space-y-2">
         
      </div>

      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  )
}

