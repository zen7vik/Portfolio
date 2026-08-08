# satvik.dev (portfolio)

Personal portfolio: a WebGL morphing-particle landing page, deep-dive case studies with scroll-driven architecture diagrams, a Medium-powered writing section, and a terminal easter egg (press `~`) with a `⌘K` command palette.

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS v4
- three + @react-three/fiber (persistent particle scene, custom GLSL)
- GSAP + ScrollTrigger, Lenis (smooth scroll, scrollytelling)
- MDX case studies (`src/content/work/`), Medium RSS at build time with committed fallback

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest unit tests
npm run test:e2e     # playwright smoke suite (builds + starts on :3100)
```

Content lives in `src/content/` (case MDX, misc items, writing fallback). Site constants (links, stats, tagline) in `src/lib/site.ts`. Diagram steps in `src/components/case/registry.ts`.

## Deploy

Vercel: import the GitHub repo, no configuration needed. `npm run build` is the CI gate.

## Accessibility & fallbacks

- `prefers-reduced-motion`: static hero, no particle drift, fades instead of scroll animation
- No WebGL: gradient hero with typographic name
- Terminal/palette are optional layers; every page works by scrolling alone
