import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LAST_ROOM, WALKER_RADIUS } from './corridorLayout.js'
import { motionEase } from './doorSystem.js'

// The right-hand 6..9m window bay, in the master room and in the shared world.
// A normal hinged leaf with fixed sidelights/transom replaces its lower glass.
export const MASTER_TERRACE_DOOR = Object.freeze({
  id: 'contact-terrace', roomX: LAST_ROOM.depth, x: 7.5, z: LAST_ROOM.endZ,
  width: 1.42, height: 2.8, floor: -.075, frame: .045,
  maxAngle: Math.PI * 100 / 180,
})
const clamp = value => Math.min(1, Math.max(0, value))
export const createTerraceDoorState = () => ({ progress: 0, clearFor: Infinity })
export const terraceDoor = createTerraceDoorState()

export function terraceDoorPose(progress) {
  const open = motionEase(clamp((progress - .18) / .82))
  return { open, angle: open * MASTER_TERRACE_DOOR.maxAngle,
    handle: progress <= 0 ? 0 : -.45 * motionEase(clamp(progress / .18)) }
}

/** Circle versus the actual hinged leaf segment, including its glass edge. */
export function terraceLeafBlocks(x, z, open, radius = WALKER_RADIUS) {
  const d = MASTER_TERRACE_DOOR, angle = clamp(open) * d.maxAngle
  const hx = d.x-d.width/2+.04, hz = d.z+.008, width=d.width-.08
  const dx = Math.cos(angle)*width, dz = -Math.sin(angle)*width
  const t = clamp(((x-hx)*dx+(z-hz)*dz)/(width*width))
  return Math.hypot(x-hx-t*dx,z-hz-t*dz) < radius+.023
}

// A close visitor waits outside the leaf's sweep while the handle turns.
// Without this clearance, walking into a partly opening outward door pins
// the leaf against the visitor and neither can finish passing the threshold.
export function terraceApproachBlocks(x,z,open,radius=WALKER_RADIUS){
  const d=MASTER_TERRACE_DOOR
  if(open>=1 || z>=d.z)return false
  const hx=d.x-d.width/2+.04,hz=d.z+.008,width=d.width-.08
  const dx=x-hx,dz=hz-z,angle=Math.atan2(dz,dx)
  return (angle>=0 && angle<=d.maxAngle && Math.hypot(dx,dz)<width+radius+.023) ||
    terraceLeafBlocks(x,z,0,radius) || terraceLeafBlocks(x,z,1,radius)
}

export function stepTerraceDoor(state, x, z, elapsed) {
  const dt = Math.max(0, Math.min(.1, elapsed))
  // The outside approach includes the leaf's physical outward sweep. Neither
  // side activates from across the room or the helipad.
  const depth = z - MASTER_TERRACE_DOOR.z
  const reach = depth < 0 ? 2.1 : 1.25
  const near = Math.hypot(x - MASTER_TERRACE_DOOR.x, depth) < reach
  state.clearFor = near ? 0 : state.clearFor + dt
  const target = state.clearFor < 1.2
  const next = target ? Math.min(1, state.progress + dt / 1.25) : Math.max(0, state.progress - dt / 1.9)
  const before=terraceDoorPose(state.progress).open, after=terraceDoorPose(next).open
  if(after===before || !terraceLeafBlocks(x,z,after)) state.progress=next
}

/** Fixed glazing, in facade XY coordinates, with continuous whole-wall UVs. */
export function createFacadeGlazingGeometry() {
  const d = MASTER_TERRACE_DOOR, left = d.x - d.width / 2, right = d.x + d.width / 2
  const bottom = .03, top = 5.73, doorTop = d.floor + d.height
  const pieces = [[-12,left,bottom,top],[right,12,bottom,top],[left,right,doorTop,top]].map(([x0,x1,y0,y1]) => {
    const g = new THREE.PlaneGeometry(x1-x0,y1-y0).translate((x0+x1)/2,(y0+y1)/2,0)
    const p = g.attributes.position, uv = g.attributes.uv
    for(let i=0;i<p.count;i++) uv.setXY(i,(p.getX(i)+12)/24,(p.getY(i)-bottom)/(top-bottom))
    return g
  })
  const merged = mergeGeometries(pieces)
  pieces.forEach(g=>g.dispose())
  return merged
}
