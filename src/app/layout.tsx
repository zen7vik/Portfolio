import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import SceneCanvas from '@/components/scene/SceneCanvas'
import SmoothScroll from '@/components/providers/SmoothScroll'
import { site } from '@/lib/site'
import '@/styles/globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const body = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  metadataBase: new URL('https://satvik.vercel.app'),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <SceneCanvas />
        <SmoothScroll>
          <div id="page-root" className="relative z-10">
            {children}
          </div>
        </SmoothScroll>
      </body>
    </html>
  )
}
