import type { Metadata } from 'next'
import './globals.css'
import FeaturebaseMessenger from '@/components/FeaturebaseMessenger'

export const metadata: Metadata = {
  title: 'Spark Design - Design Apps and Software in Seconds',
  description: 'Go from idea to beautiful mockups in seconds by chatting with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-website-id="dfid_iS17RGPbPwgsQfWf8foqj"
          data-domain="www.sparkuiapp.com"
          src="https://datafa.st/js/script.js"
        />
      </head>
      <body>
        {children}
        <FeaturebaseMessenger />
      </body>
    </html>
  )
}

