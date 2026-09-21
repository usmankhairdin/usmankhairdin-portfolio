import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function drawTrackedText(ctx, text, x, y, tracking, align = 'left') {
  const glyphs = [...text]
  const widths = glyphs.map(g => ctx.measureText(g).width)
  const total = widths.reduce((sum, w) => sum + w, 0) + Math.max(0, glyphs.length - 1) * tracking
  let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  glyphs.forEach((glyph, i) => {
    ctx.strokeText(glyph, cursor, y)
    ctx.fillText(glyph, cursor, y)
    cursor += widths[i] + tracking
  })
}

export default function CanvasLabel({
  text,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1,
  height = .15,
  fontSize = 44,
  tracking = 5,
  color = '#4d3729',
  strokeColor = 'rgba(255,255,255,.08)',
  strokeWidth = 1.2,
  align = 'center',
  opacity = 1,
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 160
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = color
    const x = align === 'left' ? 34 : align === 'right' ? canvas.width - 34 : canvas.width / 2
    drawTrackedText(ctx, String(text), x, canvas.height / 2, tracking, align)
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.minFilter = THREE.LinearFilter
    map.magFilter = THREE.LinearFilter
    map.generateMipmaps = true
    map.anisotropy = 4
    map.needsUpdate = true
    return map
  }, [text, fontSize, tracking, color, strokeColor, strokeWidth, align])

  useEffect(() => () => texture.dispose(), [texture])

  return <mesh position={position} rotation={rotation} renderOrder={3}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
  </mesh>
}
