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
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-12 text-center">
          Example Apps Built with Spark
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {examples.map((example, idx) => (
            <div 
              key={idx}
              className="bg-[#0a0b0f] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all"
            >
              <h3 className="text-xl font-semibold text-white mb-6">
                {example.title}
              </h3>
              
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
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

