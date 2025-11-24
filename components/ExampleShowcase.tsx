'use client'

import React from 'react'
import Image from 'next/image'

interface ExampleApp {
  title: string
  image: string
}

export default function ExampleShowcase() {
  const examples: ExampleApp[] = [
    { title: 'Meditation App', image: '/Meditation 2.png' },
    { title: 'Sleep Cycle', image: '/Sleep 2.png' },
    { title: 'Calorie Tracking', image: '/Food.png' },
    { title: 'Finance App', image: '/Finance 2.png' },
  ]

  return (
    <section className="pt-0 pb-12 md:pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-8 md:mb-12 text-center">
          Example Apps Built with Spark
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {examples.map((example, idx) => (
            <div 
              key={idx}
              className="bg-[#0a0b0f] border border-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-700 transition-all"
            >
              <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">
                {example.title}
              </h3>
              
              <div className="relative w-full h-[300px] md:h-[400px] rounded-lg md:rounded-xl overflow-hidden">
                <Image
                  src={example.image}
                  alt={example.title}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

