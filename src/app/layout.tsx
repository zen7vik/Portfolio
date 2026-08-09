import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'
import SceneCanvas from '@/components/scene/SceneCanvas'
import SmoothScroll from '@/components/providers/SmoothScroll'
import HotkeyMount from '@/components/terminal/HotkeyMount'
import CustomCursor from '@/components/ui/CustomCursor'
import Grain from '@/components/ui/Grain'
import { getAllCases } from '@/lib/content'
import { site } from '@/lib/site'
import '@/styles/globals.css'

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display-face',
})
const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-body-face' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono-face' })

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.title,
    description: site.description,
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const cases = getAllCases().map((c) => ({ slug: c.slug, title: c.title }))

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <SceneCanvas />
        <SmoothScroll>
          <div id="page-root" className="relative z-10">
            {children}
          </div>
        </SmoothScroll>
        <Grain />
        <CustomCursor />
        <HotkeyMount cases={cases} />
      </body>
    </html>
  )
}
