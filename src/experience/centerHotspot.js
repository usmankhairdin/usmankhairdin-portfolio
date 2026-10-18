// Hotspots are already projected from the real door/sign corners by the
// camera. Resolve the fixed reticle against those rectangles, not the mouse.
export function centerHotspot(hotspots, width, height) {
  const x = width / 2, y = height / 2
  return hotspots.find(({ rect }) => rect.width > 0 && rect.height > 0
    && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)?.element || null
}
