import * as THREE from 'three'
import { entrance, onEntranceChange, setEntranceOpen } from './entranceDoor.js'
import { DOOR_CENTRES } from './walkable.js'
import { MASTER_TERRACE_DOOR, terraceDoor, terraceDoorPose, stepTerraceDoor } from './terraceDoor.js'

/*
 * Automatic doors. Every glass door has one open amount (0 shut, 1 fully parted) and a
 * sensor: it slides open as a visitor comes near, stays open while they are anywhere in its
 * threshold, and slides shut a moment after they are clear of it - in either direction. The
 * entrance keeps its shared value in entranceDoor.js, so the Home page shows the same door.
 */
const SENSE = 1.25       // close approach to the actual threshold
const HOLD = 0.9         // seconds it waits after the visitor is clear before closing
const OPEN_RATE = 5.2    // damping toward open (fast, like a real sliding operator)
const CLOSE_RATE = 2.6   // and toward shut (slower, a soft landing)

const state = Object.fromEntries(DOOR_CENTRES.map((d) => [d.id, { open: 0, clearFor: Infinity }]))
state.entrance.open = entrance.open
onEntranceChange((v) => { state.entrance.open = v })

export const doorOpen = (id) => id === MASTER_TERRACE_DOOR.id ? terraceDoorPose(terraceDoor.progress).open : (id === 'entrance' ? entrance.open : state[id]?.open ?? 0)

/**
 * One frame of every door's sensor. `x, z` is the visitor. `entranceAuto` is false while a
 * scripted move owns the entrance (walking in from the Home page, or back out to it).
 */
export function updateDoors(x, z, dt, { entranceAuto = true } = {}) {
  stepTerraceDoor(terraceDoor, x, z, dt)
  for (const door of DOOR_CENTRES) {
    const s = state[door.id]
    const near = Math.hypot(x - door.x, z - door.z) < SENSE
    s.clearFor = near ? 0 : s.clearFor + dt
    const target = s.clearFor < HOLD ? 1 : 0
    if (door.id === 'entrance') {
      if (!entranceAuto) continue
      const next = THREE.MathUtils.damp(entrance.open, target, target > entrance.open ? OPEN_RATE : CLOSE_RATE, dt)
      if (Math.abs(next - entrance.open) > 1e-4) setEntranceOpen(Math.abs(next - target) < 1e-3 ? target : next)
      continue
    }
    const next = THREE.MathUtils.damp(s.open, target, target > s.open ? OPEN_RATE : CLOSE_RATE, dt)
    s.open = Math.abs(next - target) < 1e-3 ? target : next
  }
}

/** Starts every room door shut (a fresh visit). */
export function resetDoors() {
  terraceDoor.progress = 0
  terraceDoor.clearFor = Infinity
  for (const door of DOOR_CENTRES) {
    if (door.id === 'entrance') continue
    state[door.id].open = 0
    state[door.id].clearFor = Infinity
  }
}
