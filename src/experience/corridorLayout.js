/*
 * The corridor's plan, stated once for everything that depends on it: the walls and floor
 * (Corridor.jsx), where a visitor can walk (walkable.js) and where each room stands.
 *
 * Three rooms open off the sides - About, Services, Work - evenly spaced and alternating, and
 * the Contact hall lies straight ahead through the door in the end wall. World frame: the
 * corridor's centre line is x = 0, the walk goes toward -z, the floor is at y = -0.075.
 */
export const START_Z = 14.2           // the entrance wall
export const END_Z = -48              // the end wall, with the Contact door in it
export const WALKER_RADIUS = .38

// Outside: the whole building stands on top of a tower, high over the city (the Contact hall
// looks down on its streets). The building's front stands proud of the entrance wall, so the
// door sits in a deep reveal, and the tower's roof is a terrace inside a solid parapet.
// The visitor arrives standing on the terrace, facing the door, and can walk all over it.
export const FACADE_Z = START_Z + 0.9         // the front's outer face
export const PLAZA_STAND_Z = START_Z + 6.4    // where the visitor arrives
// One envelope for the visible shell, guarded roof and collision footprint.
export const BUILDING = Object.freeze({ half: 30, top: 14, frontZ: FACADE_Z, backZ: END_Z - 17.9 })
// Keep the side walks close to the gallery envelope. The former deep front
// forecourt and rear apron made each side feel like a second, longer street.
export const TERRACE = Object.freeze({ half: 42, edgeZ: FACADE_Z + 8.4, backZ: END_Z - 38 })
// One supported perimeter for the visible wall, its coping, and the walker's clearance.
// Inset measures from the deck edge to the wall centre; the coping is its widest part.
export const TERRACE_PARAPET = Object.freeze({
  inset: .26, thickness: .36, wallHeight: .78, copingWidth: .44, copingHeight: .1,
  height: 1.16, railDepth: .09, railHeight: .08, postWidth: .07, postSpacing: 2.4,
})
const parapetClearance = TERRACE_PARAPET.inset + TERRACE_PARAPET.copingWidth / 2 + WALKER_RADIUS
export const TERRACE_WALK_BOUNDS = Object.freeze({
  minX: -TERRACE.half + parapetClearance, maxX: TERRACE.half - parapetClearance,
  minZ: TERRACE.backZ + parapetClearance, maxZ: TERRACE.edgeZ - parapetClearance,
})
/** Four butt-joined runs: front/rear include the corners, side runs meet their inner faces. */
export function terraceParapetRuns(width) {
  const x = TERRACE.half - TERRACE_PARAPET.inset
  const front = TERRACE.edgeZ - TERRACE_PARAPET.inset
  const back = TERRACE.backZ + TERRACE_PARAPET.inset
  return [
    { x: 0, z: front, length: x * 2 + width, rotation: 0 },
    { x: 0, z: back, length: x * 2 + width, rotation: 0 },
    { x: -x, z: (front + back) / 2, length: front - back - width, rotation: Math.PI / 2 },
    { x, z: (front + back) / 2, length: front - back - width, rotation: Math.PI / 2 },
  ]
}
export const HELIPAD = Object.freeze({ x: 0, z: END_Z - 28, radius: 7.3 })
// on the terrace: the Web Experience sign, and the lamps along the railing
export const SIGN = { x: 2.85, z: FACADE_Z + 1.35, rotY: -0.55, w: 0.82, h: 2.05, d: 0.16, panel: { w: 0.66, h: 0.9, y: 1.42 } }
export const TERRACE_LAMPS = [[-9, 6.0], [9, 6.0], [-23, 6.0], [23, 6.0]]

// Wall installations: [side, z, kind]
export const ART = [
  ['left', -3.5, 'brief'],
  ['right', -7, 'hierarchy'],
  ['right', -15, 'responsive'],
  ['left', -24, 'states'],
  ['right', -33, 'handoff'],
  ['left', -43, 'surface'],
]

// Planters: [side, z]
export const PLANTS = [['right', -3], ['left', -29.5], ['right', -44.5]]

// Floor sculptures: [kind, [x, z]]
export const SCULPTURES = [['gauge', [-2.46, -18]], ['joint', [2.46, -40]]]

/*
 * How a door's room sits in the world. Room-local frame (as in roomCoordinates.js): +x runs
 * from the corridor's centre line through the door into the room, z along the door's wall, so
 * every room is authored once and placed by a turn about y:
 *   right-hand doors 0, left-hand doors PI, the end wall's door PI/2 (its room lies ahead).
 */
export function doorFrame(door) {
  if (door.side === 'end') return { ox: 0, oz: door.z + 3.5, rot: Math.PI / 2 }
  return { ox: 0, oz: door.z, rot: door.side === 'right' ? 0 : Math.PI }
}

/** World point -> the door's room-local [x, z]. */
export function toRoomLocal(door, x, z) {
  const { ox, oz, rot } = doorFrame(door)
  const dx = x - ox
  const dz = z - oz
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return [dx * c - dz * s, dx * s + dz * c]
}

/** Room-local point -> world [x, z]. */
export function toWorld(door, lx, lz) {
  const { ox, oz, rot } = doorFrame(door)
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return [ox + lx * c + lz * s, oz - lx * s + lz * c]
}
