'use client'

import React from 'react'

interface ExampleCard {
  icon: JSX.Element
  title: string
  style: string
  iconBg: string
}

const examples: ExampleCard[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
      </svg>
    ),
    title: 'Health Tracker',
    style: 'Neo-Brutalism',
    iconBg: 'bg-blue-500'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C8 3 5 6 5 10C5 13 7 17 12 21C17 17 19 13 19 10C19 6 16 3 12 3Z" fill="currentColor"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    ),
    title: 'Weather Forecast',
    style: 'Glassmorphism',
    iconBg: 'bg-cyan-500'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
      </svg>
    ),
    title: 'Pet Manager',
    style: 'Playful Whimsical',
    iconBg: 'bg-pink-500'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Stopwatch & Timer',
    style: 'Swiss Style',
    iconBg: 'bg-indigo-500'
  }
]

export default function ExampleCards() {
  const handleCardClick = (title: string, style: string) => {
    const prompt = `Create a ${title} app with ${style} design`
    window.location.href = `/editor?prompt=${encodeURIComponent(prompt)}`
  }

  return (
    <section className="pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(example.title, example.style)}
              className="bg-[#1e2639]/50 border border-[#2a3447] hover:border-[#4169FF]/50 rounded-2xl px-5 py-4 transition-all group text-left"
            >
              <div className="flex items-center space-x-3">
                <div className={`${example.iconBg} p-2 rounded-lg text-white flex items-center justify-center`}>
                  {example.icon}
                </div>
                <div>
                  <span className="text-white font-normal text-base">
                    {example.title} <span className="text-gray-400">({example.style})</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

