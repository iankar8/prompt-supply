import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
// import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Prompt.Supply - Organize, Template & Manage Your AI Prompts',
  description: 'The ultimate tool for AI prompt management. Create reusable templates, organize with folders, and maintain consistent AI interactions.',
  keywords: ['AI prompts', 'prompt management', 'AI templates', 'prompt organization'],
  authors: [{ name: 'Prompt.Supply' }],
  creator: 'Prompt.Supply',
  publisher: 'Prompt.Supply',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          {/* <Toaster /> */}
        </Providers>
      </body>
    </html>
  )
}
