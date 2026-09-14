import { useMemo } from 'react'
import * as THREE from 'three'

function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvasTexture(kind, seed = 1) {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const rand = seeded(seed)

  if (kind === 'plaster' || kind === 'darkPlaster') {
    const dark = kind === 'darkPlaster'
    ctx.fillStyle = dark ? '#171d26' : '#e9e2d6'
    ctx.fillRect(0, 0, size, size)
    const img = ctx.getImageData(0, 0, size, size)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - .5) * (dark ? 16 : 13)
      d[i] = Math.max(0, Math.min(255, d[i] + n))
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
    }
    ctx.putImageData(img, 0, 0)
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = dark ? `rgba(255,255,255,${.008 + rand() * .012})` : `rgba(70,55,42,${.015 + rand() * .02})`
      ctx.lineWidth = .35 + rand() * 1.3
      const y = rand() * size
      ctx.beginPath(); ctx.moveTo(rand() * 70, y); ctx.bezierCurveTo(size * .35, y + rand() * 5, size * .7, y - rand() * 5, size - rand() * 70, y + rand() * 2); ctx.stroke()
    }
  } else if (kind === 'stone') {
    ctx.fillStyle = '#c9c0b1'; ctx.fillRect(0, 0, size, size)
    const tile = 128
    for (let y = 0; y < size; y += tile) for (let x = 0; x < size; x += tile) {
      const v = Math.floor((rand() - .5) * 14)
      ctx.fillStyle = `rgb(${199 + v},${190 + v},${176 + v})`
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4)
      const g = ctx.createLinearGradient(x, y, x + tile, y + tile)
      g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(55,45,35,.055)')
      ctx.fillStyle = g; ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4)
    }
    ctx.strokeStyle = 'rgba(75,65,55,.12)'; ctx.lineWidth = 2
    for (let i = 0; i <= size; i += tile) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke() }
  } else if (kind === 'carpet') {
    ctx.fillStyle = '#6e675f'; ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 24000; i++) {
      const x = rand() * size, y = rand() * size, a = .018 + rand() * .035
      ctx.fillStyle = rand() > .5 ? `rgba(255,255,255,${a})` : `rgba(20,16,12,${a})`
      ctx.fillRect(x, y, .5 + rand() * 1.2, 2 + rand() * 7)
    }
    ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(0, 0, 12, size); ctx.fillRect(size - 12, 0, 12, size)
  } else if (kind === 'wood' || kind === 'darkWood') {
    const dark = kind === 'darkWood'
    ctx.fillStyle = dark ? '#392f29' : '#66513e'; ctx.fillRect(0, 0, size, size)
    for (let x = 0; x < size; x += 42) {
      const base = dark ? 46 + rand() * 20 : 80 + rand() * 28
      ctx.fillStyle = `rgb(${base + 16},${base + 4},${Math.max(18, base - 12)})`; ctx.fillRect(x, 0, 40, size)
      ctx.strokeStyle = 'rgba(20,12,7,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, 0); ctx.lineTo(x + 40, size); ctx.stroke()
      for (let j = 0; j < 8; j++) {
        const xx = x + 5 + rand() * 30
        ctx.strokeStyle = `rgba(255,235,205,${.025 + rand() * .035})`; ctx.lineWidth = .6 + rand() * 1.2
        ctx.beginPath(); ctx.moveTo(xx, 0); ctx.bezierCurveTo(xx + rand() * 7, size * .35, xx - rand() * 6, size * .65, xx + rand() * 5, size); ctx.stroke()
      }
    }
  } else if (kind.startsWith('art')) {
    const palettes = [
      ['#e8dfcf','#101927','#ff705d','#5268ff'],
      ['#f0eadf','#1d2530','#b7ff24','#d88758'],
      ['#161d27','#e9e2d7','#5167ff','#ff876e'],
      ['#e7ddcf','#162030','#6e8b62','#d5a650']
    ]
    const p = palettes[(seed - 1) % palettes.length]
    ctx.fillStyle = p[0]; ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 7; i++) {
      ctx.save(); ctx.translate(rand() * size, rand() * size); ctx.rotate((rand() - .5) * 1.2)
      ctx.fillStyle = p[1 + (i % 3)]; ctx.globalAlpha = .78 + rand() * .2
      const w = 70 + rand() * 250, h = 20 + rand() * 170
      if (i % 2) ctx.fillRect(-w / 2, -h / 2, w, h); else { ctx.beginPath(); ctx.arc(0, 0, 28 + rand() * 115, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

export function useSurface(kind, repeatX = 1, repeatY = 1, seed = 1) {
  return useMemo(() => {
    const t = canvasTexture(kind, seed)
    t.repeat.set(repeatX, repeatY)
    return t
  }, [kind, repeatX, repeatY, seed])
}
