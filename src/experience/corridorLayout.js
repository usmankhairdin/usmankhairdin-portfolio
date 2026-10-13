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

// Outside: the whole building stands on top of a tower, high over the city (the Contact hall
// looks down on its streets). The building's front stands proud of the entrance wall, so the
// door sits in a deep reveal, and before it the tower's roof is a terrace to its glass railing.
// The visitor arrives standing on the terrace, facing the door, and can walk all over it.
export const FACADE_Z = START_Z + 0.9         // the front's outer face
export const PLAZA_STAND_Z = START_Z + 6.4    // where the visitor arrives
export const TERRACE = { half: 34, edgeZ: FACADE_Z + 18 }
// on the terrace: the Web Experience sign, and the lamps along the railing
export const SIGN = { x: 2.85, z: FACADE_Z + 1.35, rotY: -0.55, w: 0.82, h: 2.05, d: 0.16, panel: { w: 0.66, h: 0.9, y: 1.42 } }
export const TERRACE_LAMPS = [[-9, 14.5], [9, 14.5], [-23, 14.5], [23, 14.5]]

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
