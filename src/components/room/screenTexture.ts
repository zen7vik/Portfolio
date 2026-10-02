'use client'

import * as THREE from 'three'

const W = 1024
const H = 614

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

/** A still of SatvikOS for the 3D monitor; the real, clickable OS opens as an overlay. */
export function makeScreenTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const draw = (pulse = 0) => {
    const g = canvas.getContext('2d')!
    const bg = g.createRadialGradient(W * 0.85, H * 1.1, 20, W * 0.6, H * 0.6, W * 0.9)
    bg.addColorStop(0, '#ff6a3d')
    bg.addColorStop(0.3, '#c8643b')
    bg.addColorStop(0.65, '#2f3346')
    bg.addColorStop(1, '#1d2030')
    g.fillStyle = bg
    g.fillRect(0, 0, W, H)

    g.fillStyle = 'rgba(243,236,226,0.92)'
    g.fillRect(0, 0, W, 32)
    g.fillStyle = '#1b1d24'
    g.font = '700 15px "Mona Sans", sans-serif'
    g.fillText('SatvikOS', 14, 21)
    g.fillStyle = '#5b5f6d'
    g.font = '500 14px "Mona Sans", sans-serif'
    g.fillText('v3, compiled with chai', 100, 21)
    const t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    g.fillText(t, W - 80, 21)

    const icons = ['#ffd43b', '#ff6a3d', '#74c0fc', '#8ce99a', '#e5dbff', '#ffc9c9', '#ced4da', '#2f9e44']
    const labels = ['about_me', 'Work', 'Experience', 'Side quests', 'Writing', 'Say hi', 'Terminal', 'ride.exe']
    icons.forEach((c, i) => {
      const col = Math.floor(i / 4)
      const row = i % 4
      const x = 28 + col * 96
      const y = 56 + row * 112
      g.fillStyle = 'rgba(0,0,0,0.25)'
      rr(g, x + 14, y + 6, 56, 56, 14)
      g.fill()
      g.fillStyle = c
      rr(g, x + 14, y, 56, 56, 14)
      g.fill()
      g.fillStyle = '#f3ece2'
      g.font = '600 13px "Mona Sans", sans-serif'
      g.textAlign = 'center'
      g.fillText(labels[i], x + 42, y + 80)
      g.textAlign = 'left'
    })

    // about window
    const wx = 270
    const wy = 70
    const ww = 560
    const wh = 400
    g.fillStyle = 'rgba(0,0,0,0.35)'
    rr(g, wx + 6, wy + 14, ww, wh, 16)
    g.fill()
    g.fillStyle = '#f8f4ee'
    rr(g, wx, wy, ww, wh, 16)
    g.fill()
    g.fillStyle = '#efe7db'
    rr(g, wx, wy, ww, 38, 16)
    g.fill()
    g.fillRect(wx, wy + 20, ww, 18)
    ;['#ff6a3d', '#ffd43b', '#8ce99a'].forEach((c, i) => {
      g.fillStyle = c
      g.beginPath()
      g.arc(wx + 22 + i * 22, wy + 19, 7, 0, Math.PI * 2)
      g.fill()
    })
    g.fillStyle = '#5b5f6d'
    g.font = '500 14px monospace'
    g.fillText('about_me.txt', wx + ww / 2 - 48, wy + 24)
    g.fillStyle = '#1b1d24'
    g.font = '800 34px "Mona Sans", sans-serif'
    g.fillText("Hi, I'm Satvik.", wx + 30, wy + 96)
    g.fillStyle = '#2b2e38'
    g.font = '500 19px "Mona Sans", sans-serif'
    ;[
      'Fullstack AI engineer at Safe Security, Delhi.',
      'I own a risk engine doing 72M calculations a',
      'month, and the workflow platform customers',
      'automate their vendor risk on.',
      '',
      'Go, TypeScript, Temporal, Postgres, RAG.',
    ].forEach((line, i) => g.fillText(line, wx + 30, wy + 140 + i * 30))

    // pulsing call to action
    const a = 0.55 + pulse * 0.45
    g.fillStyle = `rgba(255,106,61,${a})`
    rr(g, wx + 30, wy + wh - 68, 236, 42, 21)
    g.fill()
    g.fillStyle = '#1b0b05'
    g.font = '700 18px "Mona Sans", sans-serif'
    g.fillText('Click the screen to open', wx + 48, wy + wh - 41)

    g.fillStyle = 'rgba(243,236,226,0.9)'
    g.font = '800 64px "Mona Sans", sans-serif'
    g.textAlign = 'right'
    g.fillText('Satvik', W - 30, H - 86)
    g.fillText('Singh', W - 30, H - 30)
    g.textAlign = 'left'
    tex.needsUpdate = true
  }

  draw()
  return { tex, draw }
}
