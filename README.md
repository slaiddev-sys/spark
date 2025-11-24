# Nuvix Design

An AI-powered UI design generation tool built with Next.js. Design beautiful apps and software in minutes by chatting with AI.

## Features

- 🎨 AI-powered UI generation
- ⚡ Lightning-fast design creation
- 🎯 Multiple design styles (Neo-Brutalism, Glassmorphism, Swiss Style, etc.)
- 🌙 Beautiful dark-themed interface
- 📱 Fully responsive design

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom React components

## Project Structure

```
nuvix/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Navigation bar
│   ├── Hero.tsx            # Hero section with input
│   └── ExampleCards.tsx    # Example design cards
├── public/                 # Static assets
└── package.json
```

## Customization

You can customize the colors in `tailwind.config.ts`:

```typescript
colors: {
  'nuvix-blue': '#4169FF',
  'nuvix-dark': '#0A0B0F',
  'nuvix-card': '#1A1D29',
}
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

