# Gemini AI Integration Setup Guide

This guide will help you set up Google Gemini AI with Nuvix for AI-powered UI generation.

## Prerequisites

- A Google Cloud account
- Access to Google AI Studio

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API Key" or "Create API Key"
4. Copy your API key

## Step 2: Add API Key to Environment Variables

1. Open or create the `.env.local` file in your project root
2. Add the following line with your actual API key:

```bash
# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**IMPORTANT**: Make sure your `.env.local` file already has your Supabase credentials. The complete file should look like:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mgvyazwurtzbeajpuwsv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Step 3: Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 4: Test the Integration

1. Navigate to `/editor` in your browser
2. Try sending a message like:
   - "Create a health tracking dashboard"
   - "Design a weather app"
   - "Build a task manager interface"

3. Nuvix AI (powered by Gemini 2.0 Flash with Thinking) will:
   - Analyze your request with deep reasoning
   - Provide detailed UI design suggestions
   - Guide you through creating beautiful interfaces

## Features

### Gemini 2.0 Flash with Thinking
- **Advanced Reasoning**: Uses Gemini's thinking mode for better design decisions
- **Context-Aware**: Maintains conversation history for iterative design
- **Professional Guidance**: Acts as your AI UI/UX design partner

### Canvas Mode
- Pan and zoom the canvas like Figma
- Dotted grid background for visual reference
- Export designs when ready

## Troubleshooting

### Error: "Missing GOOGLE_GEMINI_API_KEY"
- Make sure you've added the API key to `.env.local`
- Restart your development server after adding the key
- Check that there are no typos in the variable name

### Error: "Failed to get response from AI"
- Verify your API key is valid
- Check that you have API quota remaining in Google AI Studio
- Ensure you have internet connectivity

### No Response from AI
- Open browser console (F12) to check for errors
- Verify the API key is correctly formatted
- Make sure there are no spaces before/after the key in `.env.local`

## Model Information

We're using **Gemini 3 Pro Preview** (`gemini-3-pro-preview`) which provides:
- 1 million input tokens / 64,000 output tokens context window
- Enhanced reasoning and multimodal capabilities
- Advanced UI/UX design understanding
- Temperature: 1.0 (highly creative)
- Context-aware design suggestions
- The most advanced Gemini model available

## Next Steps

Once Gemini is integrated, you can:
1. Start designing apps through natural conversation
2. Get instant feedback on your UI ideas
3. Iterate on designs with AI guidance
4. Export your final mockups

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Keep your API key private
- Monitor your API usage in Google AI Studio
- Consider setting usage limits to control costs

---

For more information:
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)

