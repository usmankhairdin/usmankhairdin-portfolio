import { BUILDING, HELIPAD } from '../experience/corridorLayout.js'

export const HELICOPTER_MODEL_URL = '/assets/helicopter/bell206-jetranger.glb'

// The prepared Bell 206 faces +X with its skids at y=0. Preserve real-world
// metre scale: 11.9 m overall, an approximately 11 m rotor and 3.31 m height.
// The complete stopped rotor/tail fits the pad. The nose faces the gallery at 30°.
export const HELICOPTER_PLACEMENT = Object.freeze({
  x: HELIPAD.x, y: -.075, z: HELIPAD.z, yaw: -Math.PI / 3, scale: 1,
})

// Two real wall-mounted fixtures illuminate both the aircraft and the deck.
// Positions sit on the stone piers outside the Contact room's glass opening.
export const HELIPAD_FLOODS = Object.freeze([-15,15].map(x => {
  const position = [x,4,BUILDING.backZ-.24], target = [HELIPAD.x,1.2,HELIPAD.z]
  const delta = target.map((v,i) => v-position[i]), length = Math.hypot(...delta)
  return Object.freeze({ position, target, direction: delta.map(v => v/length),
    color: [1,.88,.72], intensity: 400, outer: 40, inner: 30, range: 35 })
}))

export function helicopterWorldPoint([x, y, z], placement = HELICOPTER_PLACEMENT) {
  const c = Math.cos(placement.yaw), s = Math.sin(placement.yaw)
  return [placement.x + (c*x+s*z)*placement.scale,
    placement.y + y*placement.scale,
    placement.z + (-s*x+c*z)*placement.scale]
}

// Local metre-space envelopes for the cabin/skids and the narrow tail boom.
// The main rotor is about 3 m above the deck, so it does not stop a walker.
const FOOTPRINT = [[-1.25,3.82,-1.06,1.06], [-5.95,-1.1,-.46,.46], [-4.9,-3.7,-1.24,1.24]]

/** Visibility-graph nodes use the same rotated envelopes as physical walking. */
export function helicopterRouteCorners(walkerRadius = 0) {
  const margin = (walkerRadius+.5)/HELICOPTER_PLACEMENT.scale
  return FOOTPRINT.flatMap(([x0,x1,z0,z1]) => [
    [x0-margin,0,z0-margin], [x0-margin,0,z1+margin],
    [x1+margin,0,z0-margin], [x1+margin,0,z1+margin],
  ].map(point => {
    const [x,,z] = helicopterWorldPoint(point)
    return [x,z]
  })).filter(([x,z]) => !isHelicopterBlocked(x,z,walkerRadius+.05))
}

export function isHelicopterBlocked(x, z, walkerRadius = 0) {
  const p = HELICOPTER_PLACEMENT, c = Math.cos(p.yaw), s = Math.sin(p.yaw)
  const dx = x-p.x, dz = z-p.z
  const localX = (c*dx-s*dz)/p.scale, localZ = (s*dx+c*dz)/p.scale
  const radius = walkerRadius/p.scale
  return FOOTPRINT.some(([x0,x1,z0,z1]) => {
    const ox = Math.max(x0-localX,0,localX-x1)
    const oz = Math.max(z0-localZ,0,localZ-z1)
    return ox*ox+oz*oz <= radius*radius
  })
}
