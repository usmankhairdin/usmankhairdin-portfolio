import * as THREE from 'three'

/*
 * The head: where it looks (`yaw` 0 faces down the corridor, -z; positive turns left). The
 * captured mouse turns it at once; the cursor's lean on the terrace, a drag on a touch screen
 * and a menu walk turn it with a short soft follow, so it moves smoothly and stops when they stop.
 */
// Game style: with the mouse captured, each pixel the mouse moves turns the view by the angle
// one pixel covers at the middle of the screen, where the dot is - so what the dot rests on
// moves exactly as many pixels as the mouse did, all the way round, at once.
const HALF_FOV = (31 * Math.PI) / 180
const PITCH_LIMIT = 1.32       // about 75 degrees up or down
// The head eases into a turn and out of it (a critically damped spring) and keeps up with the
// hand: it settles about a third of a second after the cursor stops, and is never held back by a
// speed limit, so it never goes on turning after the hand has stopped.
const SPRING = 16.0            // natural frequency (1/s)
const MAX_TURN = 12.0          // radians per second: only a guard against a runaway value

export const look = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0, vYaw: 0, vPitch: 0, locked: false, dragging: false }
const drag = { id: null, x: 0, y: 0, moved: 0 }

const perPixel = () => (2 * Math.tan(HALF_FOV)) / Math.max(1, window.innerHeight)
const turn = (dx, dy) => {
  const k = perPixel()
  look.targetYaw -= dx * k
  look.targetPitch = THREE.MathUtils.clamp(look.targetPitch - dy * k, -PITCH_LIMIT, PITCH_LIMIT)
}

/** Pointer movement: with the mouse captured it turns the head at once, exactly as far as the hand moved; otherwise only a drag turns it. */
export function lookMove(e) {
  if (look.locked) {
    // Chrome on Windows sometimes reports one bogus jump of hundreds of pixels as the mouse is
    // captured; no hand moves that far in a single event, so such a jump is ignored
    if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return
    turn(e.movementX || 0, e.movementY || 0)
    look.yaw = look.targetYaw
    look.pitch = look.targetPitch
    look.vYaw = look.vPitch = 0
    return
  }
  if (drag.id === null || e.pointerId !== drag.id) return
  if (e.buttons === 0) { lookDragEnd(); return }
  drag.moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y)
  if (drag.moved > 4) look.dragging = true
  if (look.dragging) turn(e.clientX - drag.x, e.clientY - drag.y)
  drag.x = e.clientX
  drag.y = e.clientY
}

export function lookDragStart(e) {
  drag.id = e.pointerId
  drag.x = e.clientX
  drag.y = e.clientY
  drag.moved = 0
}

export function lookDragEnd() {
  drag.id = null
  // let the click that ends a drag pass as part of the drag, not as a click
  if (look.dragging) window.setTimeout(() => { look.dragging = false }, 0)
}

const spring = (x, v, target, dt) => {
  const a = SPRING * SPRING * (target - x) - 2 * SPRING * v
  const nv = THREE.MathUtils.clamp(v + a * dt, -MAX_TURN, MAX_TURN)
  return [x + nv * dt, nv]
}

/** One frame: the head turns toward where it is asked to look, as a head turns. */
export function stepLook(dt) {
  // a few small steps keep the spring exact on a long frame
  const n = Math.max(1, Math.ceil(dt / (1 / 120)))
  const h = dt / n
  for (let i = 0; i < n; i++) {
    ;[look.yaw, look.vYaw] = spring(look.yaw, look.vYaw, look.targetYaw, h)
    ;[look.pitch, look.vPitch] = spring(look.pitch, look.vPitch, look.targetPitch, h)
  }
}

/** Points the head (instantly) along a heading - used when a scripted move hands over. */
export function setLook(yaw, pitch = 0) {
  look.yaw = look.targetYaw = yaw
  look.pitch = look.targetPitch = pitch
  look.vYaw = look.vPitch = 0
}

/** Turns the head smoothly toward a heading - used while walking someone to a room. */
export function steerLook(yaw, dt, rate = 3.2) {
  let d = yaw - look.targetYaw
  d = Math.atan2(Math.sin(d), Math.cos(d))
  look.targetYaw += d * (1 - Math.exp(-rate * dt))
  look.targetPitch += (0 - look.targetPitch) * (1 - Math.exp(-rate * dt))
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ')
/** The head's orientation, with the walking step's roll and nod. */
export function headQuaternion(q, roll = 0, nod = 0) {
  euler.set(look.pitch + nod, look.yaw, roll)
  return q.setFromEuler(euler)
}

/** The horizontal direction the visitor faces: [x, z]. */
export const heading = () => [-Math.sin(look.yaw), -Math.cos(look.yaw)]
