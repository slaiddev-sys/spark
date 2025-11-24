'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MockupRendererProps {
  designHtml: string | null
}

export default function MockupRenderer({ designHtml }: MockupRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    console.log("MockupRenderer received designHtml:", designHtml ? designHtml.substring(0, 50) + "..." : "null");
    if (!designHtml) return

    try {
      // Try to extract HTML from code block if present
      // We use a regex that doesn't strictly require the closing backticks to support streaming
      let htmlContent = designHtml || ''
      const codeBlockRegex = /```html\s*([\s\S]*?)(?:```|$)/
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
      src={blobUrl || ''}
      className="w-full h-full border-0"
      sandbox="allow-same-origin allow-scripts allow-forms"
      title="Design Preview"
    />
  )
}
