'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Frame {
  id: string
  content: string
  frame_number: number
}

interface Project {
  id: string
  title: string
  frames: Frame[]
}

interface ExampleApp {
  email: string
  title: string
  project?: Project
}

export default function ExampleShowcase() {
  const [examples, setExamples] = useState<ExampleApp[]>([
    { email: 'manuel.odik@gmail.com', title: 'Meditation App' },
    { email: 'manuelreviewss@gmail.com', title: 'Sleep Cycle' },
    { email: 'manuelsuscripciones26@gmail.com', title: 'Calorie Tracking' },
    { email: 'manuelealbetancor@gmail.com', title: 'Finance App' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExampleProjects()
  }, [])

  const fetchExampleProjects = async () => {
    const supabase = createClient()
    
    try {
      const updatedExamples = await Promise.all(
        examples.map(async (example) => {
          // Get user ID from email
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', example.email)
            .limit(1)
          
          if (!profiles || profiles.length === 0) return example

          const userId = profiles[0].id

          // Get the first project for this user
          const { data: projects } = await supabase
            .from('projects')
            .select('id, title')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)

          if (!projects || projects.length === 0) return example

          const project = projects[0]

          // Get first 3 frames
          const { data: frames } = await supabase
            .from('frames')
            .select('id, content, frame_number')
            .eq('project_id', project.id)
            .order('frame_number', { ascending: true })
            .limit(3)

          return {
            ...example,
            project: {
              ...project,
              frames: frames || []
            }
          }
        })
      )

      setExamples(updatedExamples)
    } catch (error) {
      console.error('Error fetching example projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-12 text-center">
            Example Apps Built with Spark
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0a0b0f] border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
                <div className="flex space-x-4">
                  <div className="w-32 h-48 bg-gray-800 rounded-lg"></div>
                  <div className="w-32 h-48 bg-gray-800 rounded-lg"></div>
                  <div className="w-32 h-48 bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

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
              
              {example.project && example.project.frames.length > 0 ? (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {example.project.frames.map((frame, frameIdx) => (
                    <div 
                      key={frame.id}
                      className="flex-shrink-0 w-[200px] h-[350px] bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-gray-900"
                    >
                      <iframe
                        srcDoc={frame.content}
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin"
                        title={`${example.title} - Frame ${frameIdx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No frames available yet
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

