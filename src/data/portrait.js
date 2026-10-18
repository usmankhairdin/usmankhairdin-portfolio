// Original, untouched transparent portrait. Backgrounds and display crops are
// separate from these source pixels on both the Web and immersive surfaces.
export const portrait = Object.freeze({
  src: '/assets/about/usman-latest.png',
  width: 1086,
  height: 1448,
  zoom: 1.45,
})

const portraitBackdrops = {
  light: { base: ['#edf3ff', '#9abcf1'], glow: ['#f0f6ff', '#d8e6ff'], y: .30, stop: .42, end: .74 },
  dark: { base: ['#1b2d49', '#101d32'], glow: ['#466691', '#253e64'], y: .28, stop: .45, end: .78 },
}

export function portraitBackdropCss(theme) {
  const p = portraitBackdrops[theme] || portraitBackdrops.light
  return `radial-gradient(ellipse at 48% ${p.y * 100}%, ${p.glow[0]} 0%, ${p.glow[1]} ${p.stop * 100}%, transparent ${p.end * 100}%), linear-gradient(145deg, ${p.base.join(', ')})`
}

// The same separate backdrop as the Web portrait, painted onto the framed
// print. The night-time corridor uses the approved dark blue treatment.
export function paintPortraitBackdrop(ctx, width, height, theme = 'dark') {
  const p = portraitBackdrops[theme] || portraitBackdrops.dark
  const a = 145 * Math.PI / 180
  const length = width * Math.sin(a) + height * Math.abs(Math.cos(a))
  const dx = Math.sin(a) * length / 2, dy = -Math.cos(a) * length / 2
  const base = ctx.createLinearGradient(width / 2 - dx, height / 2 - dy, width / 2 + dx, height / 2 + dy)
  p.base.forEach((color, i) => base.addColorStop(i, color))
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  const rx = .52 * Math.SQRT2, ry = (1 - p.y) * Math.SQRT2
  ctx.translate(width * .48, height * p.y)
  ctx.scale(width * rx, height * ry)
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  glow.addColorStop(0, p.glow[0])
  glow.addColorStop(p.stop, p.glow[1])
  glow.addColorStop(p.end, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(-.48 / rx, -p.y / ry, 1 / rx, 1 / ry)
  ctx.restore()
}

// Texture coordinates start at the bottom: keep the top of a chest-up crop.
export function portraitTextureCrop(width, height) {
  const imageAspect = portrait.width / portrait.height
  const frameAspect = width / height
  const repeatX = Math.min(1, frameAspect / imageAspect) / portrait.zoom
  const repeatY = Math.min(1, imageAspect / frameAspect) / portrait.zoom
  return { repeatX, repeatY, offsetX: (1 - repeatX) / 2, offsetY: 1 - repeatY }
}
