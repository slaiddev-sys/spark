'use client'

import React, { useState, useRef, useEffect } from 'react'
import ChatPanel from '@/components/editor/ChatPanel'
import PreviewPanel from '@/components/editor/PreviewPanel'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export interface DesignFrame {
  id: string
  content: string
  type: 'mobile' | 'desktop'
  timestamp: number
}

// History state interface
interface FramesHistory {
  past: DesignFrame[][]
  future: DesignFrame[][]
}

export default function EditorPage() {
  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'assistant' | 'system', 
    content: string,
    type?: 'status' | 'action' | 'result' | 'normal',
    image?: string,
    loading?: boolean
  }>>([])
  
  // State for multiple frames
  const [frames, setFrames] = useState<DesignFrame[]>([])
  const framesRef = useRef<DesignFrame[]>([]) // Ref to keep track of frames for async operations
  
  // Sync ref with state
  useEffect(() => {
    framesRef.current = frames
  }, [frames])

  const [history, setHistory] = useState<FramesHistory>({ past: [], future: [] })
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile')
  
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [currentProject, setCurrentProject] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUserAndProjects = async () => {
      setIsLoading(true) // Start initial loading
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Parallelize initial data fetching
      const [profileResult, projectsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ])

      const profile = profileResult.data
      const userProjects = projectsResult.data || []

      setUser({ ...session.user, ...profile })
      setProjects(userProjects)
      
      let initialProject = null
      if (userProjects.length > 0) {
        initialProject = userProjects[0]
      } else {
        // Create default project if none exist
        const { data: newProject } = await supabase
          .from('projects')
          .insert([{ user_id: session.user.id, name: 'My First App' }])
          .select()
          .single()
          
        if (newProject) {
          setProjects([newProject])
          initialProject = newProject
        }
      }
      
      setCurrentProject(initialProject)
      setIsLoading(false) // End initial loading
    }

    getUserAndProjects()
  }, [supabase, router])

  const handleCreateProject = async () => {
    if (!user) return

    const name = `App ${projects.length + 1}`
    const { data: newProject } = await supabase
      .from('projects')
      .insert([{ user_id: user.id, name }])
      .select()
      .single()

    if (newProject) {
      setProjects([newProject, ...projects])
      setCurrentProject(newProject)
      setFrames([]) // Clear frames for new project
      setMessages([]) // Clear chat
      setHistory({ past: [], future: [] })
    }
  }

  const handleSelectProject = (project: any) => {
    setCurrentProject(project)
    // States will be cleared/reloaded by useEffect when currentProject changes
    setFrames([]) 
    setMessages([]) 
    setHistory({ past: [], future: [] })
  }

  // Load Chat and Frames for current Project
  useEffect(() => {
    if (!currentProject) return

    const loadProjectData = async () => {
      // Only show loader if we have no data yet
      if (messages.length === 0 && frames.length === 0) {
         setIsLoading(true)
      }
      
      try {
        // Parallelize data loading for speed
        const [messagesResult, framesResult] = await Promise.all([
           supabase.from('messages').select('*').eq('project_id', currentProject.id).order('created_at', { ascending: true }),
           supabase.from('frames').select('*').eq('project_id', currentProject.id).order('created_at', { ascending: true })
        ])
        
        if (messagesResult.error) throw messagesResult.error
        if (framesResult.error) throw framesResult.error

        const dbMessages = messagesResult.data
        const dbFrames = framesResult.data

        if (dbMessages) {
           setMessages(dbMessages.map(m => ({
             role: m.role,
             content: m.content,
             image: m.image,
             type: m.type || 'normal'
           })))
        }

        if (dbFrames) {
          const loadedFrames = dbFrames.map(f => ({
            id: f.id,
            content: f.content,
            type: f.type,
            timestamp: new Date(f.created_at).getTime()
          }))
          setFrames(loadedFrames)
          setHistory({ past: [], future: [] }) 
        }
      } catch (error) {
        console.error('Error loading project data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProjectData()
  }, [currentProject, supabase])
  
  // Helper to update frames with history tracking
  const updateFramesWithHistory = (newFrames: DesignFrame[] | ((prev: DesignFrame[]) => DesignFrame[])) => {
    setFrames(prevFrames => {
      const updatedFrames = typeof newFrames === 'function' ? newFrames(prevFrames) : newFrames
      
      // Only add to history if frames actually changed
      if (JSON.stringify(prevFrames) !== JSON.stringify(updatedFrames)) {
        setHistory(prevHistory => ({
          past: [...prevHistory.past, prevFrames],
          future: [] // Clear future on new change
        }))
      }
      
      return updatedFrames
    })
  }

  // Sync entire project frames to DB
  const saveProjectFrames = async (framesToSave: DesignFrame[]) => {
    if (!currentProject) return

    try {
        // 1. Upsert the frames we have
        if (framesToSave.length > 0) {
            const { error: upsertError } = await supabase
                .from('frames')
                .upsert(framesToSave.map(f => ({
                    id: f.id,
                    project_id: currentProject.id,
                    content: f.content,
                    type: f.type,
                    created_at: new Date(f.timestamp).toISOString()
                })), { onConflict: 'id' })
            
            if (upsertError) throw upsertError
        }

        // 2. Delete frames that are NOT in our list
        // This ensures that if we undid a "creation" event, the created frames are removed from DB
        const currentIds = framesToSave.map(f => f.id)
        
        let deleteQuery = supabase.from('frames').delete().eq('project_id', currentProject.id)
        
        if (currentIds.length > 0) {
            deleteQuery = deleteQuery.not('id', 'in', `(${currentIds.join(',')})`)
        }
        
        const { error: deleteError } = await deleteQuery
        
        if (deleteError) throw deleteError

    } catch (error) {
        console.error('Error syncing frames to DB:', error)
    }
  }

  // Undo function
  const handleUndo = () => {
    console.log('Undo clicked. History past length:', history.past.length)
    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory // Nothing to undo

      const previousFrames = prevHistory.past[prevHistory.past.length - 1]
      const newPast = prevHistory.past.slice(0, -1)
      
      console.log('Restoring frames:', previousFrames)
      setFrames(previousFrames) // Restore past frames
      saveProjectFrames(previousFrames) // Sync to DB
      
      // We need to use the CURRENT frames state here for the future stack
      // Since setFrames is async, we use the 'frames' from the closure which is the current state before undo
      return {
        past: newPast,
        future: [frames, ...prevHistory.future] // Push current frames to future
      }
    })
  }

  // Redo function
  const handleRedo = () => {
    console.log('Redo clicked. History future length:', history.future.length)
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory // Nothing to redo

      const nextFrames = prevHistory.future[0]
      const newFuture = prevHistory.future.slice(1)
      
      console.log('Restoring future frames:', nextFrames)
      setFrames(nextFrames) // Restore future frames
      saveProjectFrames(nextFrames) // Sync to DB
      
      return {
        past: [...prevHistory.past, frames], // Push current frames to past
        future: newFuture
      }
    })
  }

  const handleContextSelectionChange = (selected: boolean) => {
    if (!selected) {
      setSelectedFrameId(null)
    }
  }

  const handleSendMessage = async (message: string, image?: string) => {
    // Check credits before processing
    if (user && (user.credits || 0) < 5) {
       setMessages(prev => [...prev, { role: 'user', content: message, image }])
       setMessages(prev => [...prev, { 
         role: 'assistant', 
         content: '⚠️ Insufficient credits, Upgrade to get more credits'
       }])
       return
    }

    // Capture history state before making any changes for Undo
    // Use deep copy to ensure state isolation
    const framesBeforeRequest = JSON.parse(JSON.stringify(frames))

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message, image }])
    setIsLoading(true)
    
    // Show status: generating request
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: 'Generating Request',
      type: 'status',
      loading: true
    }])

    // SAVE USER MESSAGE
    if (currentProject) {
      const { error: userMsgError } = await supabase.from('messages').insert({
        project_id: currentProject.id,
        role: 'user',
        content: message,
        image: image,
        type: 'normal'
      })
      
      if (userMsgError) {
        console.error('Error saving user message:', userMsgError)
        setMessages(prev => [...prev, { 
            role: 'system', 
            content: `⚠️ Database Error (User Message): ${userMsgError.message}`,
            type: 'status'
        }])
      }
    }
    
    // Prepare to track frames involved in this generation
    let generatedFrameIds: string[] = []
    
    // Identify the context (current design to edit)
    let currentDesignContent: string | null = null

    if (selectedFrameId) {
      // EDITING MODE
      generatedFrameIds = [selectedFrameId]
      const selectedFrame = frames.find(f => f.id === selectedFrameId)
      if (selectedFrame) {
        currentDesignContent = selectedFrame.content
      }
    } else {
      // CREATION MODE
      // Initialize with one placeholder frame immediately
      const firstId = Date.now().toString()
      generatedFrameIds.push(firstId)
      
      setFrames(prev => [...prev, { 
        id: firstId, 
        content: '', // Start empty, MockupRenderer will show "Generating..."
        type: deviceMode, 
        timestamp: Date.now() 
      }])
    }

    try {
      console.log('Starting generation. Current Project:', currentProject)

      // Prepare conversation history (exclude system messages)
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content, image: m.image }))

      // Call streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          image,
          history: conversationHistory,
          deviceMode,
          currentDesign: currentDesignContent
        })
      })

      if (!response.ok || !response.body) {
        if (response.status === 402) {
             throw new Error('Insufficient credits')
        }
        throw new Error('Failed to get streaming response from AI')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let receivedHtml = ''
      let lastUpdateTime = 0
      const THROTTLE_MS = 50

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        
        // Check for credit deduction info
        const creditMatch = chunk.match(/<!-- CREDITS_DEDUCTED: (\d+) -->/)
        if (creditMatch) {
            const deducted = parseInt(creditMatch[1], 10)
            if (!isNaN(deducted) && user) {
                setUser(prevUser => ({ ...prevUser, credits: Math.max(0, (prevUser.credits || 0) - deducted) }))
            }
            // Remove the credit info from the chunk so it doesn't render
            // Although it's a comment, cleaner to remove or just let it be part of receivedHtml if it doesn't break rendering
            // receivedHtml += chunk.replace(creditMatch[0], '') 
            // Actually, let's keep it in receivedHtml, since it's a comment it won't affect rendering much
            // But better to strip it to avoid cluttering the design code
            receivedHtml += chunk.replace(/<!-- CREDITS_DEDUCTED: \d+ -->/g, '')
        } else {
            receivedHtml += chunk
        }

        // Parse matches for multi-frame generation
        const codeBlockRegex = /```html\s*([\s\S]*?)(?:```|$)/g
        const matches = [...receivedHtml.matchAll(codeBlockRegex)]
        
        // If we are in creation mode, we might need to add more frames
        if (!selectedFrameId) {
           const count = matches.length > 0 ? matches.length : 1
           
           while (generatedFrameIds.length < count) {
              const newId = (Date.now() + generatedFrameIds.length).toString()
              generatedFrameIds.push(newId)
           }
        }

        // Update Frames State
        const now = Date.now()
        if (now - lastUpdateTime > THROTTLE_MS) {
            setFrames(prevFrames => {
              let updatedFrames = [...prevFrames]

              // 1. Ensure all generated frames exist in state
              generatedFrameIds.forEach(id => {
                  if (!updatedFrames.find(f => f.id === id)) {
                      updatedFrames.push({
                          id,
                          content: '',
                          type: deviceMode,
                          timestamp: Date.now()
                      })
                  }
              })

              // 2. Update content
              if (!selectedFrameId && matches.length > 0) {
                  matches.forEach((match, index) => {
                      if (index < generatedFrameIds.length) {
                          const frameId = generatedFrameIds[index]
                          updatedFrames = updatedFrames.map(f => 
                              f.id === frameId ? { ...f, content: match[1] } : f
                          )
                      }
                  })
              } else if (!selectedFrameId && matches.length === 0) {
                   updatedFrames = updatedFrames.map(f => 
                       f.id === generatedFrameIds[0] ? { ...f, content: receivedHtml } : f
                   )
              } else if (selectedFrameId) {
                   const content = matches.length > 0 ? matches[0][1] : receivedHtml
                   updatedFrames = updatedFrames.map(f => 
                      f.id === selectedFrameId ? { ...f, content: content } : f
                   )
              }

              return updatedFrames
            })
            lastUpdateTime = now
        }
      }
      
      // FINAL UPDATE after stream ends
      
      // Calculate frames to save strictly from generated content to avoid stale state issues
      const codeBlockRegex = /```html\s*([\s\S]*?)(?:```|$)/g
      const matches = [...receivedHtml.matchAll(codeBlockRegex)]
      const framesToSave: DesignFrame[] = []

      generatedFrameIds.forEach((id, index) => {
          let content = ''
          // Determine content for this frame ID
          if (selectedFrameId) {
              // Editing mode: single frame
              content = matches.length > 0 ? matches[0][1] : receivedHtml
          } else {
              // Creation mode: multiple frames
              if (matches.length > 0 && index < matches.length) {
                  content = matches[index][1]
              } else if (matches.length === 0 && index === 0) {
                  content = receivedHtml
              }
          }

          // Add to list if content exists (or empty string if it's a placeholder that didn't get generated?)
          // We should save even if empty to keep the ID consistent? 
          // But usually we have content by now.
          
          framesToSave.push({
              id,
              content,
              type: deviceMode, // Note: This overwrites type if editing. If preserving type is critical, we'd need to fetch it. 
              // But for now, assume user wants current deviceMode applied if they switched toggle.
              timestamp: Date.now() 
          })
      })

      // Update React State (UI)
      setFrames(prevFrames => {
          let updatedFrames = [...prevFrames]
          
          framesToSave.forEach(frame => {
             const existingIndex = updatedFrames.findIndex(f => f.id === frame.id)
             if (existingIndex >= 0) {
                 updatedFrames[existingIndex] = { ...updatedFrames[existingIndex], ...frame }
             } else {
                 updatedFrames.push(frame)
             }
          })
          
          return updatedFrames
      })

      // SAVE TO DB (Assistant Message + Frames)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
          console.error('No active session. Cannot save to DB.')
          setMessages(prev => [...prev, { 
            role: 'system', 
            content: '⚠️ Session expired. Please refresh the page or log in again to save your work.',
            type: 'status'
          }])
          return
      }

      if (currentProject) {
        console.log('Saving to project:', currentProject.id, 'with User ID:', session.user.id)
        
        // 1. Save Assistant Message
        const assistantContent = `I've created the design based on your request: "${message.length > 50 ? message.slice(0, 50) + '...' : message}". Feel free to click on the frame to make edits!`
        
        const { data: msgData, error: msgError } = await supabase.from('messages').insert({
          project_id: currentProject.id,
          role: 'assistant',
          content: assistantContent,
          type: 'normal'
        }).select()
        
        if (msgError) {
            console.error('Error saving assistant message:', msgError)
            setMessages(prev => [...prev, { 
                role: 'system', 
                content: `⚠️ Database Error (Messages): ${msgError.message}. Details: ${msgError.details || 'None'}`,
                type: 'status'
            }])
        } else {
            console.log('Assistant message saved:', msgData)
        }

        // 2. Save/Update Frames
        console.log('Saving frames:', framesToSave)
        for (const frame of framesToSave) {
          const { data: frameData, error: frameError } = await supabase.from('frames').upsert({
            id: frame.id,
            project_id: currentProject.id,
            content: frame.content,
            type: frame.type,
            created_at: new Date(frame.timestamp).toISOString()
          }, { onConflict: 'id' }).select()
          
          if (frameError) {
             console.error('Error saving frame:', frameError)
             setMessages(prev => [...prev, { 
                role: 'system', 
                content: `⚠️ Database Error (Frame ${frame.id}): ${frameError.message}. Details: ${frameError.details || 'None'}`,
                type: 'status'
            }])
          } else {
             console.log('Frame saved successfully:', frame.id, frameData)
          }
        }
      } else {
        console.error('No current project found. Cannot save.')
        setMessages(prev => [...prev, { 
            role: 'system', 
            content: '⚠️ Error: No active project found. Your work might not be saved.',
            type: 'status'
        }])
      }

      // Update History
      setHistory(prevHistory => ({
         past: [...prevHistory.past, framesBeforeRequest],
         future: []
      }))
      
      // Update Messages
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage.role === 'system' && lastMessage.type === 'status') {
          lastMessage.loading = false
        }
        return newMessages
      })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've created the design based on your request: "${message.length > 50 ? message.slice(0, 50) + '...' : message}". Feel free to click on the frame to make edits!`,
        type: 'normal'
      }])
      
      if (selectedFrameId) {
        setSelectedFrameId(null)
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error)
      
      let errorMessage = '❌ Sorry, I encountered an error. Please make sure your Gemini API key is configured correctly in .env.local'
      
      if (error.message === 'Insufficient credits') {
        errorMessage = '⚠️ Insufficient credits, Upgrade to get more credits'
        // Remove status message
        setMessages(prev => {
             const filtered = prev.filter(m => !(m.role === 'system' && m.content === 'Generating Request'))
             return [...filtered, { role: 'assistant', content: errorMessage }]
        })
        // Cleanup: remove the empty frame if it was new and failed
        if (!selectedFrameId && generatedFrameIds.length > 0) {
             setFrames(prev => prev.filter(f => !generatedFrameIds.includes(f.id)))
        }
        return // Exit
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }])
      // Cleanup: remove the empty frame if it was new and failed?
      if (!selectedFrameId && generatedFrameIds.length > 0) {
        // setFrames(prev => prev.filter(f => !generatedFrameIds.includes(f.id)))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameProject = async (projectId: string, newName: string) => {
    // Optimistic update
    setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName } : p))
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, name: newName })
    }

    // Database update
    const { error } = await supabase
      .from('projects')
      .update({ name: newName })
      .eq('id', projectId)

    if (error) {
      console.error('Error renaming project:', error)
      // Note: In a production app, we should revert the state here if the DB update fails
    }
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0b0f] text-white">
        {/* Simple Loading Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-nuvix-dark flex overflow-hidden fixed inset-0">
      {/* Chat Panel */}
      <ChatPanel 
        messages={messages}
        onSendMessage={handleSendMessage}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        isContextSelected={!!selectedFrameId}
        setIsContextSelected={handleContextSelectionChange}
        user={user}
      />
      
      {/* Preview Panel */}
      <PreviewPanel 
        frames={frames}
        selectedFrameId={selectedFrameId}
        onSelectFrame={setSelectedFrameId}
        deviceMode={deviceMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        projects={projects}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        user={user}
      />
    </div>
  )
}
