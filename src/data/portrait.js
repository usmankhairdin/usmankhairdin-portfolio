// Original, untouched transparent portrait. Backgrounds and display crops are
// separate from these source pixels on both the Web and immersive surfaces.
export const portrait = Object.freeze({
  src: '/assets/about/usman-latest.png',
  width: 1086,
  height: 1448,
  zoom: 1.45,
})

// Texture coordinates start at the bottom: keep the top of a chest-up crop.
export function portraitTextureCrop(width, height) {
  const imageAspect = portrait.width / portrait.height
  const frameAspect = width / height
  const repeatX = Math.min(1, frameAspect / imageAspect) / portrait.zoom
  const repeatY = Math.min(1, imageAspect / frameAspect) / portrait.zoom
  return { repeatX, repeatY, offsetX: (1 - repeatX) / 2, offsetY: 1 - repeatY }
}
