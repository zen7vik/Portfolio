# Portfolio v3 style guide (room + ride)

The site is a toy world, not a web page. Everything should feel handmade, soft and alive.

## Shapes
- Low-poly toy look built from primitives. Prefer drei `RoundedBox` (radius 0.04 to 0.12, smoothness 4) over sharp boxes, cylinders with low segment counts (8 to 16) for a faceted feel.
- No textures needed. Flat `meshStandardMaterial` with roughness 0.7 to 0.9, metalness 0. Emissive only for screens, lamps, neon signs.
- Slight imperfection: rotate props a few degrees, stack books unevenly. Nothing perfectly aligned.

## Palette (shared)
- Brand accent: `#ff6a3d` (signal orange). Use it for the "you are here" things: the auto's roof stripe, interactive glow, the room lamp shade.
- Delhi auto-rickshaw: body `#2f9e44` (CNG green), roof and canopy `#ffd43b` (yellow), black `#222` details.
- Warm whites `#f3ece2`, wood `#b07a4f` / `#7a4e2f`, terracotta `#c8643b`, teal `#2f6f73`, slate `#3b4256`, sky night `#141a2e`, sky dusk `#f4a261`.
- Never AI purple gradients.

## Light
- Time aware: read the visitor's local hour. Night (19 to 6): warm lamp + cool screen glow, dark sky, stars. Day: soft sun from the window, sky `#9fd8f5`.
- Soft shadows (`shadows="soft"` or PCFSoft), drei `ContactShadows` under objects, `Environment preset="apartment"` or `"city"` at low intensity.
- Subtle bloom only on emissive things (postprocessing `Bloom` luminanceThreshold ~0.9).

## Type (HTML overlays)
- Mona Sans (already loaded as `--font-sans-face`, wide axis via `.display`) for headings, Geist Mono for small labels.
- Overlays are speech bubbles, sticky notes, screen UIs, never generic cards.

## Personality ("it knows you are here")
- Characters look at the cursor, blink, react to clicks (squash and stretch).
- Short, warm, first-person copy in Satvik's voice. Small jokes allowed. No corporate phrasing, no em or en dashes anywhere.
- Every click does something: a boop (scale 1 to 1.12 back to 1 with a spring), a sound (optional, muted by default with a toggle), a message.

## Content truth
- Every number must come from `~/resume/EVIDENCE_2026-09.md` or the existing `src/content/*` and `src/lib/site.ts`. Do not invent figures.

## Performance
- `dpr={[1, 2]}`, instanced meshes for repeated props, pause rendering when the tab is hidden, total JS for the 3D route lazy loaded via `next/dynamic` with `ssr: false`.
- Mobile: touch controls, lower dpr, fewer shadows. Always offer "Skip to read" which links to `/read`.
