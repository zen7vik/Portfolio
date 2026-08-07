# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Satvik's portfolio — a WebGL morphing-particle showpiece landing page + four deep-dive case-study pages with GSAP scrollytelling, Medium blog section, terminal/⌘K layer — deployed on Vercel.

**Architecture:** Next.js App Router with one persistent React Three Fiber `<Canvas>` in the root layout (particles survive navigation). A tiny module-level scene store maps route/section → particle formation; GSAP tweens shader uniforms. Content is MDX per case study; Medium posts come from RSS at build time with a committed fallback. All animation state lives in refs/uniforms, never React state.

**Tech Stack:** Next.js 15 (TypeScript), three + @react-three/fiber + @react-three/drei, GSAP + ScrollTrigger, Lenis, Tailwind CSS v4, MDX (next-mdx-remote), fast-xml-parser, Vitest, Playwright.

## Global Constraints

- Repo root: `/Users/zen7vik/Developer/portfolio`. This repo has local `commit.gpgsign=false`; never re-enable in-plan.
- Dark theme only. Palette: bg `#0a0a0f`, text `#e8e8ea`, muted `#8a8a95`, accent indigo `#7c8cff`, accent green `#58c48f`. These exact hexes everywhere.
- Fonts via `next/font/google`: Space Grotesk (display), Inter (body), JetBrains Mono (mono/terminal).
- Links (exact): GitHub `https://github.com/zen7vik`, Medium `https://medium.com/@satvik19nitm`, LinkedIn `https://www.linkedin.com/in/satvik-singh-3989a51b5/`, email `satvik19nitm@gmail.com`.
- Stats (exact copy): `500M events/mo`, `p99 585ms`, `6 regions`, `147K workflows/mo`.
- Case slugs (exact): `workflow-platform`, `risk-engine`, `rag-pipeline`, `data-exchange`.
- `prefers-reduced-motion`: particles render one static formation (no drift, no pointer force), scroll animations become simple fades.
- No WebGL → `StaticHero` gradient fallback; page fully usable.
- Every visual task ends with a real browser check (`npm run dev`, look at it) before commit — user preference: never claim visuals done unseen.
- Commit messages: conventional commits, end body with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- No em/en dashes in any user-visible site copy; use commas, colons, or split sentences.

---

### Task 1: Scaffold app, theme, fonts, constants, resume

**Files:**
- Create: Next app via scaffold (package.json, tsconfig.json, next.config.ts, postcss.config.mjs)
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/globals.css`
- Create: `src/lib/site.ts`
- Create: `public/resume.pdf` (copy of `~/resume/Satvik_Singh_Resume.pdf`)
- Create: `.claude/skills/` (cloned GSAP + web-animation skills)

**Interfaces:**
- Produces: `site` constant object consumed by every section/component:

```ts
// src/lib/site.ts
export const site = {
  name: 'Satvik Singh',
  title: 'Satvik Singh, Backend Engineer',
  tagline: "Backend engineer. I build distributed systems that don't fall over.",
  description:
    'Go microservices, distributed systems, and the platforms behind them: risk scoring at 500M events/month, workflow automation at 147K runs/month.',
  email: 'satvik19nitm@gmail.com',
  github: 'https://github.com/zen7vik',
  medium: 'https://medium.com/@satvik19nitm',
  mediumFeed: 'https://medium.com/feed/@satvik19nitm',
  linkedin: 'https://www.linkedin.com/in/satvik-singh-3989a51b5/',
  resumePath: '/resume.pdf',
  stats: [
    { value: '500M', label: 'events/mo through my scoring engine' },
    { value: 'p99 585ms', label: 'risk evaluations at scale' },
    { value: '6', label: 'production regions' },
    { value: '147K', label: 'workflows/mo on my platform' },
  ],
} as const
export type Site = typeof site
```

- [ ] **Step 1: Scaffold Next.js in the existing repo**

```bash
cd /Users/zen7vik/Developer/portfolio
npx create-next-app@latest . --ts --app --tailwind --src-dir --import-alias "@/*" --no-eslint --use-npm --yes
```

(create-next-app tolerates existing `.git`, `docs/`, `.gitignore`. If it refuses because the dir is non-empty, scaffold in `/private/tmp/claude-501/-Users-zen7vik-Developer/9c0ca86a-7811-41a6-89f6-ebc6577c67d8/scratchpad/scaffold` and `rsync -a --ignore-existing` the result in.)

- [ ] **Step 2: Install runtime + dev deps**

```bash
npm i three @react-three/fiber @react-three/drei gsap lenis next-mdx-remote gray-matter fast-xml-parser
npm i -D @types/three vitest @vitejs/plugin-react playwright @playwright/test
```

- [ ] **Step 3: Install animation skills into the repo**

```bash
mkdir -p .claude/skills && cd .claude/skills
git clone --depth 1 https://github.com/greensock/gsap-skills gsap-skills
git clone --depth 1 https://github.com/iart-ai/web-animation-skills web-animation-skills
rm -rf gsap-skills/.git web-animation-skills/.git
cd ../..
```

- [ ] **Step 4: Theme + fonts.** Replace `src/app/globals.css` (move to `src/styles/globals.css`, update import) with Tailwind v4 theme tokens:

```css
@import 'tailwindcss';

@theme {
  --color-bg: #0a0a0f;
  --color-fg: #e8e8ea;
  --color-muted: #8a8a95;
  --color-indigo: #7c8cff;
  --color-green: #58c48f;
  --font-display: var(--font-space-grotesk);
  --font-body: var(--font-inter);
  --font-mono: var(--font-jetbrains);
}

html { background: #0a0a0f; color: #e8e8ea; }
body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
::selection { background: #7c8cff; color: #0a0a0f; }
```

`src/app/layout.tsx`: load fonts with `next/font/google` (`Space_Grotesk`, `Inter`, `JetBrains_Mono`) exposing the CSS variables above; metadata from `site`; body renders `{children}` only (scene/providers added in later tasks).

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Create `src/lib/site.ts`** with the exact object from Interfaces above. Copy resume: `cp ~/resume/Satvik_Singh_Resume.pdf public/resume.pdf`.

- [ ] **Step 6: Placeholder landing page** (`src/app/page.tsx`) rendering name + tagline with the fonts, so the theme is visible:

```tsx
import { site } from '@/lib/site'
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold tracking-tight">{site.name}</h1>
        <p className="mt-4 text-muted">{site.tagline}</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 7: Verify** `npm run build` passes and `npm run dev` renders the dark page with correct fonts (browser check).

- [ ] **Step 8: Commit** `feat: scaffold Next.js app with theme, fonts, site constants`

---

### Task 2: Medium RSS lib (TDD)

**Files:**
- Create: `src/lib/medium.ts`, `src/content/writing-fallback.json`
- Test: `tests/unit/medium.test.ts`, `tests/fixtures/medium-feed.xml`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `type Post = { title: string; url: string; publishedAt: string; readingMinutes: number }`, `parseMediumFeed(xml: string): Post[]`, `getPosts(): Promise<Post[]>` (fetches feed, falls back to `writing-fallback.json` on any error; never throws).

- [ ] **Step 1: vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts?(x)'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

Add `"test": "vitest run"` to package.json scripts.

- [ ] **Step 2: Fixture.** `tests/fixtures/medium-feed.xml`: a minimal real-shaped Medium RSS doc with 2 `<item>`s, each having `<title>`, `<link>`, `<pubDate>`, and `<content:encoded>` with ~600 words of lorem HTML (for reading-time calc).

- [ ] **Step 3: Failing test**

```ts
// tests/unit/medium.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMediumFeed } from '@/lib/medium'

const xml = readFileSync('tests/fixtures/medium-feed.xml', 'utf8')

describe('parseMediumFeed', () => {
  it('extracts posts with title, url, date, reading time', () => {
    const posts = parseMediumFeed(xml)
    expect(posts).toHaveLength(2)
    expect(posts[0].title).toBe('First Post Title')
    expect(posts[0].url).toMatch(/^https:\/\/medium\.com/)
    expect(new Date(posts[0].publishedAt).getFullYear()).toBeGreaterThan(2020)
    expect(posts[0].readingMinutes).toBeGreaterThanOrEqual(1)
  })
  it('returns [] on garbage input', () => {
    expect(parseMediumFeed('<not-rss/>')).toEqual([])
  })
})
```

- [ ] **Step 4: Run** `npm test` — expect FAIL (module not found).

- [ ] **Step 5: Implement**

```ts
// src/lib/medium.ts
import { XMLParser } from 'fast-xml-parser'
import fallback from '@/content/writing-fallback.json'
import { site } from '@/lib/site'

export type Post = { title: string; url: string; publishedAt: string; readingMinutes: number }

export function parseMediumFeed(xml: string): Post[] {
  try {
    const doc = new XMLParser({ ignoreAttributes: false }).parse(xml)
    const items = doc?.rss?.channel?.item
    const list = Array.isArray(items) ? items : items ? [items] : []
    return list.map((it: Record<string, unknown>) => {
      const html = String(it['content:encoded'] ?? '')
      const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
      return {
        title: String(it.title ?? ''),
        url: String(it.link ?? '').split('?')[0],
        publishedAt: new Date(String(it.pubDate ?? '')).toISOString(),
        readingMinutes: Math.max(1, Math.round(words / 200)),
      }
    }).filter((p) => p.title && p.url)
  } catch {
    return []
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(site.mediumFeed, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(String(res.status))
    const posts = parseMediumFeed(await res.text())
    return posts.length ? posts : (fallback as Post[])
  } catch {
    return fallback as Post[]
  }
}
```

`src/content/writing-fallback.json`: `[]` initially; after first successful live fetch during development, paste the real posts in so builds never regress to empty.

- [ ] **Step 6: Run** `npm test` — expect PASS.
- [ ] **Step 7: Commit** `feat: medium rss parsing with fallback`

---

### Task 3: Case-study content model + MDX files (TDD for loader)

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/content/work/workflow-platform.mdx`, `risk-engine.mdx`, `rag-pipeline.mdx`, `data-exchange.mdx`
- Create: `src/content/misc.ts`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces:

```ts
export type CaseMeta = {
  slug: string; title: string; hook: string; role: string; period: string
  accent: 'indigo' | 'green'
  stats: { value: string; label: string }[]
  summary: string // 1-2 sentence card copy
  order: number
}
export function getAllCases(): CaseMeta[]              // sorted by order
export function getCase(slug: string): { meta: CaseMeta; body: string } // body = raw MDX after frontmatter
```

- `src/content/misc.ts` exports `miscItems: { title: string; blurb: string; tags: string[] }[]`.

- [ ] **Step 1: Failing test**

```ts
// tests/unit/content.test.ts
import { describe, expect, it } from 'vitest'
import { getAllCases, getCase } from '@/lib/content'

describe('content', () => {
  it('loads all four case studies in order', () => {
    expect(getAllCases().map((c) => c.slug)).toEqual([
      'workflow-platform', 'risk-engine', 'rag-pipeline', 'data-exchange',
    ])
  })
  it('every case has hook, stats, summary', () => {
    for (const c of getAllCases()) {
      expect(c.hook.length).toBeGreaterThan(10)
      expect(c.stats.length).toBeGreaterThanOrEqual(2)
      expect(c.summary.length).toBeGreaterThan(20)
    }
  })
  it('getCase returns MDX body', () => {
    expect(getCase('workflow-platform').body).toContain('## The problem')
  })
})
```

- [ ] **Step 2: Run** `npm test` — FAIL.

- [ ] **Step 3: Implement loader**

```ts
// src/lib/content.ts
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const DIR = path.join(process.cwd(), 'src/content/work')

export type CaseMeta = {
  slug: string; title: string; hook: string; role: string; period: string
  accent: 'indigo' | 'green'
  stats: { value: string; label: string }[]
  summary: string
  order: number
}

export function getAllCases(): CaseMeta[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const { data } = matter(readFileSync(path.join(DIR, f), 'utf8'))
      return { ...(data as Omit<CaseMeta, 'slug'>), slug: f.replace(/\.mdx$/, '') }
    })
    .sort((a, b) => a.order - b.order)
}

export function getCase(slug: string) {
  const { data, content } = matter(readFileSync(path.join(DIR, `${slug}.mdx`), 'utf8'))
  return { meta: { ...(data as Omit<CaseMeta, 'slug'>), slug }, body: content }
}
```

- [ ] **Step 4: Write the four MDX files with real copy.** Source facts from `~/resume/Satvik_Singh_Resume.md`, `~/resume/DEEP_DIVE.md`, and the S0-87619 workflow-epic details. Shared section skeleton (H2s must be exactly): `## The problem`, `## The system` (contains the `<Scrolly/>` placeholder comment for Task 10), `## Key decisions`, `## Outcomes`, `## What I'd do differently`. Frontmatter per file:

  - `workflow-platform.mdx` (order 1, accent indigo, richest, ~700 words): title "An extensible workflow automation platform"; hook "Turning a fixed workflow tool into a platform any API can plug into"; stats: 147K workflows/mo, 29-story epic shipped, SSRF-hardened egress. Body covers: node system + backend-driven node contract (UI declared by backend); the generic HTTP integration node end to end: credentials vault (envelope encryption, per-field decrypt), DNS-pinned SSRF dialer + exact-host allowlists, response classification (halt vs branch semantics), the builder test panel running the identical hardened path; execution insights (event-driven metrics behind a feature flag).
  - `risk-engine.mdx` (order 2, accent green): 500M events/mo, 6 regions, p99 585ms, 1.16M evals/mo; the 3-week reliability push: 10 memory + 14 CPU incidents resolved, retention fix, indexing, cache-TTL redesign, load-shedding kill switch, self-healing regeneration job; P0 APIs under 1s P95.
  - `rag-pipeline.mdx` (order 3, accent indigo): evidence upload → malware scan → chunk/embed → OpenSearch Serverless hybrid search → LLM questionnaire auto-answering via multi-provider gateway (GPT-4o/4.1, Claude on Bedrock); plus questionnaire AI review.
  - `data-exchange.mdx` (order 4, accent green): cross-tenant exchange from scratch: STS cross-account, single-table NoSQL cost design, event-driven multi-region, zero error-budget breaches in 90 days.

- [ ] **Step 5: `src/content/misc.ts`** with 5 items: Questionnaire AI review (LLM-assisted review of vendor answers), graphify (knowledge-graph codebase tooling adopted across repos), httpserver hardening (shared Go lib: graceful shutdown + timeouts, fleet pilot), on-call triage stack (incident tooling + daily alert summaries), InvestIQ (AI trading platform: XGBoost ensemble, FinBERT, HRP, Upstox engine).

- [ ] **Step 6: Run** `npm test` — PASS. **Step 7: Commit** `feat: case study content model and copy`

---

### Task 4: Smooth scroll + micro-interaction primitives

**Files:**
- Create: `src/components/providers/SmoothScroll.tsx`
- Create: `src/components/ui/Reveal.tsx`, `src/components/ui/MagneticButton.tsx`, `src/components/ui/SectionHeading.tsx`
- Modify: `src/app/layout.tsx` (wrap children in SmoothScroll)

**Interfaces:**
- Produces: `<SmoothScroll>` (client component: Lenis instance driven by GSAP ticker, syncs ScrollTrigger); `<Reveal as?="div" delay?>` (children slide+fade in on scroll enter, honors reduced motion); `<MagneticButton href>` (anchor that eases toward cursor within 24px, springs back); `<SectionHeading eyebrow title>`.

- [ ] **Step 1: SmoothScroll** (the canonical Lenis+GSAP wiring — consult `.claude/skills/gsap-skills` for current ScrollTrigger patterns):

```tsx
'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.12 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 2: Reveal + MagneticButton + SectionHeading.** Reveal uses gsap `fromTo(y: 24, autoAlpha: 0 → 1)` with `ScrollTrigger { trigger: el, start: 'top 85%' }`; reduced-motion renders children directly. MagneticButton tracks `mousemove` in a `ref`, `gsap.to(el, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power3.out' })`, resets on leave; styles: mono uppercase text, 1px border `#7c8cff`, rounded-full, hover fills indigo with `#0a0a0f` text.

- [ ] **Step 3: Verify in browser** (temporary usage on the placeholder page is fine), then remove temp usage.
- [ ] **Step 4: Commit** `feat: lenis smooth scroll and micro-interaction primitives`

---

### Task 5: Particle formations (TDD)

**Files:**
- Create: `src/components/scene/formations.ts`
- Test: `tests/unit/formations.test.ts`

**Interfaces:**
- Produces (all return `Float32Array` of length `count * 3`, world units roughly within [-6, 6]):

```ts
export const FORMATIONS = ['name', 'ambient', 'sphere', 'lattice', 'vortex'] as const
export type Formation = (typeof FORMATIONS)[number]
export function sampleText(text: string, count: number): Float32Array // canvas-sampled glyph points, z jitter ±0.15
export function ambient(count: number): Float32Array   // box-uniform cloud
export function sphere(count: number): Float32Array    // fibonacci sphere r=2.6
export function lattice(count: number): Float32Array   // 3D grid with jitter
export function vortex(count: number): Float32Array    // logarithmic spiral disk
export function getFormation(name: Formation, count: number): Float32Array // 'name' → sampleText('SATVIK', …)
```

- [ ] **Step 1: Failing test** (node-canvas isn't available: in tests, `sampleText` must accept an injected sampler; see impl note)

```ts
// tests/unit/formations.test.ts
import { describe, expect, it } from 'vitest'
import { ambient, sphere, lattice, vortex } from '@/components/scene/formations'

const COUNT = 4096
describe.each([['ambient', ambient], ['sphere', sphere], ['lattice', lattice], ['vortex', vortex]] as const)(
  '%s formation', (_name, fn) => {
    const arr = fn(COUNT)
    it('has count*3 finite values', () => {
      expect(arr.length).toBe(COUNT * 3)
      expect([...arr].every(Number.isFinite)).toBe(true)
    })
    it('stays within bounds', () => {
      expect(Math.max(...arr.map(Math.abs))).toBeLessThanOrEqual(6)
    })
  },
)
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** Pure math for the four; `sampleText` draws bold `Space Grotesk`-fallback text to an offscreen 2D canvas (only called in browser), reads `getImageData`, collects pixel coords with alpha > 128, maps to x∈[-4.5,4.5] preserving aspect, random-picks `count` of them (repeat if fewer), z = (Math.random()-0.5)*0.3. Deterministic seeding not required. **Step 4: Run** — PASS. **Step 5: Commit** `feat: particle formation generators`

---

### Task 6: Scene store + persistent particle canvas

**Files:**
- Create: `src/components/scene/sceneStore.ts`, `src/components/scene/SceneCanvas.tsx`, `src/components/scene/Particles.tsx`, `src/components/scene/StaticHero.tsx`
- Modify: `src/app/layout.tsx` (mount `<SceneCanvas/>` behind content), `src/app/page.tsx` (transparent sections)

**Interfaces:**
- Produces:

```ts
// sceneStore.ts — module-level pub/sub, zero React state in the hot path
export type SceneState = { formation: Formation; intensity: number; accent: '#7c8cff' | '#58c48f'; burst: number }
export function setScene(partial: Partial<SceneState>): void
export function getScene(): SceneState
export function subscribeScene(fn: (s: SceneState) => void): () => void
```

- `<SceneCanvas/>`: fixed full-viewport, `pointer-events-none`, z-0; lazy-mounts R3F `<Canvas>` (dynamic import, `frameloop="always"`, `dpr={[1, 1.75]}`); if `!WebGLRenderingContext` or context creation fails or reduced-motion, renders `<StaticHero/>` (CSS radial gradient) instead. Content wrappers use `relative z-10`.
- `<Particles/>`: `count = isMobile ? 12000 : 45000`; geometry attributes `position` (current), `aTarget` (target formation), `aRand`; on `setScene({formation})` recompute targets and `gsap.to(uniforms.uMorph, { value: 1, duration: 1.6, ease: 'power3.inOut' })` flipping buffers on complete; shader material: point size by distance, color mix(fg, accent, rand), soft round sprite alpha; vertex shader displaces by curl-ish noise drift (`uTime`) + pointer repulsion (uniform `uPointer` in world space, radius 1.2, falloff smoothstep) + `uBurst` outward impulse; `useFrame` updates `uTime`, lerps `uPointer` toward pointer, decays `uBurst *= 0.92`.

- [ ] **Step 1: Implement store** (plain module with a Set of listeners; `setScene` merges and notifies).
- [ ] **Step 2: Implement Particles shader + morph flip** as specced. Initial state: `formation: 'name'` → particles assemble "SATVIK" on load from a random-shell start (play a one-time intro morph on mount, 2.2s).
- [ ] **Step 3: SceneCanvas fallbacks** (WebGL detect + `onCreated` context-loss listener → swap to StaticHero; reduced-motion → StaticHero with the name in plain type).
- [ ] **Step 4: Mount in layout** under SmoothScroll: `<SceneCanvas/>` then `<div className="relative z-10">{children}</div>`.
- [ ] **Step 5: Browser check:** name assembles on load at 60fps (check devtools performance overlay), pointer repels particles, no console errors. Test `chrome://flags` off is out of scope; just verify happy path + reduced-motion via devtools emulation.
- [ ] **Step 6: Commit** `feat: persistent particle scene with SATVIK intro morph`

---

### Task 7: Landing sections A (Hero, About)

**Files:**
- Create: `src/components/sections/Hero.tsx`, `src/components/sections/About.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `site`, `Reveal`, `MagneticButton`, `SectionHeading`, `setScene`.
- Produces: sections with ids `hero`, `about` (ids are the nav/palette contract, exact).

- [ ] **Step 1: Hero.** Full-viewport section: the particle name IS the headline (no duplicate H1 text visually; include `<h1 className="sr-only">Satvik Singh</h1>` for a11y/SEO). Bottom-left: tagline (display font, 2xl) + stat pills row (`site.stats`, mono, bordered, staggered Reveal). Bottom-center: scroll cue (animated chevron, `animate-bounce` slowed). CTA row: MagneticButton "Resume" → `site.resumePath` download + ghost links to GitHub/LinkedIn.
- [ ] **Step 2: About.** Two-column: left is a 3-sentence bio (backend engineer, 3 yrs; Go microservices + distributed systems at Safe Security; founded two services from scratch, owns risk-scoring + workflow platforms). Right: skill groups from resume (Languages / Backend / Data / AI-ML / Infra) as mono tag rows. Wrap blocks in `Reveal`.
- [ ] **Step 3: Assemble page.tsx** (Hero + About), browser check both sections over the particle field, text readable (add `bg-gradient-to-b from-transparent via-[#0a0a0fcc] to-[#0a0a0f]` scrims where needed).
- [ ] **Step 4: Commit** `feat: hero and about sections`

---

### Task 8: Landing sections B (Work cards, Misc, Writing, Contact)

**Files:**
- Create: `src/components/sections/Work.tsx`, `Misc.tsx`, `Writing.tsx`, `Contact.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getAllCases()`, `getPosts()`, `miscItems`, `setScene`.
- Produces: section ids `work`, `misc`, `writing`, `contact` (exact). Work cards link `/work/[slug]`.

- [ ] **Step 1: Work.** `page.tsx` is a server component: fetch `getAllCases()` + `getPosts()` there, pass down. Card: number `01`, title, hook, 2 stat chips, arrow; hover: border brightens to accent, `setScene({ intensity: 1.6 })` on enter / `1` on leave (client wrapper), slight card tilt with gsap.
- [ ] **Step 2: Misc.** `SectionHeading eyebrow="Also built"`, 5 compact rows (title, blurb, tags mono). **Step 3: Writing.** Post cards (title, date formatted `MMM YYYY`, `N min read`) linking to Medium, plus a "More on Medium" MagneticButton; empty fallback state: single card linking to the Medium profile. **Step 4: Contact.** Big display-font "Let's talk", email as huge underlined link, row of GitHub/LinkedIn/Medium links, footer line: `Built with Next.js, Three.js, GSAP. Press ~ for the terminal.`
- [ ] **Step 5: Browser check** all sections, then **Step 6: Commit** `feat: work, misc, writing, contact sections`

---

### Task 9: Scroll-linked formation morphs on landing

**Files:**
- Create: `src/components/scene/SectionMorpher.tsx` (client)
- Modify: `src/app/page.tsx` (mount it)

**Interfaces:**
- Consumes: `setScene`. Section→formation map (exact): `hero→name`, `about→sphere`, `work→lattice`, `misc→lattice`, `writing→ambient`, `contact→vortex`.

- [ ] **Step 1: Implement.** One `IntersectionObserver` (threshold 0.4) over the six section ids; on intersect, `setScene({ formation: map[id], accent: id === 'work' ? '#58c48f' : '#7c8cff' })`. Skip entirely under reduced motion.
- [ ] **Step 2: Browser check:** scrolling the landing page morphs particles per section smoothly with no hitching; fast scroll doesn't queue stale morphs (last-write-wins via the gsap tween overwrite: `overwrite: true`).
- [ ] **Step 3: Commit** `feat: scroll-linked particle formations`

---

### Task 10: Case-study pages + scrollytelling engine

**Files:**
- Create: `src/app/work/[slug]/page.tsx`
- Create: `src/components/case/CaseLayout.tsx`, `src/components/case/Scrolly.tsx`, `src/components/case/diagrams/{WorkflowDiagram,RiskDiagram,RagDiagram,ExchangeDiagram}.tsx`
- Modify: `src/lib/content.ts` only if a helper is missing

**Interfaces:**
- Consumes: `getCase`, `getAllCases` (for `generateStaticParams` + prev/next footer), MDX via `next-mdx-remote/rsc`.
- Produces: `<Scrolly steps={Step[]} diagram={DiagramComponent}>` where

```ts
type Step = { id: string; title: string; body: string; highlight: string[] } // highlight = diagram node ids
type DiagramProps = { active: string[]; progress: number } // each diagram is pure SVG driven by props
```

- [ ] **Step 1: Route.** `generateStaticParams` from `getAllCases()`; `generateMetadata` (title `${meta.title}, Satvik Singh`, description = hook); page renders `<CaseLayout meta>` + `<MDXRemote source={body} components={{ Scrolly: boundScrolly }}/>` where `boundScrolly` selects the right diagram + steps by slug from a `diagrams/index.ts` registry.
- [ ] **Step 2: CaseLayout.** Sticky mini-nav (back link, slug breadcrumb), hero block (title 5xl display, hook, role/period, stat chips), prose styles for MDX (`max-w-2xl`, muted H2 eyebrows), prev/next case footer. On mount: `setScene({ formation: 'ambient', intensity: 0.5 })` (client effect component inside layout).
- [ ] **Step 3: Scrolly engine.** Desktop: two columns; left = steps (each ~60vh), right = `position: sticky` diagram; a ScrollTrigger per step sets active step state (React state OK here, it changes ~once/screen) and tweens `progress`. Mobile (<lg): diagram renders inline between steps, no pinning, steps just Reveal. Reduced motion: all steps visible, diagram shows final state.
- [ ] **Step 4: Diagrams.** Each is hand-authored SVG (~10-16 nodes: rounded rects + mono labels + edge paths) where nodes/edges carry `data-id`; active ids get accent stroke + glow, edges animate `stroke-dashoffset` flows. Steps per case (4-6 each) narrate: workflow = trigger→node graph→HTTP node internals (credential resolve→SSRF dialer→classify)→insights pipeline; risk = ingest 500M/mo→scoring→cache/index fixes→kill switch + self-healing; rag = upload→scan→chunk/embed→hybrid search→LLM gateway answering; exchange = tenant A→STS→single-table→multi-region→tenant B.
- [ ] **Step 5: Write the actual `Step[]` copy for all four cases** inside `diagrams/index.ts` registry (drawn from the MDX facts; keep each body ≤ 60 words).
- [ ] **Step 6: Browser check:** all 4 pages, pinned scrollytelling works, mobile viewport degrades to inline, `npm run build` passes (static params).
- [ ] **Step 7: Commit** `feat: case study pages with scrollytelling diagrams`

---

### Task 11: Dissolve page transitions

**Files:**
- Create: `src/components/scene/TransitionLink.tsx`
- Modify: `src/components/sections/Work.tsx`, `src/components/case/CaseLayout.tsx` (use it for card/back/prev/next links)

**Interfaces:**
- Produces: `<TransitionLink href className>` — on click: prevent default, `setScene({ burst: 1 })`, gsap fade content wrapper to 0 over 0.35s, then `router.push(href)`; on new route mount CaseLayout/page fades content in from 0 over 0.5s. Falls back to instant nav under reduced motion.

- [ ] **Step 1: Implement** (client; `useRouter` from `next/navigation`; the content wrapper gets `id="page-root"` in layout for the tween target).
- [ ] **Step 2: Browser check:** landing→case feels continuous (particles burst + reform into ambient), back nav works, no scroll-position bugs (call `window.scrollTo(0,0)` + `ScrollTrigger.refresh()` after push).
- [ ] **Step 3: Commit** `feat: dissolve transitions between pages`

---

### Task 12: Terminal overlay + command palette (TDD for command router)

**Files:**
- Create: `src/components/terminal/commands.ts`, `Terminal.tsx`, `CommandPalette.tsx`, `src/components/terminal/HotkeyMount.tsx`
- Modify: `src/app/layout.tsx` (mount HotkeyMount)
- Test: `tests/unit/commands.test.ts`

**Interfaces:**
- Produces:

```ts
export type CmdResult = { lines: string[]; action?: { type: 'navigate'; href: string } | { type: 'download'; href: string } }
export function runCommand(input: string, ctx: { cases: { slug: string; title: string }[] }): CmdResult
```

Commands (exact): `help`, `whoami`, `ls work/` (alias `ls`), `open <slug>` (navigate `/work/<slug>`; unknown slug → error line), `resume` (download action), `contact`, `clear` (special-cased in UI), unknown → `command not found: <x> (try 'help')`.

- [ ] **Step 1: Failing tests** covering: help lists all commands; `open risk-engine` returns navigate action; `open nope` returns error + no action; `whoami` mentions "Backend engineer"; unknown command message format.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement** pure router. **Step 4: Run** — PASS.
- [ ] **Step 5: Terminal UI.** Full-screen overlay (backdrop blur, mono font, green-on-dark `#c9f7d4`), history rendering, input with blinking block caret, up-arrow history, Esc closes. Opens on `~` keypress (ignore when typing in inputs). Executes actions via router.push / anchor click. Prints a banner: `satvik@portfolio, type 'help'`.
- [ ] **Step 6: CommandPalette.** `⌘K`/`ctrl+K`: centered list (Go to: Work, Writing, Contact, each case study; Actions: Download resume, Open terminal, GitHub, LinkedIn, Medium), filter-as-you-type, arrows+enter, Esc closes. Plain implementation (no cmdk dep).
- [ ] **Step 7: Browser check** both overlays; **Step 8: Commit** `feat: terminal overlay and command palette`

---

### Task 13: SEO, 404, polish pass

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`, `public/og.png`
- Modify: `src/app/layout.tsx`, `src/app/work/[slug]/page.tsx` (OG metadata)

- [ ] **Step 1: sitemap** (landing + 4 case pages), **robots** (allow all, sitemap URL). **Step 2: OG:** generate `public/og.png` (1200×630, dark bg, name + tagline in theme, script it with node-canvas alternative: build a simple HTML file and screenshot via Playwright chromium in a one-off script `scripts/og.ts`); wire `openGraph`/`twitter` metadata in layout + per-case (`title`, description=hook). **Step 3: 404:** typographic `404, this route fell over` + link home, `setScene({formation:'ambient'})`. **Step 4:** favicon: simple `S` glyph SVG → `src/app/icon.svg`.
- [ ] **Step 5: Commit** `feat: seo, og image, 404`

---

### Task 14: Playwright smoke suite

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (script `test:e2e`)

- [ ] **Step 1: Config:** `webServer: { command: 'npm run build && npm run start', port: 3000 }`, chromium only.
- [ ] **Step 2: Spec:**

```ts
import { expect, test } from '@playwright/test'

test('landing renders hero + all sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Satvik')
  for (const id of ['about', 'work', 'misc', 'writing', 'contact'])
    await expect(page.locator(`#${id}`)).toBeAttached()
})

test('all four case pages render', async ({ page }) => {
  for (const slug of ['workflow-platform', 'risk-engine', 'rag-pipeline', 'data-exchange']) {
    await page.goto(`/work/${slug}`)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('The problem')).toBeVisible()
  }
})

test('terminal opens and navigates', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('`') // '~' without shift varies; bind both ` and ~ in HotkeyMount
  await page.getByRole('textbox').fill('open risk-engine')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/work\/risk-engine/)
})

test('resume downloads', async ({ page }) => {
  await page.goto('/')
  const dl = page.waitForEvent('download')
  await page.getByRole('link', { name: /resume/i }).first().click()
  expect((await dl).suggestedFilename()).toContain('.pdf')
})
```

(Note: bind the terminal hotkey to both `` ` `` and `~` to make this robust.)

- [ ] **Step 3: Run** `npx playwright install chromium && npm run test:e2e` — PASS. **Step 4: Commit** `test: playwright smoke suite`

---

### Task 15: Ship — GitHub + Vercel

**Files:**
- Create: `README.md` (what it is, stack, dev commands, deploy note)

- [ ] **Step 1: Final verify:** `npm test && npm run build && npm run test:e2e` all green; manual browser pass of landing + one case page + reduced-motion emulation + iPhone viewport.
- [ ] **Step 2: README + commit** `docs: readme`.
- [ ] **Step 3: Create GitHub repo and push** (public, personal account):

```bash
gh repo create zen7vik/portfolio --public --source . --push
```

If `gh` is authed to the work account only: `git remote add origin git@github.com:zen7vik/portfolio.git && git push -u origin main` and let the user create the empty repo in the browser first.

- [ ] **Step 4: Vercel:** needs the user's account. Give them the two-minute path: vercel.com/new → Import `zen7vik/portfolio` → framework auto-detected (Next.js) → Deploy. No env vars needed. Alternative if they want CLI: `npx vercel --prod` (interactive login). Confirm the live `*.vercel.app` URL renders the scene.
- [ ] **Step 5: Post-ship:** paste live Medium posts into `writing-fallback.json` if RSS returned data at build; final commit.

---

## Self-Review Notes

- Spec coverage: every spec section maps to a task (scene→5/6/9/11, structure→7/8/10, terminal→12, blog→2/8, misc→3/8, SEO/perf/fallbacks→6/13, tests→2/3/5/12/14, deploy→15). Reduced-motion and no-WebGL fallbacks live in Tasks 4/6/9/10.
- Type consistency: `Formation`, `SceneState`, `setScene`, `CaseMeta`, `Step`, `CmdResult` defined once, consumed by name elsewhere.
- Deliberate scope cuts (v1): no custom domain, no analytics beyond Vercel, no light theme, particles-form-"404" skipped (typographic 404 instead).
