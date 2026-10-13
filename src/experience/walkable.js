import { doors } from '../data/projects.js'
import { ROOM_KIND } from '../rooms/referenceRooms.js'
import { ART, END_Z, FACADE_Z, PLANTS, SCULPTURES, SIGN, START_Z, TERRACE, TERRACE_LAMPS, toRoomLocal, toWorld } from './corridorLayout.js'

/*
 * Where a visitor can stand. The building is one continuous floor: the corridor, the doorways
 * (passable only while their glass doors are open), the three side rooms and the Contact hall
 * beyond the end wall, each room in its own room-local frame (see corridorLayout.js) - and,
 * outside the entrance, the deep reveal round the door and the roof terrace before it. A walker
 * is a circle of radius BODY on the floor; a step that would overlap a wall, a closed door or a
 * piece of furniture slides along it.
 */
export { START_Z, END_Z, toRoomLocal, toWorld }
export const BODY = 0.38
const FACE_X = 3.41                 // the corridor walls' inner faces
const DOOR_CLEAR = 0.86             // half the clear width of every doorway
const ROOM_INSIDE = 3.61            // a room's door wall, room-local x

export const CORRIDOR = {
  minX: -(FACE_X - BODY),
  maxX: FACE_X - BODY,
  minZ: END_Z + 0.1 + BODY,
  maxZ: START_Z - 0.1 - BODY,
}

// interior extents (room-local) of each reference room: depth to the far wall, half width
const ROOM_SIZE = {
  about: { depth: 18.61, half: 7.5 },
  services: { depth: 18.61, half: 7.5 },
  process: { depth: 27.61, half: 5 },
  contact: { depth: 21.0, half: 12 },
}

// furniture and fittings in each room, room-local [x0, x1, z0, z1]
const arc = [50, 30, 10, -10, -30, -50].map((deg) => {
  const a = (deg * Math.PI) / 180
  const x = 6.9 + 5.4 * Math.cos(a)
  const z = -5.4 * Math.sin(a)
  return [x - 0.82, x + 0.82, z - 0.82, z + 0.82]
})
const gates = [8.81, 13.61, 18.41, 23.21].flatMap((gx) => [[gx - 0.02, gx + 0.22, 1.66, 1.96], [gx - 0.02, gx + 0.22, -1.96, -1.66]])
const ROOM_OBSTACLES = {
  about: [[8.05, 13.75, -1.45, 1.45]],                       // the table and its chairs
  services: arc,                                            // the six plinths and monoliths
  process: gates,                                           // the light gates' posts
  // reception counter, lounge, and Usman's desk by the glass with his chair (RoomExhibits UsmanDesk)
  contact: [[7.78, 8.82, -8.62, -5.38], [11.6, 14.2, 0.35, 4.85], [16.55, 18.45, -9.45, -7.8]],
}

// pieces standing in the corridor, world [x0, x1, z0, z1]
const CORRIDOR_OBSTACLES = [
  ...PLANTS.map(([side, z]) => (side === 'right' ? [2.43, 3.07, z - 0.32, z + 0.32] : [-3.07, -2.43, z - 0.32, z + 0.32])),
  ...SCULPTURES.map(([, [x, z]]) => [x - 0.5, x + 0.5, z - 0.4, z + 0.4]),
  ...ART.map(([side, z]) => (side === 'right' ? [FACE_X - 0.34, FACE_X, z - 1.35, z + 1.35] : [-FACE_X, -FACE_X + 0.34, z - 1.35, z + 1.35])),
]

export const roomKindOf = (door) => ROOM_KIND[door.id]

const inBox = (x, z, [x0, x1, z0, z1], pad = 0) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad

function inCorridor(x, z, entranceOpen) {
  if (x < CORRIDOR.minX || x > CORRIDOR.maxX || z < CORRIDOR.minZ) return false
  // the entrance: past the inside of the start wall only through its open doorway
  if (z > CORRIDOR.maxZ && !(entranceOpen > 0.8 && Math.abs(x) < DOOR_CLEAR - 0.3 && z < START_Z + 1.2)) return false
  return !CORRIDOR_OBSTACLES.some((box) => inBox(x, z, box, BODY))
}

// Outside: the reveal before the door (the door itself is the corridor's way through) and the
// terrace inside its glass railing, round the sign and the lamp posts.
const REVEAL_HALF = 1.67 - BODY
const SIGN_BOX = [SIGN.x - 0.6, SIGN.x + 0.6, SIGN.z - 0.5, SIGN.z + 0.5]
const LAMP_BOXES = TERRACE_LAMPS.map(([x, z]) => [x - 0.12, x + 0.12, FACADE_Z + z - 0.12, FACADE_Z + z + 0.12])
function inOutside(x, z) {
  if (Math.abs(x) < REVEAL_HALF && z > START_Z + 0.22 + BODY && z <= FACADE_Z + BODY) return true
  if (Math.abs(x) > TERRACE.half - 0.35 - BODY || z < FACADE_Z + BODY || z > TERRACE.edgeZ - 0.35 - BODY) return false
  return !inBox(x, z, SIGN_BOX, BODY) && !LAMP_BOXES.some((box) => inBox(x, z, box, BODY))
}
/** Out on the terrace, or in the reveal before the door. */
export const isOutside = (z) => z > START_Z + 0.3

function inDoorway(door, x, z, open) {
  if (open < 0.8) return false
  const [lx, lz] = toRoomLocal(door, x, z)
  return lx > FACE_X - BODY - 0.15 && lx < ROOM_INSIDE + BODY + 0.15 && Math.abs(lz) < DOOR_CLEAR - 0.3
}

function inRoom(door, x, z) {
  const size = ROOM_SIZE[roomKindOf(door)]
  if (!size) return false
  const [lx, lz] = toRoomLocal(door, x, z)
  if (lx < ROOM_INSIDE + BODY || lx > size.depth - BODY || Math.abs(lz) > size.half - BODY) return false
  return !ROOM_OBSTACLES[roomKindOf(door)].some((box) => inBox(lx, lz, box, BODY))
}

/** Can a walker stand at (x, z)? `openOf(id)` gives each door's open amount. */
export function isFree(x, z, openOf) {
  if (inCorridor(x, z, openOf('entrance')) || inOutside(x, z)) return true
  for (const door of doors) {
    if (inDoorway(door, x, z, openOf(door.id)) || inRoom(door, x, z)) return true
  }
  return false
}

/** Where the walker is: the room they stand in, or the corridor (doorways count as the corridor). */
export function locate(x, z) {
  for (const door of doors) {
    const size = ROOM_SIZE[roomKindOf(door)]
    const [lx, lz] = toRoomLocal(door, x, z)
    if (size && lx > ROOM_INSIDE + 0.05 && lx < size.depth && Math.abs(lz) < size.half) return door
  }
  return null
}

/**
 * Moves from (x, z) by (dx, dz), sliding along whatever is in the way. As the walker heads
 * into an open doorway a little off-centre, the opening draws them to its middle, the way a
 * person lines up with a door without thinking about it.
 */
export function slide(x, z, dx, dz, openOf, out) {
  const len = Math.hypot(dx, dz)
  for (const door of doors) {
    if (openOf(door.id) < 0.3 || len < 1e-6) continue
    const [lx, lz] = toRoomLocal(door, x, z)
    if (lx > FACE_X - 1.6 && lx < ROOM_INSIDE + 1.2 && Math.abs(lz) < DOOR_CLEAR + 0.6) {
      // the step in the door's own frame: how much of it heads through the wall
      const [ax, az] = toRoomLocal(door, x + dx, z + dz)
      const through = Math.abs(ax - lx) / len
      if (through > 0.2 || lx > FACE_X - 0.2) {
        const pull = Math.min(1, len * 1.6) * Math.min(1, Math.abs(lz)) * 0.5
        const [tx, tz] = toWorld(door, ax, az - Math.sign(lz) * pull)
        dx = tx - x
        dz = tz - z
      }
    }
  }
  if (isFree(x + dx, z + dz, openOf)) { out[0] = x + dx; out[1] = z + dz; return true }
  if (isFree(x + dx, z, openOf)) { out[0] = x + dx; out[1] = z; return true }
  if (isFree(x, z + dz, openOf)) { out[0] = x; out[1] = z + dz; return true }
  out[0] = x
  out[1] = z
  return false
}

/** The waypoints that walk a visitor from where they stand to a room's entry point. */
export function routeTo(target, x, z) {
  const points = []
  const here = locate(x, z)
  if (here && here.id === target.id) {
    points.push(toWorld(target, 7.02, 0))
    return points
  }
  if (here) {
    points.push(toWorld(here, 5.2, 0))
    points.push(toWorld(here, 1.6, 0))
  }
  points.push(toWorld(target, 1.6, 0))
  points.push(toWorld(target, 7.02, 0))
  return points
}

/** Every door the visitor can open, including the entrance, with its centre on the floor. */
export const DOOR_CENTRES = [
  { id: 'entrance', x: 0, z: START_Z },
  ...doors.map((door) => {
    const [x, z] = toWorld(door, 3.5, 0)
    return { id: door.id, x, z }
  }),
]
