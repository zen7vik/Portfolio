export const FORMATIONS = [
  'name',
  'ambient',
  'sphere',
  'lattice',
  'vortex',
  'helix',
  'wave',
  'torus',
  'twin',
  'portrait',
] as const
export type Formation = (typeof FORMATIONS)[number]

// --- portrait: particles assemble into a photo (public/me.jpg) ---------------
let portraitPoints: { x: number; y: number; l: number }[] | null = null

/** Kick off loading the portrait; safe to call repeatedly. */
export function preloadPortrait(url = '/me.jpg'): void {
  if (typeof window === 'undefined' || portraitPoints) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const W = 220
    const H = Math.round((img.height / img.width) * W)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(img, 0, 0, W, H)
    const data = ctx.getImageData(0, 0, W, H).data
    const px = (x: number, y: number) => {
      const i = (y * W + x) * 4
      return [data[i], data[i + 1], data[i + 2]] as const
    }
    // estimate the background from the four corner patches, then keep pixels
    // that differ from it — works for a subject on any background, light or dark
    let br = 0
    let bgG = 0
    let bb = 0
    let n = 0
    for (const [cx, cy] of [
      [0, 0],
      [W - 9, 0],
      [0, H - 9],
      [W - 9, H - 9],
    ]) {
      for (let y = cy; y < cy + 9; y++) {
        for (let x = cx; x < cx + 9; x++) {
          const [r, g, b] = px(x, y)
          br += r
          bgG += g
          bb += b
          n++
        }
      }
    }
    br /= n
    bgG /= n
    bb /= n
    const pts: { x: number; y: number; l: number }[] = []
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const [r, g, b] = px(x, y)
        const dist = Math.sqrt(((r - br) ** 2 + (g - bgG) ** 2 + (b - bb) ** 2) / 3) / 255
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        // subject = pixels that differ from the background; density follows that difference
        if (dist > 0.16 && Math.random() < Math.min(1, dist * 1.6)) {
          pts.push({ x: x / W - 0.5, y: 0.5 - y / H, l: lum })
        }
      }
    }
    if (pts.length > 200) portraitPoints = pts
  }
  img.src = url
}

export function portraitReady(): boolean {
  return portraitPoints !== null
}

export function portrait(count: number): Float32Array {
  if (!portraitPoints) return sphere(count)
  const arr = new Float32Array(count * 3)
  const H_WORLD = 5.4
  for (let i = 0; i < count; i++) {
    const p = portraitPoints[Math.floor(Math.random() * portraitPoints.length)]
    arr[i * 3] = p.x * H_WORLD * 0.82 + (Math.random() - 0.5) * 0.03
    arr[i * 3 + 1] = p.y * H_WORLD + (Math.random() - 0.5) * 0.03
    // brighter pixels sit slightly closer to the camera for a relief effect
    arr[i * 3 + 2] = p.l * 0.5 + (Math.random() - 0.5) * 0.08
  }
  return arr
}

// All generators return Float32Array of length count*3, roughly within [-6, 6].

export function ambient(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 11
    arr[i * 3 + 1] = (Math.random() - 0.5) * 7
    arr[i * 3 + 2] = (Math.random() - 0.5) * 6
  }
  return arr
}

export function sphere(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  const r = 2.6
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const jitter = 1 + (Math.random() - 0.5) * 0.08
    arr[i * 3] = Math.cos(theta) * radius * r * jitter
    arr[i * 3 + 1] = y * r * jitter
    arr[i * 3 + 2] = Math.sin(theta) * radius * r * jitter
  }
  return arr
}

export function lattice(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  const side = Math.ceil(Math.cbrt(count))
  const spacing = 7.5 / side
  for (let i = 0; i < count; i++) {
    const x = i % side
    const y = Math.floor(i / side) % side
    const z = Math.floor(i / (side * side))
    arr[i * 3] = (x - side / 2) * spacing * 1.4 + (Math.random() - 0.5) * 0.12
    arr[i * 3 + 1] = (y - side / 2) * spacing + (Math.random() - 0.5) * 0.12
    arr[i * 3 + 2] = (z - side / 2) * spacing + (Math.random() - 0.5) * 0.12
  }
  return arr
}

export function vortex(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    const angle = t * Math.PI * 14 + Math.random() * 0.35
    const radius = 0.25 + t * 3.6
    arr[i * 3] = Math.cos(angle) * radius
    arr[i * 3 + 1] = (t - 0.5) * 4.5 + (Math.random() - 0.5) * 0.3
    arr[i * 3 + 2] = Math.sin(angle) * radius
  }
  return arr
}

export function helix(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 6
    const strand = i % 2
    const phase = t + strand * Math.PI
    // moderate jitter: tight enough to shine gold, loose enough not to white out
    arr[i * 3] = (i / count - 0.5) * 10.5 + (Math.random() - 0.5) * 0.35
    arr[i * 3 + 1] = Math.sin(phase) * 1.75 + (Math.random() - 0.5) * 0.45
    arr[i * 3 + 2] = Math.cos(phase) * 1.75 + (Math.random() - 0.5) * 0.45
  }
  return arr
}

export function wave(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 11
    const z = (Math.random() - 0.5) * 5
    arr[i * 3] = x
    arr[i * 3 + 1] = Math.sin(x * 1.1) * Math.cos(z * 1.3) * 1.4 + (Math.random() - 0.5) * 0.2
    arr[i * 3 + 2] = z
  }
  return arr
}

export function torus(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  const R = 2.5
  const r = 0.85
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2
    const v = Math.random() * Math.PI * 2
    const ring = R + r * Math.cos(v)
    arr[i * 3] = ring * Math.cos(u)
    arr[i * 3 + 1] = r * Math.sin(v) + Math.sin(u * 3) * 0.2
    arr[i * 3 + 2] = ring * Math.sin(u) * 0.6
  }
  return arr
}

export function twin(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const stream = Math.floor(count * 0.12)
  for (let i = 0; i < count; i++) {
    if (i < stream) {
      // particle stream flowing between the two clusters
      const t = i / stream
      arr[i * 3] = (t - 0.5) * 5.2
      arr[i * 3 + 1] = Math.sin(t * Math.PI) * 0.5 + (Math.random() - 0.5) * 0.25
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    } else {
      const j = i - stream
      const side = j % 2 === 0 ? -1 : 1
      const y = 1 - (j / (count - stream - 1)) * 2
      const radius = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * j
      const jitter = 1 + (Math.random() - 0.5) * 0.1
      arr[i * 3] = Math.cos(theta) * radius * 1.5 * jitter + side * 2.9
      arr[i * 3 + 1] = y * 1.5 * jitter
      arr[i * 3 + 2] = Math.sin(theta) * radius * 1.5 * jitter
    }
  }
  return arr
}

// Browser-only: samples glyph pixels from a 2D canvas. Injectable ctx factory for tests.
export function sampleText(
  text: string,
  count: number,
  makeCanvas: () => HTMLCanvasElement | null = () =>
    typeof document !== 'undefined' ? document.createElement('canvas') : null,
): Float32Array {
  const canvas = makeCanvas()
  if (!canvas) return ambient(count)
  const W = 900
  const H = 240
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ambient(count)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = `800 170px ${getComputedStyle(document.documentElement).getPropertyValue('--font-display-face') || 'sans-serif'}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2, H / 2)
  const data = ctx.getImageData(0, 0, W, H).data
  const pts: [number, number][] = []
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y])
    }
  }
  if (!pts.length) return ambient(count)
  const arr = new Float32Array(count * 3)
  // fit the text to the visible world width (camera z=8, fov 50)
  const halfH = 8 * Math.tan((25 * Math.PI) / 180)
  const aspect = window.innerWidth / window.innerHeight
  const worldW = 2 * halfH * aspect
  const scale = Math.min(9, worldW * 0.92) / W
  // portrait: lift the name above the hero copy
  const yOffset = aspect < 1 ? 1.4 : 0
  // ~70% of particles form the glyphs; the rest hang back as a sparse halo
  const glyphCount = Math.floor(count * 0.7)
  for (let i = 0; i < glyphCount; i++) {
    const [x, y] = pts[Math.floor(Math.random() * pts.length)]
    arr[i * 3] = (x - W / 2) * scale + (Math.random() - 0.5) * 0.03
    arr[i * 3 + 1] = -(y - H / 2) * scale + yOffset + (Math.random() - 0.5) * 0.03
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  for (let i = glyphCount; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 11
    arr[i * 3 + 1] = (Math.random() - 0.5) * 7
    arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1.5
  }
  return arr
}

export function getFormation(name: Formation, count: number): Float32Array {
  switch (name) {
    case 'name':
      return sampleText('SATVIK', count)
    case 'sphere':
      return sphere(count)
    case 'lattice':
      return lattice(count)
    case 'vortex':
      return vortex(count)
    case 'helix':
      return helix(count)
    case 'wave':
      return wave(count)
    case 'torus':
      return torus(count)
    case 'twin':
      return twin(count)
    case 'portrait':
      return portrait(count)
    default:
      return ambient(count)
  }
}
