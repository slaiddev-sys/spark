import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('Missing GOOGLE_GEMINI_API_KEY environment variable')
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

// Load training/reference designs from the training-designs folder
export const loadTrainingDesigns = (): { name: string; data: string; mimeType: string }[] => {
  try {
    const trainingDir = path.join(process.cwd(), 'training-designs')
    
    // Check if directory exists
    if (!fs.existsSync(trainingDir)) {
      console.log('No training-designs folder found. Skipping training images.')
      return []
    }

    const files = fs.readdirSync(trainingDir)
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg|webp)$/i.test(file) && file !== '.gitkeep'
    )

    if (imageFiles.length === 0) {
      console.log('No training images found in training-designs folder.')
      return []
    }

    const trainingImages = imageFiles.map(file => {
      const filePath = path.join(trainingDir, file)
      const imageBuffer = fs.readFileSync(filePath)
      const base64Data = imageBuffer.toString('base64')
      
      // Determine MIME type
      const ext = path.extname(file).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : 
                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                       'image/webp'

      return {
        name: file,
        data: base64Data,
        mimeType
      }
    })

    console.log(`✅ Loaded ${trainingImages.length} training design(s): ${imageFiles.join(', ')}`)
    return trainingImages
  } catch (error) {
    console.error('Error loading training designs:', error)
    return []
  }
}

// Get Gemini model for reasoning and UI generation
// Using Gemini 3 Pro Preview as requested (confirmed available)
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-3-pro-preview',
    generationConfig: {
      temperature: 1.0,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 64000, // High token limit for reasoning
    },
  })
}

// Fallback model if primary is unavailable
// Using Gemini 2.0 Flash Thinking as reliable fallback
export const getFallbackModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-thinking-exp-01-21',
    generationConfig: {
      temperature: 1.0,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 64000,
    },
  })
}

// System prompt for UI generation
export const UI_GENERATION_PROMPT = (hasTrainingDesigns: boolean, deviceMode: 'mobile' | 'desktop', currentDesignContext: string | null, userTier: string = 'free') => `You are Spark AI, an expert UI/UX designer and developer. Your role is to help users create beautiful, modern, and functional user interfaces for apps and software.

${hasTrainingDesigns ? `
**CRITICAL: You have been provided with reference design images that represent HIGH-QUALITY UI examples.**

When generating designs, you MUST:
1. **Study the reference images in EXTREME detail:**
   - Extract EXACT color schemes (hex codes)
   - Identify typography choices and font weights
   - Note spacing, padding, margins, border radius
   - Observe layout patterns, card designs, button styles
   - Analyze visual hierarchy and component arrangements
   
2. **Replicate the design quality and style:**
   - Match the color palettes from the references
   - Use similar component designs (cards, buttons, icons)
   - Apply the same level of polish and modern aesthetics
   - Recreate the visual hierarchy and spacing patterns
   
3. **The references are your BLUEPRINT for quality**

` : ''}

    **RESPONSE FORMAT - CRITICAL:**

    1. **IF EDITING (Context Provided):**
       - Respond with EXACTLY ONE \`\`\`html code block.
       - Modify the provided code.

    2. **IF CREATING NEW (No Context):**
       - You MUST generate a **COMPLETE APP FLOW** (${userTier === 'free' ? '3 screens' : '6 screens'}) for vague or high-level requests (e.g., "Create a travel app").
       - ${userTier === 'free' ? 'Include key screens like: Onboarding/Login, Home Dashboard, and Details/Settings.' : 'Include comprehensive screens like: Splash/Onboarding, Login, Home Dashboard, Feature Screen 1, Feature Screen 2, and Profile/Settings.'}
       - Output them as separate \`\`\`html code blocks, one after another.
       - Start IMMEDIATELY with the first \`\`\`html block.

    **FORMAT (MANDATORY):**
    \`\`\`html
    <!-- Screen: Login -->
    <!DOCTYPE html>
    ...
    \`\`\`
    
    \`\`\`html
    <!-- Screen: Home -->
    <!DOCTYPE html>
    ...
    \`\`\`

    **RULES:**
    1. Start with \`\`\`html
    2. Use multiple code blocks for multiple screens
    3. MAKE IT RESPONSIVE: Works on both Mobile (375px) and Desktop (1280px)
    4. Use modern CSS: gradients, shadows, border-radius, blur effects
    5. Include realistic content
    6. Match colors, spacing, and style from reference images
    7. End each block with \`\`\`
    8. NO text outside the code blocks


**IMAGES - CRITICAL:**
For images, use ONLY these options:
1. **CSS gradients** (preferred) - like: background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
2. **Unsplash placeholder** - use this format: https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80
3. **Emoji** - like: 🏖️, 🏔️, 🏙️, 🌅, ✈️
4. **Solid Colors** - use hex codes from the reference images
5. NEVER use placeholder.com, via.placeholder.com, or broken URLs
6. NEVER use relative paths like ./images/ or ../assets/

**RELIABLE UNSPLASH IDS (Use these if unsure):**
- Abstract: photo-1550684848-fac1c5b4e853
- Tech: photo-1519389950473-47ba0277781c
- Nature: photo-1470071459604-3b5ec3a7fe05
- People: photo-1438761681033-6461ffad8d80
- Food: photo-1546069901-ba9599a7e63c

If reference images are provided, your HTML MUST closely match their style, colors, layouts, and overall aesthetic quality.

**CURRENT CONTEXT:**
The user has currently selected the **${deviceMode}** mode for generation. Please prioritize designing for this viewport, while ensuring responsiveness.
${currentDesignContext ? `
**USER IS EDITING THE FOLLOWING DESIGN:**
\`\`\`html
${currentDesignContext}
\`\`\`
Your task is to apply the user's new request to this existing HTML code.
- MODIFY the existing code to implement the requested changes.
- MAINTAIN the rest of the design that was not asked to be changed.
- RETURN the fully updated HTML code.
` : ''}
`

export async function generateUIWithGeminiStream(
  userPrompt: string, 
  conversationHistory: { role: string; content: string; image?: string }[] = [],
  image?: string,
  deviceMode: 'mobile' | 'desktop' = 'mobile',
  currentDesignContext: string | null = null,
  userTier: string = 'free'
) {
  try {
    const model = getGeminiModel()
    
    // Load training designs
    const trainingDesigns = loadTrainingDesigns()
    
    // Build the conversation history
    const history = conversationHistory.map(msg => {
      const parts: any[] = [{ text: msg.content }]
      
      // Add image if present in history
      if (msg.image) {
        const base64Data = msg.image.split(',')[1]
        const mimeType = msg.image.split(';')[0].split(':')[1]
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        })
      }
      
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts
      }
    })

    // Prepare system prompt parts with training designs
    const systemPromptParts: any[] = [{ text: UI_GENERATION_PROMPT(trainingDesigns.length > 0, deviceMode, currentDesignContext, userTier) }]
    
    // Add training design images to the system prompt
    if (trainingDesigns.length > 0) {
      trainingDesigns.forEach(design => {
        systemPromptParts.push({
          inlineData: {
            data: design.data,
            mimeType: design.mimeType
          }
        })
      })
    }

    // Start a chat session with history
    let chat
    try {
      chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: systemPromptParts
          },
          {
            role: 'model',
            parts: [{ text: trainingDesigns.length > 0 
              ? `Understood! I've analyzed ${trainingDesigns.length} reference design(s). I will generate HTML code that matches their exact style, colors, layouts, and quality. Ready to create beautiful designs!`
              : 'Understood! I will generate HTML code for beautiful, modern UI designs. Ready to create!' }]
          },
          ...history
        ]
      })
    } catch (error: any) {
      console.error('Error initializing chat with Gemini 3:', error)
      // If Gemini 3 fails, try fallback
      console.log('Attempting fallback to Gemini 1.5 Pro...')
      const fallbackModel = getFallbackModel()
      chat = fallbackModel.startChat({
        history: [
          {
            role: 'user',
            parts: systemPromptParts
          },
          {
            role: 'model',
            parts: [{ text: trainingDesigns.length > 0 
              ? `Understood! I've analyzed ${trainingDesigns.length} reference design(s). I will generate HTML code that matches their exact style, colors, layouts, and quality. Ready to create beautiful designs!`
              : 'Understood! I will generate HTML code for beautiful, modern UI designs. Ready to create!' }]
          },
          ...history
        ]
      })
    }

    // Prepare the message parts
    let systemInstruction = deviceMode === 'desktop' 
      ? "IMPORTANT: The user wants a DESKTOP application design (1280px+ width). Create a wide layout with sidebars, headers, and data tables appropriate for a large screen."
      : "IMPORTANT: The user wants a MOBILE app design (375px width). Create a narrow, touch-friendly layout suitable for a phone screen.";

    if (currentDesignContext) {
        systemInstruction += "\n\n**IMPORTANT: The user is EDITING the currently selected design. Apply changes to the provided HTML code.**";
    }
      
    const messageParts: any[] = [{ text: systemInstruction + "\n\n" + userPrompt }]
    
    // Add image if present
    if (image) {
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      messageParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      })
    }

    // Send stream request
    let result
    try {
      result = await chat.sendMessageStream(messageParts)
    } catch (error: any) {
       console.error('Error sending message stream:', error)
       
       // Check for various error conditions to trigger fallback
       const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded') || error.status === 503;
       const isNotFound = error.message?.includes('404') || error.message?.includes('not found');
       const isExhausted = error.message?.includes('Resource has been exhausted') || error.status === 429;

       if (!chat || isNotFound || isExhausted || isOverloaded) {
          console.log(`Attempting fallback to Gemini 1.5 Pro due to error: ${error.message}`)
          const fallbackModel = getFallbackModel()
          const fallbackChat = fallbackModel.startChat({
            history: [
              {
                role: 'user',
                parts: systemPromptParts
              },
              {
                role: 'model',
                parts: [{ text: 'Understood! I will generate HTML code for beautiful, modern UI designs. Ready to create!' }]
              },
              ...history
            ]
          })
          result = await fallbackChat.sendMessageStream(messageParts)
       } else {
         throw error
       }
    }
    
    return result // Return the full result object, not just result.stream
  } catch (error) {
    console.error('Error generating UI with Gemini:', error)
    throw error
  }
}

// Keep the non-streaming function for backward compatibility or server-side only tasks if needed
// (Though we might replace it fully)
export async function generateUIWithGemini(
  userPrompt: string, 
  conversationHistory: { role: string; content: string; image?: string }[] = [],
  image?: string,
  deviceMode: 'mobile' | 'desktop' = 'mobile',
  currentDesignContext: string | null = null,
  userTier: string = 'free'
) {
  try {
    const stream = await generateUIWithGeminiStream(userPrompt, conversationHistory, image, deviceMode, currentDesignContext, userTier)
    let text = ''
    for await (const chunk of stream) {
      const chunkText = chunk.text()
      text += chunkText
    }
    return {
      success: true,
      response: text,
      thinking: null // Reasoning not available in simple stream aggregation here, but standard stream has it
    }
  } catch (error) {
    console.error('Error generating UI with Gemini:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
