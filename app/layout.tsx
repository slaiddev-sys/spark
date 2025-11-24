import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spark Design - Design Apps and Software in Minutes',
  description: 'Go from idea to beautiful mockups in minutes by chatting with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

