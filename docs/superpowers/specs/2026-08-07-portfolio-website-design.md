# Portfolio Website — Design Spec

**Date:** 2026-08-07
**Owner:** Satvik Singh
**Status:** Approved direction (interactive brainstorm with visual companion)

## Purpose

A personal portfolio optimized as a **job-search weapon** for backend/SDE-2 roles at product companies (Coinbase, GitLab, etc.). Every design choice must either (a) create a memorable "wow" or (b) prove engineering depth. Target audiences: recruiters (60-second skim path) and hiring managers (deep-dive path).

## Decisions made during brainstorm

| Question | Decision |
|---|---|
| Core identity | **WebGL particle scene ("maximum wow")** + terminal/⌘K layer for technical visitors |
| 3D scene concept | **Morphing particle field** — particles assemble into "SATVIK", scatter/reform per section |
| Structure | **Showpiece landing + separate deep-dive case-study pages** (shareable links) |
| Case studies | Workflow platform · Risk-scoring engine · RAG evidence pipeline · Cross-tenant data exchange |
| Extra sections | **Miscellaneous** (questionnaire AI review, graphify, horizontal initiatives) + **Writing** (Medium RSS) |
| Stack | **Next.js App Router + React Three Fiber + GSAP ScrollTrigger + Lenis + MDX + Tailwind** |
| Hosting | **Vercel free tier**, `*.vercel.app` for now; custom domain attachable later with no rework |
| Links | GitHub `zen7vik` · Medium `@satvik19nitm` · LinkedIn `satvik-singh-3989a51b5` · email `satvik19nitm@gmail.com` |

## 1. Site map & content

### Landing page `/`
1. **Hero** — particles assemble into "SATVIK", loosen into ambient field. Tagline: "Backend engineer. I build distributed systems that don't fall over." Stat pills: 500M events/mo · p99 585ms · 6 regions · 147K workflows/mo. Scroll cue.
2. **About strip** — short bio + skill groups + resume PDF download.
3. **Work** — 4 case-study cards. Hover disturbs particles; click triggers dissolve transition into the case page.
4. **Miscellaneous** — compact grid: questionnaire AI review, graphify (knowledge-graph tooling), httpserver hardening initiative, on-call triage tooling, InvestIQ.
5. **Writing** — cards auto-pulled from Medium RSS (`medium.com/feed/@satvik19nitm`), linking out.
6. **Contact** — email, GitHub, LinkedIn, Medium.

### Case-study pages `/work/<slug>`
Slugs: `workflow-platform`, `risk-engine`, `rag-pipeline`, `data-exchange`.

Shared template: hook + role/scale header → problem → **pinned animated architecture diagram driven by scroll** (GSAP ScrollTrigger scrollytelling) → key decisions & trade-offs → measured outcomes → "what I'd do differently".

`workflow-platform` gets the richest treatment (per user): node system, generic HTTP integration node (credentials vault, SSRF-hardened egress, response classification, test panel), backend-driven node contract, execution insights + metrics, ~147K runs/month.

Content sources: `~/resume/Satvik_Singh_Resume.md`, `~/resume/DEEP_DIVE.md`, assistant memory of the workflow epic. All numbers already public on the resume; user reviews all copy before ship.

### Terminal layer
- `~` key (and a footer hint) opens a typeable terminal overlay: `help`, `whoami`, `ls work/`, `open <slug>`, `resume`, `contact`.
- `⌘K` command palette for quick navigation.
- Both are optional paths; scrolling never depends on them.

## 2. Scene & motion system

### Particle scene
- One persistent `<Canvas>` (React Three Fiber) mounted in the root layout — survives route changes so transitions are continuous.
- GPU points (~30–60k, custom shader material). Morph targets precomputed by sampling: text geometry ("SATVIK"), per-section formations, ambient field.
- Behaviors: pointer force-field (repel/attract), scroll-linked morph progress on landing, hover perturbation on work cards, **dissolve/reform transition** when navigating to a case page, subdued ambient state on case pages (perf headroom for scrollytelling).
- All animation state lives in refs/uniforms — never React state; `useFrame` drives uniforms directly.

### Motion rules
- Lenis smooth scroll globally; GSAP ScrollTrigger for pinned case-study diagrams and section reveals.
- Micro-interactions: magnetic buttons, staggered text reveals, subtle parallax. Motion everywhere, but restrained — no motion that fights readability.
- `prefers-reduced-motion`: particles frozen to a static composition, scroll animations replaced by simple fades, terminal/palette unaffected.
- Mobile: reduced particle count, capped DPR, simplified formations; scrollytelling diagrams degrade to sequential reveal.
- No WebGL → static gradient hero with the same typography (site remains fully usable).

## 3. Technical architecture

- **Framework:** Next.js (App Router, TypeScript). Static generation for all pages.
- **3D:** three + @react-three/fiber + @react-three/drei; custom GLSL for particle morph/interaction.
- **Animation:** GSAP (+ ScrollTrigger; GSAP incl. bonus plugins is free since 2025), Lenis for smooth scroll.
- **Styling:** Tailwind CSS; dark theme only (scene is the background).
- **Content:** MDX files per case study under `content/`; misc + about as structured data (TS/JSON).
- **Blog:** Medium RSS fetched at build time (cached JSON fallback committed so builds never fail on RSS hiccups); revalidated daily via ISR.
- **SEO:** per-page metadata, OpenGraph images per case study, sitemap, robots.
- **Perf budgets:** 60fps scene on desktop; LCP < 2.5s (hero text renders before scene hydrates — scene fades in); three.js code-split and lazy-loaded.
- **Quality gates:** during implementation, install GSAP official skill + web-animation-skills; verify visuals in a real browser before claiming done (user preference).

### Repo & deployment
- New standalone repo at `~/Developer/portfolio` (workspace rule: each subdir its own repo). Push to GitHub `zen7vik/portfolio`.
- Deploy: Vercel free tier connected to the GitHub repo; every push auto-deploys. URL `<name>.vercel.app` for now; custom domain later requires only DNS + Vercel settings.

## Error handling
- RSS fetch failure → committed fallback JSON (site never breaks on Medium being down).
- WebGL context loss → dispose + static fallback.
- 404 page in-theme (particles form "404" if cheap to do; otherwise typographic).

## Testing
- Type-safe build (`next build`) as CI gate.
- Playwright smoke: landing renders, all 4 case pages render, terminal opens, palette navigates, resume downloads.
- Manual: visual verification in browser (including reduced-motion and mobile viewport) before ship.

## Out of scope (v1)
- Custom domain purchase (deferred by user).
- CMS/admin — content is files in the repo.
- Analytics beyond Vercel's built-in.
- Light theme.
