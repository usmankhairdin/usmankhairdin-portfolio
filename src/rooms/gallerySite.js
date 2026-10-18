import { TERRACE } from '../experience/corridorLayout.js'

// Keep the authored gallery/camera frame intact. Its entire environment moves
// together, placing the tower on dry land just inland of the northern beach.
const roofCentreZ = (TERRACE.edgeZ + TERRACE.backZ) / 2
export const GALLERY_SITE = Object.freeze({ x: 90, z: -790 })
export const EXTERIOR_OFFSET = Object.freeze([-GALLERY_SITE.x, 0, roofCentreZ - GALLERY_SITE.z])
export const GALLERY_PLOT = Object.freeze({
  x0: GALLERY_SITE.x - TERRACE.half,
  x1: GALLERY_SITE.x + TERRACE.half,
  z0: TERRACE.backZ - EXTERIOR_OFFSET[2],
  z1: TERRACE.edgeZ - EXTERIOR_OFFSET[2],
})
export const galleryPlotContains = (x, z, margin = 0) =>
  x > GALLERY_PLOT.x0 - margin && x < GALLERY_PLOT.x1 + margin &&
  z > GALLERY_PLOT.z0 - margin && z < GALLERY_PLOT.z1 + margin

// A clear coastal outlook; the remaining district continues behind the tower.
export const gallerySeaViewContains = (x, z, radius = 0) =>
  Math.abs(x - GALLERY_SITE.x) < 140 + radius && z - radius < GALLERY_PLOT.z0
