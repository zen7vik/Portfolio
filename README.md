# satvik.dev (portfolio)

Personal portfolio: a playable service-graph hero (kill nodes, watch traffic reroute and heal), deep-dive case studies with scroll-driven architecture diagrams, a Medium-powered writing section, light and dark themes, and a terminal easter egg (press `~`) with a Ctrl/Cmd K command palette.

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS v4
- Mona Sans (variable width) + Geist Mono via next/font
- Motion (reveals, count-ups, shared transitions), GSAP ScrollTrigger + Lenis (smooth scroll, scrollytelling)
- Canvas 2D playground; simulation logic in `src/components/play/sim.ts` (unit tested)
- MDX case studies (`src/content/work/`), Medium RSS at build time with committed fallback

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest unit tests
npm run test:e2e     # playwright smoke suite (builds + starts on :3100)
```

Content lives in `src/content/` (case MDX, misc items, writing fallback). Site constants and the production numbers band in `src/lib/site.ts`, experience in `src/content/experience.ts`. Every number must trace to `~/resume/EVIDENCE_2026-09.md`. Diagram steps in `src/components/case/registry.ts`.

## Deploy

Vercel: import the GitHub repo, no configuration needed. `npm run build` is the CI gate.

## Accessibility & fallbacks

- `prefers-reduced-motion`: playground starts paused, no scroll animation
- Theme follows the system preference until toggled, stored in localStorage
- Terminal/palette are optional layers; every page works by scrolling alone
