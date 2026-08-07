export const FORMATIONS = ['name', 'ambient', 'sphere', 'lattice', 'vortex'] as const
export type Formation = (typeof FORMATIONS)[number]

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
  ctx.font = `800 170px ${getComputedStyle(document.documentElement).getPropertyValue('--font-space-grotesk') || 'sans-serif'}`
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
  const scale = 9 / W
  // ~70% of particles form the glyphs; the rest hang back as a sparse halo
  const glyphCount = Math.floor(count * 0.7)
  for (let i = 0; i < glyphCount; i++) {
    const [x, y] = pts[Math.floor(Math.random() * pts.length)]
    arr[i * 3] = (x - W / 2) * scale + (Math.random() - 0.5) * 0.03
    arr[i * 3 + 1] = -(y - H / 2) * scale + (Math.random() - 0.5) * 0.03
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
    default:
      return ambient(count)
  }
}
