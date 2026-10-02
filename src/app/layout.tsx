import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Mona_Sans } from 'next/font/google'
import SmoothScroll from '@/components/providers/SmoothScroll'
import HotkeyMount from '@/components/terminal/HotkeyMount'
import { getAllCases } from '@/lib/content'
import { site } from '@/lib/site'
import '@/styles/globals.css'

const sans = Mona_Sans({ subsets: ['latin'], axes: ['wdth'], variable: '--font-sans-face' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono-face' })

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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0d' },
  ],
}

// runs before paint so the stored or system theme never flashes
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const cases = getAllCases().map((c) => ({ slug: c.slug, title: c.title }))

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <HotkeyMount cases={cases} />
      </body>
    </html>
  )
}
