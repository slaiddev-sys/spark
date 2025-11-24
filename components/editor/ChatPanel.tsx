'use client'

import React, { useState, useRef, useEffect } from 'react'
import SettingsModal from './SettingsModal'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'status' | 'action' | 'result' | 'normal'
  image?: string
  loading?: boolean
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string, image?: string) => void
  deviceMode: 'mobile' | 'desktop'
  setDeviceMode: (mode: 'mobile' | 'desktop') => void
  isContextSelected: boolean
  setIsContextSelected: (selected: boolean) => void
  user: any
}

export default function ChatPanel({ messages, onSendMessage, deviceMode, setDeviceMode, isContextSelected, setIsContextSelected, user }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() || selectedImage) {
      onSendMessage(input, selectedImage || undefined)
      setInput('')
      setSelectedImage(null)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JD'
  }

  return (
    <div className="w-[360px] bg-[#0a0b0f] border-r border-gray-800 flex flex-col flex-shrink-0 relative z-20">

      {/* Account Section */}
      <div className="h-[74px] px-4 border-b border-gray-800 flex items-center flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          {/* Left Side: Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0061e8] to-[#039fef] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.full_name ? getInitials(user.full_name) : 'JD'}
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">{user?.full_name || 'John Doe'}</h3>
              <p className="text-gray-400 text-xs">
                {user?.tier === 'pro' ? 'Pro Plan' : 
                 user?.tier === 'starter' ? 'Starter Plan' : 
                 user?.tier === 'ultimate' ? 'Ultimate Plan' : 'Free Trial'}
              </p>
            </div>
          </div>

          {/* Right Side: Credits & Settings */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50">
              <img src="/Novix Favicon.png" alt="Credits" className="w-3.5 h-3.5" />
              <span className="text-xs font-medium text-gray-300">{user?.credits ?? 0}</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              title="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-24">
            <img src="/Novix Favicon.png" alt="Spark AI" className="w-12 h-12 mx-auto mb-4" />
            <p className="mb-4 text-gray-300">👋 Hi! I'm Spark AI</p>
            <p className="text-sm">Start by describing the app you want to design</p>
            <div className="mt-12 flex flex-col items-center space-y-2">
              <button 
                onClick={() => onSendMessage('Create a calorie tracking app')}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-full text-sm text-gray-300 transition-colors"
              >
                Calorie tracking app
              </button>
              <button 
                onClick={() => onSendMessage('Design a productivity app')}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-full text-sm text-gray-300 transition-colors"
              >
                Productivity App
              </button>
              <button 
                onClick={() => onSendMessage('Create a meditation app')}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-full text-sm text-gray-300 transition-colors"
              >
                Meditation App
              </button>
              <button 
                onClick={() => onSendMessage('Design a sleep tracker app')}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-full text-sm text-gray-300 transition-colors"
              >
                Sleep tracker App
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              if (message.type === 'status') {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="bg-gray-800/50 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      {message.loading ? (
                        <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span>{message.content}</span>
                    </div>
                  </div>
                )
              }
              
              if (message.type === 'action') {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="bg-gray-800/50 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>{message.content}</span>
                    </div>
                  </div>
                )
              }
              
              if (message.type === 'result') {
                return (
                  <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm mb-1">{message.content.split('\n')[0]}</h4>
                        <div className="flex items-center space-x-2 text-green-400 text-xs">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          <span>Generated screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              
              return (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Uploaded" 
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#2d2e31] rounded-[28px] px-5 py-4 shadow-xl border border-gray-800/50">
            {/* Selected Context Indicator */}
            {isContextSelected && (
              <div className="flex items-center justify-between bg-[#3d3e42] rounded-lg p-2 mb-3 border border-blue-500/30 group relative">
                <div className="flex items-center space-x-2 text-xs text-blue-300">
                  <div className="bg-blue-500/20 p-1 rounded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <span className="font-medium">Editing Current Design</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContextSelected(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img src={selectedImage} alt="Upload preview" className="max-w-[200px] max-h-[150px] rounded-lg" />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Allow space key to work normally
                if (e.key === ' ') {
                  return
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              onKeyPress={(e) => {
                // Ensure space works
                if (e.key === ' ') {
                  e.stopPropagation()
                }
              }}
              placeholder="Describe your app or attach an image for inspiration..."
              rows={3}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-[15px] resize-none leading-relaxed mb-3"
              style={{ whiteSpace: 'pre-wrap' }}
              autoComplete="off"
              spellCheck="true"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  title="Attach image"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>

                {/* Device Toggle */}
                <div className="bg-[#1f2023] p-1 rounded-lg flex items-center border border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => setDeviceMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-[#3d3e42] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Mobile View"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12" y2="18"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-[#3d3e42] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Desktop View"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                className="bg-[#0061e8] hover:bg-[#0051c8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-lg"
              >
                <svg 
                  width="16" 
                  height="16" 
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

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user}
      />
    </div>
  )
}
