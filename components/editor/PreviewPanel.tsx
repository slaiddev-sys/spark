'use client'

import React, { useState, useRef, useEffect } from 'react'
import MockupRenderer from './MockupRenderer'
import { DesignFrame } from '@/app/editor/page'
import PricingModal from './PricingModal'
import PresentationMode from './PresentationMode'
import JSZip from 'jszip'

interface PreviewPanelProps {
  frames: DesignFrame[]
  selectedFrameId: string | null
  onSelectFrame: (id: string | null) => void
  deviceMode: 'mobile' | 'desktop'
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  projects: any[]
  currentProject: any
  onSelectProject: (project: any) => void
  onCreateProject: () => void
  onRenameProject: (projectId: string, newName: string) => void
  user: any
  forcePresentationMode?: boolean
  isPricingModalOpen: boolean
  setIsPricingModalOpen: (isOpen: boolean) => void
}

export default function PreviewPanel({ frames, selectedFrameId, onSelectFrame, deviceMode, onUndo, onRedo, canUndo, canRedo, projects, currentProject, onSelectProject, onCreateProject, onRenameProject, user, forcePresentationMode = false, isPricingModalOpen, setIsPricingModalOpen }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(50)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [spacePressed, setSpacePressed] = useState(false)
  
  // Frame Dragging State
  const [framePositions, setFramePositions] = useState<Record<string, { x: number, y: number }>>({})
  const [draggingFrameId, setDraggingFrameId] = useState<string | null>(null)
  const hasDragged = useRef(false)

  // Initialize positions for new frames
  useEffect(() => {
    setFramePositions(prev => {
        const newPositions = { ...prev }
        let hasUpdates = false
        
        // Find the right-most position to append new frames
        let maxX = 0
        
        // Calculate occupied space based on existing positions
        Object.keys(prev).forEach(id => {
             const frame = frames.find(f => f.id === id)
             if (frame) {
                  const width = frame.type === 'mobile' ? 375 : 1280
                  const rightEdge = prev[id].x + width + 100
                  if (rightEdge > maxX) maxX = rightEdge
             }
        })
        
        frames.forEach(frame => {
            if (!newPositions[frame.id]) {
                // Center frames vertically by using negative Y offset based on frame height
                const height = frame.type === 'mobile' ? 812 : 800
                newPositions[frame.id] = { x: maxX, y: -height / 2 }
                const width = frame.type === 'mobile' ? 375 : 1280
                maxX += width + 100
                hasUpdates = true
            }
        })
        
        return hasUpdates ? newPositions : prev
    })
  }, [frames])

  // Project Selection State
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Presentation Mode State
  const [isPresentationOpen, setIsPresentationOpen] = useState(false)
  
  // Auto-enable presentation mode on mobile
  useEffect(() => {
    if (forcePresentationMode && frames.length > 0) {
      setIsPresentationOpen(true)
    }
  }, [forcePresentationMode, frames.length])

  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  
  // Export Code Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportLanguage, setExportLanguage] = useState<'html' | 'react'>('html')
  const [activeExportTab, setActiveExportTab] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Handle keyboard events for space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture space if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
      
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setSpacePressed(true)
      }

      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
           if (canRedo) onRedo()
        } else {
           if (canUndo) onUndo()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't capture space if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
      
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePressed(false)
        setIsDragging(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [canUndo, canRedo, onUndo, onRedo])

  // Handle mouse wheel for zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + scroll
      const delta = e.deltaY > 0 ? -10 : 10
      setZoom(prev => Math.max(25, Math.min(200, prev + delta)))
    } else {
      // Pan with scroll
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }))
    }
  }

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const frameElement = target.closest('[data-frame-id]')
    const frameId = frameElement?.getAttribute('data-frame-id')

    if ((e.button === 0 || e.button === 1)) {
        hasDragged.current = false // Reset drag flag
        if (spacePressed || !frameId) {
            // Pan Mode
            setIsDragging(true)
            setDraggingFrameId(null)
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        } else {
            // Frame Drag Mode
            setIsDragging(true)
            setDraggingFrameId(frameId)
            setDragStart({ x: e.clientX, y: e.clientY })
        }
        e.preventDefault() // Prevent default to avoid text selection etc
    }
  }

  // Handle frame click for selection
  const handleFrameClick = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation()
    if (hasDragged.current) return // Ignore click if dragged

    if (selectedFrameId === frameId) {
      onSelectFrame(null) 
    } else {
      onSelectFrame(frameId)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (hasDragged.current) return // Ignore click if dragged

    // If user clicks on canvas background (not on a frame), deselect
    if (e.target === e.currentTarget || e.target === canvasRef.current?.querySelector('.transform-container')) {
      onSelectFrame(null)
    }
    // Close dropdowns if open
    if (isProjectDropdownOpen) setIsProjectDropdownOpen(false)
    if (isExportMenuOpen) setIsExportMenuOpen(false)
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      hasDragged.current = true // Mark as dragged
      
      if (draggingFrameId) {
          const zoomFactor = zoom / 100
          const dx = (e.clientX - dragStart.x) / zoomFactor
          const dy = (e.clientY - dragStart.y) / zoomFactor
          
          setFramePositions(prev => ({
              ...prev,
              [draggingFrameId]: {
                  x: (prev[draggingFrameId]?.x || 0) + dx,
                  y: (prev[draggingFrameId]?.y || 0) + dy
              }
          }))
          setDragStart({ x: e.clientX, y: e.clientY })
      } else {
          setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          })
      }
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggingFrameId(null)
  }

  // Reset view
  const handleResetView = () => {
    setZoom(50)
    setPan({ x: 0, y: 0 })
  }

  // Get cursor style
  const getCursorStyle = () => {
    if (isDragging) return 'grabbing'
    if (spacePressed) return 'grab'
    return 'default'
  }

  // Get display name for a frame
  const getFrameName = (frame: DesignFrame, index: number) => {
    return `Screen ${index + 1}`
  }

  // Get active code for export
  const getExportCode = () => {
    if (frames.length === 0) return ''
    const activeFrame = frames.find(f => f.id === activeExportTab) || frames[0]
    
    let code = activeFrame?.content || ''
    
    // Simple HTML to React transform (mock)
    if (exportLanguage === 'react') {
      // Replace class= with className=
      code = code.replace(/class="/g, 'className="')
      // Replace for= with htmlFor=
      code = code.replace(/for="/g, 'htmlFor="')
      // Comments
      code = `// React Component for ${getFrameName(activeFrame, frames.findIndex(f => f.id === activeFrame.id))}\n\nexport default function Component() {\n  return (\n    <>\n${code.split('\n').map(line => '      ' + line).join('\n')}\n    </>\n  );\n}`
    }
    
    return code
  }

  const handleDownload = () => {
    const code = getExportCode()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `design.${exportLanguage === 'react' ? 'tsx' : 'html'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    
    frames.forEach((frame, index) => {
        let code = frame.content
        const fileName = `${getFrameName(frame, index)}.${exportLanguage === 'react' ? 'tsx' : 'html'}`

        if (exportLanguage === 'react') {
            // Replace class= with className=
            code = code.replace(/class="/g, 'className="')
            // Replace for= with htmlFor=
            code = code.replace(/for="/g, 'htmlFor="')
            // Comments
            code = `// React Component for ${getFrameName(frame, index)}\n\nexport default function Component() {\n  return (\n    <>\n${code.split('\n').map(line => '      ' + line).join('\n')}\n    </>\n  );\n}`
        }
        
        zip.file(fileName, code)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-export.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="flex-1 bg-[#1a1b1e] flex flex-col relative min-w-0 overflow-hidden">
      {/* Toolbar */}
      <div className="h-[74px] bg-[#0a0b0f] border-b border-gray-800 px-4 flex items-center justify-between flex-shrink-0 relative z-10 w-full">
        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          <div className="flex items-center relative">
            <button 
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-800/50 p-1.5 rounded-lg transition-colors group"
            >
              <span className="text-white font-medium text-sm">{currentProject?.name || 'Select Project'}</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`w-full px-4 py-2.5 text-sm transition-colors hover:bg-gray-800 flex items-center justify-between group ${
                      currentProject?.id === project.id ? 'text-white bg-gray-800/50' : 'text-gray-400'
                    }`}
                  >
                    {editingProjectId === project.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim() !== '') {
                               onRenameProject(project.id, editingName)
                            }
                            setEditingProjectId(null)
                          } else if (e.key === 'Escape') {
                            setEditingProjectId(null)
                          }
                          e.stopPropagation()
                        }}
                        onBlur={() => {
                           if (editingName.trim() !== '') {
                              onRenameProject(project.id, editingName)
                           }
                           setEditingProjectId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-b border-blue-500 focus:outline-none text-white w-full mr-2 py-0.5"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          onSelectProject(project)
                          setIsProjectDropdownOpen(false)
                        }}
                        className="flex-1 text-left truncate mr-2 focus:outline-none"
                      >
                        {project.name}
                      </button>
                    )}
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {/* Edit Icon */}
                        {editingProjectId !== project.id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingProjectId(project.id)
                                    setEditingName(project.name)
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all p-1 rounded hover:bg-gray-700"
                                title="Rename Project"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        )}

                        {/* Active Checkmark */}
                        {currentProject?.id === project.id && !editingProjectId && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0061e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                  </div>
                ))}
                <div className="h-px bg-gray-800 my-1"></div>
                <button 
                  onClick={() => {
                    // Check plan limits for creating new project
                    if (user?.tier === 'free' && projects.length >= 1) {
                      setIsPricingModalOpen(true)
                    } else {
                      onCreateProject()
                    }
                    setIsProjectDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center space-x-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>New Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Upgrade Plan Button */}
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Upgrade plan
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Undo/Redo Buttons */}
          <div className="flex items-center space-x-1 mr-2">
             <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${
                canUndo 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14 4 9 9 4"/>
                <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
              </svg>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${
                canRedo 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14 20 9 15 4"/>
                <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
              </svg>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-800 mx-2"></div>


          <div className="flex items-center space-x-2 text-gray-400">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 10))}
              className="hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="relative flex items-center space-x-3">
            <button
              onClick={() => setIsPresentationOpen(true)}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center space-x-2 px-2"
              disabled={frames.length === 0}
            >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                 <circle cx="12" cy="12" r="3"></circle>
               </svg>
               <span>Preview</span>
            </button>

            <button 
              onClick={() => {
                // Check plan limits for export
                if (user?.tier === 'free') {
                  setIsPricingModalOpen(true)
                } else {
                  setIsExportMenuOpen(!isExportMenuOpen)
                }
              }}
              className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Export to code
            </button>

            {isExportMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden p-4">
                {/* Export Code Section */}
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">Export Code</h4>
                  <p className="text-gray-400 text-xs mb-3">Download the code for all components</p>
                  <button 
                    className="w-full bg-[#0061e8] hover:bg-[#0051c8] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => {
                       setIsExportMenuOpen(false)
                       setIsExportModalOpen(true)
                       // Set active tab to first frame if not set
                       if (frames.length > 0 && !activeExportTab) {
                         setActiveExportTab(frames[0].id)
                       }
                    }}
                  >
                    Export Code
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-hidden relative"
        style={{ 
          cursor: getCursorStyle(),
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#1a1b1e'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        <div
          className="transform-container w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging && !draggingFrameId ? 'none' : 'transform 0.1s ease-out',
            // Allow content to overflow the centering container so we can scroll/pan around
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
             className="relative transition-transform duration-300"
             style={{ 
               transform: `scale(${zoom / 100})`,
               transformOrigin: 'center center',
               width: 0, height: 0 // Collapsed container for absolute positioning
             }}
          >
            {frames.length === 0 && (
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-gray-500 text-sm select-none pointer-events-none whitespace-nowrap">
                No designs yet. Start chatting to create one.
              </div>
            )}
            
            {frames.map((frame) => {
              const isSelected = selectedFrameId === frame.id
              const pos = framePositions[frame.id] || { x: 0, y: 0 }
              return (
                <div 
                  key={frame.id}
                  data-frame-id={frame.id}
                  className={`bg-white shadow-2xl transition-shadow duration-300 ease-in-out absolute
                    ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-[#1a1b1e]' : ''}
                  `}
                  style={{ 
                    width: frame.type === 'mobile' ? '375px' : '1280px',
                    height: frame.type === 'mobile' ? '812px' : '800px',
                    borderRadius: frame.type === 'mobile' ? '40px' : '12px',
                    left: pos.x,
                    top: pos.y,
                    // transform: 'translate(-50%, -50%)', // Center the frame on its position? No, top-left is cleaner for layout
                    cursor: spacePressed ? 'grab' : (isDragging && draggingFrameId === frame.id ? 'grabbing' : 'default')
                  }}
                  onMouseDown={(e) => {
                     // Prevent event bubbling if we want to handle specific frame logic here
                     // But we handle it in global handler.
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFrameClick(e, frame.id)
                  }}
                >
                  {/* Frame Label / Selection Tab */}
                  {isSelected && (
                    <div 
                      className="absolute -top-8 left-0 bg-blue-500 text-white px-3 py-1 rounded-t-lg text-xs font-medium flex items-center space-x-2 cursor-pointer shadow-lg z-20"
                      onClick={(e) => handleFrameClick(e, frame.id)}
                    >
                      <span>Editing Mode</span>
                      <span className="opacity-75 border-l border-blue-400 pl-2 ml-1">Click to exit</span>
                    </div>
                  )}

                  {/* Click Overlay for Selection */}
                  {!isSelected && (
                    <div 
                      className="absolute inset-0 z-10 cursor-pointer hover:bg-blue-500/5 transition-colors rounded-[inherit]"
                      title="Click to edit design"
                    />
                  )}

                  {/* Content Layer */}
                  <div className={`w-full h-full overflow-hidden rounded-[inherit] ${!isSelected ? 'pointer-events-none' : ''}`}>
                     <MockupRenderer designHtml={frame.content} locked={frame.locked} />
                  </div>
                </div>
              )
            })}

          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-[#0a0b0f] border-t border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>•</span>
          <span>{frames.length} Frames</span>
          <span>•</span>
          <span>Zoom: {zoom}%</span>
          {spacePressed && (
            <>
              <span>•</span>
              <span className="text-[#0061e8]">Pan Mode</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Scroll: Pan • Ctrl+Scroll: Zoom • Space: Grab</span>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#0061e8]">●</span>
            <span>Connected to Spark AI</span>
          </div>
        </div>
      </div>

      {/* Export Code Modal */}
      {isExportModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
          <div className="w-[900px] h-[600px] bg-[#0a0b0f] rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
              <h2 className="text-white font-semibold text-lg">Export Code</h2>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="bg-[#1a1b1e] border border-gray-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                    <span>{exportLanguage === 'html' ? 'HTML' : 'React'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-32 bg-[#1a1b1e] border border-gray-700 rounded-lg shadow-lg overflow-hidden hidden group-hover:block">
                    <button 
                      onClick={() => setExportLanguage('html')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${exportLanguage === 'html' ? 'text-[#0061e8]' : 'text-white'}`}
                    >
                      HTML
                    </button>
                    <button 
                      onClick={() => setExportLanguage('react')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${exportLanguage === 'react' ? 'text-[#0061e8]' : 'text-white'}`}
                    >
                      React
                    </button>
                  </div>
                </div>
                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-[#1a1b1e] border-b border-gray-800 px-4 flex items-center space-x-1 overflow-x-auto hide-scrollbar h-12 flex-shrink-0">
              {frames.map((frame, index) => (
                <button
                  key={frame.id}
                  onClick={() => setActiveExportTab(frame.id)}
                  className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                    activeExportTab === frame.id || (!activeExportTab && index === 0)
                      ? 'text-white border-[#0061e8] bg-[#0a0b0f]' 
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-[#2c2d31]/50'
                  }`}
                >
                  {getFrameName(frame, index)}.{exportLanguage === 'html' ? 'html' : 'tsx'}
                </button>
              ))}
            </div>

            {/* Code Preview */}
            <div className="flex-1 bg-[#0a0b0f] overflow-auto p-6 font-mono text-sm text-gray-300">
              <pre className="whitespace-pre-wrap break-all">
                {getExportCode()}
              </pre>
            </div>

            {/* Footer */}
            <div className="h-20 border-t border-gray-800 bg-[#1a1b1e] px-6 flex items-center justify-end space-x-4 flex-shrink-0 relative">
              {copySuccess && (
                <div className="absolute -top-12 right-6 bg-[#0a0b0f] border border-gray-700 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-medium flex items-center space-x-2">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                   </svg>
                   <span>Code copied</span>
                </div>
              )}
              <button 
                className="px-4 py-2.5 text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                onClick={() => {
                  const code = getExportCode()
                  navigator.clipboard.writeText(code)
                  setCopySuccess(true)
                  setTimeout(() => setCopySuccess(false), 2000)
                }}
              >
                Copy Code
              </button>
              <button 
                onClick={handleDownload}
                className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download</span>
              </button>

              <button 
                onClick={handleDownloadAll}
                className="bg-[#0061e8] hover:bg-[#0051c8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>Download Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Mode */}
      {isPresentationOpen && (
        <PresentationMode 
          frames={frames}
          initialFrameIndex={selectedFrameId ? frames.findIndex(f => f.id === selectedFrameId) : 0}
          onClose={() => {
            // On mobile with force mode, keep it open (user should switch tabs instead)
            if (!forcePresentationMode) {
              setIsPresentationOpen(false)
            }
          }}
          deviceMode={deviceMode}
          hidePresentationButton={forcePresentationMode}
        />
      )}

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  )
}
