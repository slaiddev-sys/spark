'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MockupRendererProps {
  designHtml: string | null
  locked?: boolean
}

export default function MockupRenderer({ designHtml, locked = false }: MockupRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  // Show locked state for premium frames
  if (locked) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-[#0061e8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0061e8" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Premium Frame</h3>
          <p className="text-sm text-gray-400 mb-4 max-w-[200px]">
            Upgrade to unlock the complete 6-frame flow
          </p>
          <a 
            href="/pricing"
            className="inline-block bg-[#0061e8] hover:bg-[#0051c8] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    )
  }

  useEffect(() => {
    console.log("MockupRenderer received designHtml:", designHtml ? designHtml.substring(0, 50) + "..." : "null");
    if (!designHtml) return

    try {
      // Try to extract HTML from code block if present
      // We use a regex that doesn't strictly require the closing backticks to support streaming
      let htmlContent = designHtml || ''
      const codeBlockRegex = /```(?:\w*)\s*([\s\S]*?)(?:```|$)/
      const match = designHtml?.match(codeBlockRegex)
      
      if (match && match[1]) {
        htmlContent = match[1]
      } else if (htmlContent) {
        // Fallback cleanup for other patterns or raw partials
        htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '')
      }
      
      htmlContent = htmlContent.trim()

      // Relaxed check for streaming: as long as we have something that looks like a tag or DOCTYPE
      if (!htmlContent.includes('<') && !htmlContent.includes('<!DOCTYPE')) {
        // Only log if it's reasonably long and still no HTML, otherwise it's just starting
        if (htmlContent.length > 20) {
           console.log('Waiting for valid HTML...')
           // If content is long but no HTML, display it as text error to debug
           const errorBlob = new Blob([`<div style="padding: 20px; color: white; font-family: monospace; background: #1a1b1e; height: 100vh;">
             <h3 style="color: #ff5555;">Rendering Error: No HTML found</h3>
             <p>The AI returned text instead of code:</p>
             <pre style="white-space: pre-wrap; color: #aaa; background: #000; padding: 10px; border-radius: 8px;">${htmlContent}</pre>
           </div>`], { type: 'text/html' })
           const errorUrl = URL.createObjectURL(errorBlob)
           setBlobUrl(errorUrl)
           return
        }
        return
      }

      // Create a Blob URL for safer rendering
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)
      
      // Cleanup function
      return () => URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Error rendering HTML:', err)
    }
  }, [designHtml])

  if (!designHtml) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 animate-pulse">
        <div className="w-8 h-8 border-2 border-[#0061e8] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium">Generating...</p>
      </div>
    )
  }

  if (designHtml && !blobUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
        <div className="w-8 h-8 border-2 border-[#0061e8] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium">Designing UI...</p>
        <p className="text-[10px] opacity-50 mt-2 text-center max-w-[200px] truncate">{designHtml.substring(0, 50)}...</p>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl || ''}
      className="w-full h-full border-0"
      sandbox="allow-same-origin allow-scripts allow-forms"
      title="Design Preview"
    />
  )
}
