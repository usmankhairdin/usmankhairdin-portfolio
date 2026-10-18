import { doors } from '../data/projects.js'
import { ROOM_KIND } from '../rooms/referenceRooms.js'
import { ART, BUILDING, END_Z, FACADE_Z, PLANTS, PLAZA_STAND_Z, SCULPTURES, SIGN, START_Z, TERRACE, TERRACE_LAMPS, TERRACE_WALK_BOUNDS, WALKER_RADIUS, toRoomLocal, toWorld } from './corridorLayout.js'
import { MASTER_TERRACE_DOOR, terraceDoor, terraceDoorPose, terraceLeafBlocks } from './terraceDoor.js'
import { helicopterRouteCorners, isHelicopterBlocked } from '../rooms/helicopterPlacement.js'

/*
 * Where a visitor can stand. The building is one continuous floor: the corridor, the doorways
 * (passable only while their glass doors are open), the three side rooms and the Contact hall
 * beyond the end wall, each room in its own room-local frame (see corridorLayout.js) - and,
 * outside the entrance, the deep reveal round the door and the roof terrace before it. A walker
 * is a circle of radius BODY on the floor; a step that would overlap a wall, a closed door or a
 * piece of furniture slides along it.
 */
export { START_Z, END_Z, toRoomLocal, toWorld }
export const BODY = WALKER_RADIUS
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
  contact: { depth: MASTER_TERRACE_DOOR.roomX, half: 12 },
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
// terrace inside its solid parapet, round the sign and the lamp posts.
const REVEAL_HALF = 1.67 - BODY
const SIGN_BOX = [SIGN.x - 0.6, SIGN.x + 0.6, SIGN.z - 0.5, SIGN.z + 0.5]
const LAMP_BOXES = TERRACE_LAMPS.map(([x, z]) => [x - 0.12, x + 0.12, FACADE_Z + z - 0.12, FACADE_Z + z + 0.12])
const ROOF_OBSTACLES = [[-BUILDING.half, BUILDING.half, BUILDING.backZ, FACADE_Z], SIGN_BOX, ...LAMP_BOXES]
// Routing reserves the whole outward swing, so a door opening after a route
// was planned cannot catch a passer-by. Manual passage still uses the actual leaf.
const exitHingeX=MASTER_TERRACE_DOOR.x-MASTER_TERRACE_DOOR.width/2+.04
const exitLeafWidth=MASTER_TERRACE_DOOR.width-.08
const EXIT_SWEEP=[exitHingeX+Math.cos(MASTER_TERRACE_DOOR.maxAngle)*exitLeafWidth-.05,
  exitHingeX+exitLeafWidth+.05,MASTER_TERRACE_DOOR.z-exitLeafWidth-.05,MASTER_TERRACE_DOOR.z+.05]
function inOutside(x, z) {
  if (isHelicopterBlocked(x, z, BODY)) return false
  if (Math.abs(x) < REVEAL_HALF && z > START_Z + 0.22 + BODY && z <= FACADE_Z + BODY) return true
  if (x < TERRACE_WALK_BOUNDS.minX || x > TERRACE_WALK_BOUNDS.maxX || z < TERRACE_WALK_BOUNDS.minZ || z > TERRACE_WALK_BOUNDS.maxZ) return false
  if (Math.abs(x) < BUILDING.half + BODY && z > BUILDING.backZ - BODY && z < FACADE_Z + BODY) return false
  return !inBox(x, z, SIGN_BOX, BODY) && !LAMP_BOXES.some((box) => inBox(x, z, box, BODY))
}
/** Out on the terrace, or in the reveal before the door. */
export const isOutside = (z, x = 0) => z > START_Z + 0.3 ||
  (z >= TERRACE.backZ && z <= TERRACE.edgeZ && Math.abs(x) <= TERRACE.half &&
    (Math.abs(x) >= BUILDING.half || z <= BUILDING.backZ ||
      (Math.abs(x-MASTER_TERRACE_DOOR.x) < MASTER_TERRACE_DOOR.width/2 && z <= MASTER_TERRACE_DOOR.z)))

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
  const exit = MASTER_TERRACE_DOOR
  if (terraceLeafBlocks(x,z,openOf(exit.id),BODY)) return false
  if (openOf(exit.id) > .84 && Math.abs(x-exit.x) < exit.width/2-BODY-exit.frame && Math.abs(z-exit.z) < 1.1) return true
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
 * Moves from (x, z) by (dx, dz), sliding only when a physical obstacle blocks
 * that step. Clear doorways never pull the visitor away from their chosen heading.
 */
export function slide(x, z, dx, dz, openOf, out) {
  const len = Math.hypot(dx, dz)
  // Long frames and menu travel cannot tunnel across a wall into a valid room.
  if (len > 0.18) {
    const n = Math.ceil(len / 0.18)
    const ox = x, oz = z
    for (let i = 0; i < n; i++) { slide(x, z, dx / n, dz / n, openOf, out); [x, z] = out }
    return Math.hypot(x - ox, z - oz) > 1e-8
  }
  if (isFree(x + dx, z + dz, openOf)) { out[0] = x + dx; out[1] = z + dz; return true }
  if (isFree(x + dx, z, openOf)) { out[0] = x + dx; out[1] = z; return true }
  if (isFree(x, z + dz, openOf)) { out[0] = x; out[1] = z + dz; return true }
  out[0] = x
  out[1] = z
  return false
}

/** Short visible legs round the shell and fixtures lead to the physical entrance. */
export function roofRoute(x, z) {
  const goal = [0, PLAZA_STAND_Z]
  if(inBox(x,z,EXIT_SWEEP,BODY+.1)){
    // Someone leaving the door may already stand in its reserved sweep.
    // First step away through a currently clear leg, then plan round it.
    const candidates=[[x,EXIT_SWEEP[2]-BODY-.25],[EXIT_SWEEP[0]-BODY-.25,z],[EXIT_SWEEP[1]+BODY+.25,z]]
    for(const point of candidates){
      const steps=Math.ceil(Math.hypot(point[0]-x,point[1]-z)/.05)
      let clear=true
      for(let i=0;i<=steps;i++){
        const px=x+(point[0]-x)*i/steps,pz=z+(point[1]-z)*i/steps
        const currentOpen=terraceDoorPose(terraceDoor.progress).open
        if(!isFree(px,pz,id=>id===MASTER_TERRACE_DOOR.id?currentOpen:0)){clear=false;break}
      }
      if(clear){const rest=roofRoute(...point);if(rest.length)return[point,...rest]}
    }
    return[]
  }
  const clear = (a, b) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / .1))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t
      const inThreshold = Math.abs(px) < DOOR_CLEAR - .3 && pz > START_Z && pz <= FACADE_Z + BODY
      if ((!inOutside(px, pz) && !inThreshold) || inBox(px,pz,EXIT_SWEEP,BODY+.1)) return false
    }
    return true
  }
  if (clear([x, z], goal)) return [goal]
  const corners = [...ROOF_OBSTACLES,EXIT_SWEEP].flatMap(([x0, x1, z0, z1], index) => {
    // Leave room to round a corner while the visitor's head turns toward the
    // next leg. A person does not aim at the collision boundary itself.
    const pad = BODY + (index === 0 ? 1.2 : .5)
    return [[x0-pad,z0-pad],[x0-pad,z1+pad],[x1+pad,z0-pad],[x1+pad,z1+pad]]
  }).concat(helicopterRouteCorners(BODY), [[0,z],[x,goal[1]]])
    .filter(([px,pz]) => inOutside(px,pz))
  const nodes = [[x,z], goal, ...corners]
  const distance = nodes.map(() => Infinity), previous = [], visited = new Set(), edges = new Map()
  distance[0] = 0
  for (let n = 0; n < nodes.length; n++) {
    let next = -1
    for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (next < 0 || distance[i] < distance[next])) next = i
    if (next < 0 || !Number.isFinite(distance[next])) break
    if (next === 1) {
      const path = []
      for (let i = 1; i !== 0; i = previous[i]) path.unshift(nodes[i])
      return path
    }
    visited.add(next)
    for (let i = 0; i < nodes.length; i++) {
      if (visited.has(i)) continue
      const key = [Math.min(i,next),Math.max(i,next)].join(',')
      if (!edges.has(key)) edges.set(key, clear(nodes[next],nodes[i]))
      if (!edges.get(key)) continue
      const d = distance[next] + Math.hypot(nodes[i][0]-nodes[next][0],nodes[i][1]-nodes[next][1])
      if (d < distance[i]) { distance[i] = d; previous[i] = next }
    }
  }
  return []
}

/** The waypoints that walk a visitor from where they stand to a room's entry point. */
export function routeTo(target, x, z) {
  const points = []
  if (isOutside(z, x)) {
    points.push(...roofRoute(x, z), [0, START_Z - 2])
  }
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
