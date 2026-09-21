import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const surfaceCache = new Map()

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

  if (kind === 'joinery') {
    // Unbroken close-grain timber for machined art: no architectural plank seams.
    ctx.fillStyle = '#89735b'; ctx.fillRect(0,0,size,size)
    for(let i=0;i<180;i++) {
      const x=rand()*size
      ctx.strokeStyle=i%3 ? `rgba(49,30,17,${.04+rand()*.06})` : 'rgba(237,211,177,.10)'
      ctx.lineWidth=.4+rand()*1.1
      ctx.beginPath();ctx.moveTo(x,0)
      ctx.bezierCurveTo(x+rand()*14-7,size*.33,x+rand()*14-7,size*.67,x,size)
      ctx.stroke()
    }
  } else if (kind === 'plaster') {
    ctx.fillStyle = '#e9e2d6'
    ctx.fillRect(0, 0, size, size)
    const img = ctx.getImageData(0, 0, size, size)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - .5) * 13
      d[i] = Math.max(0, Math.min(255, d[i] + n))
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
    }
    ctx.putImageData(img, 0, 0)
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = `rgba(70,55,42,${.015 + rand() * .02})`
      ctx.lineWidth = .35 + rand() * 1.3
      const y = rand() * size
      ctx.beginPath(); ctx.moveTo(rand() * 70, y); ctx.bezierCurveTo(size * .35, y + rand() * 5, size * .7, y - rand() * 5, size - rand() * 70, y + rand() * 2); ctx.stroke()
    }
  } else if (kind === 'stone') {
    ctx.fillStyle = '#c9c0b1'; ctx.fillRect(0, 0, size, size)
    const tile = 64
    for (let y = 0; y < size; y += tile) for (let x = 0; x < size; x += tile) {
      const v = Math.floor((rand() - .5) * 14)
      ctx.fillStyle = `rgb(${199 + v},${190 + v},${176 + v})`
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4)
      const g = ctx.createLinearGradient(x, y, x + tile, y + tile)
      g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(55,45,35,.055)')
      ctx.fillStyle = g; ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4)
      for(let i=0;i<6;i++){
        ctx.fillStyle=`rgba(73,62,51,${.012+rand()*.018})`
        ctx.fillRect(x+5+rand()*(tile-10),y+5+rand()*(tile-10),.5+rand(),.5+rand())
      }
    }
    ctx.strokeStyle = 'rgba(75,65,55,.10)'; ctx.lineWidth = 1
    for (let i = 0; i <= size; i += tile) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke() }
  } else if (kind === 'carpet') {
    ctx.fillStyle = '#6e675f'; ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 24000; i++) {
      const x = rand() * size, y = rand() * size, a = .018 + rand() * .035
      ctx.fillStyle = rand() > .5 ? `rgba(255,255,255,${a})` : `rgba(20,16,12,${a})`
      ctx.fillRect(x, y, .5 + rand() * 1.2, 2 + rand() * 7)
    }
    ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(0, 0, 12, size); ctx.fillRect(size - 12, 0, 12, size)
  } else if (kind === 'wood') {
    ctx.fillStyle = '#66513e'; ctx.fillRect(0, 0, size, size)
    for (let x = 0; x < size; x += 42) {
      const base = 80 + rand() * 28
      ctx.fillStyle = `rgb(${base + 16},${base + 4},${Math.max(18, base - 12)})`; ctx.fillRect(x, 0, 40, size)
      ctx.strokeStyle = 'rgba(20,12,7,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, 0); ctx.lineTo(x + 40, size); ctx.stroke()
      for (let j = 0; j < 8; j++) {
        const xx = x + 5 + rand() * 30
        ctx.strokeStyle = `rgba(255,235,205,${.025 + rand() * .035})`; ctx.lineWidth = .6 + rand() * 1.2
        ctx.beginPath(); ctx.moveTo(xx, 0); ctx.bezierCurveTo(xx + rand() * 7, size * .35, xx - rand() * 6, size * .65, xx + rand() * 5, size); ctx.stroke()
      }
    }
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

export function useSurface(kind, repeatX = 1, repeatY = 1, seed = 1) {
  const key = `${kind}:${repeatX}:${repeatY}:${seed}`
  const entry = useMemo(() => {
    const cached = surfaceCache.get(key)
    if (cached) return cached
    const texture = canvasTexture(kind, seed)
    texture.repeat.set(repeatX, repeatY)
    const next = { texture, references: 0 }
    surfaceCache.set(key, next)
    return next
  }, [key, kind, repeatX, repeatY, seed])

  useEffect(() => {
    entry.references += 1
    return () => {
      entry.references -= 1
      if (entry.references === 0 && surfaceCache.get(key) === entry) {
        entry.texture.dispose()
        surfaceCache.delete(key)
      }
    }
  }, [entry, key])

  return entry.texture
}
