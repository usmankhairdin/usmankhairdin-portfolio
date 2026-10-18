import * as THREE from 'three'

/*
 * Walking behaviour adapted from the Shahz Connect corridor (hooks/wheelMomentum.js and the
 * walkToward / step-bob logic of its CameraRig), used with the owner's permission.
 *
 * Our doors stand ~16 m apart instead of ~10 m, so distances and speeds are scaled by
 * CORRIDOR_SCALE: each door costs the same scroll effort and is reached in the same time.
 */
export const CORRIDOR_SCALE = 1.6

export const METERS_PER_PX = 0.014 * CORRIDOR_SCALE
export const LEAD_M = 1.3 * CORRIDOR_SCALE          // wheel: how far the walk target may run ahead
export const LEAD_TOUCH_M = 2.6 * CORRIDOR_SCALE    // touch: a swipe moves about as far as the finger
export const WALK = { vMax: 3.4, accel: 8.5, decel: 10.5, response: 5.5 }
export const WALK_TOUCH = { vMax: 3.8, accel: 10, decel: 12, response: 5.5 }

const clamp = THREE.MathUtils.clamp
export const smoothRange = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Trackpad / Magic Mouse momentum detection. After the fingers lift, the OS keeps sending wheel
 * events with steadily shrinking deltas. Returns a weight per event: 1 for real input, a small
 * value for the glide, so walking stops when the visitor stops scrolling. Constant-size steps
 * (ordinary mouse wheels) are never damped.
 */
export function createMomentumFilter({ gap = 140, glideWeight = 0.12 } = {}) {
  const s = { t: -Infinity, prev: 0, peak: 0, decay: 0 }
  return (dy, now = performance.now()) => {
    const a = Math.abs(dy)
    const pa = Math.abs(s.prev)
    if (now - s.t > gap || Math.sign(dy) !== Math.sign(s.prev)) {
      s.peak = a
      s.decay = 0
    } else if (a > pa * 1.12 + 1) {
      s.decay = 0
      s.peak = Math.max(a, s.peak * 0.5)
    } else if (a > pa) {
      s.decay = Math.max(0, s.decay - 1)
    } else {
      s.decay++
    }
    s.peak = Math.max(s.peak, a)
    s.t = now
    s.prev = dy
    return s.decay >= 3 && a < s.peak * 0.8 ? glideWeight : 1
  }
}

/**
 * A critically damped body follows the requested walking distance. Small wheel events
 * join the same continuous velocity; arrival never cuts off a moving body. Short
 * integration steps keep acceleration and braking consistent across frame rates.
 */
export function walkToward(track, k, dt) {
  const duration = Math.max(0, Math.min(dt, 0.1))
  const steps = Math.max(1, Math.ceil(duration * 240))
  const h = duration / steps
  const response = k.response ?? 5.5
  for (let i = 0; i < steps; i++) {
    const distance = track.target - track.value
    if (Math.abs(distance) < 0.00001 && Math.abs(track.vel) < 0.0001) {
      track.value = track.target
      track.vel = 0
      break
    }
    const force = response * response * distance - 2 * response * track.vel
    const limit = force * track.vel < 0 ? k.decel : k.accel
    const nextVelocity = clamp(track.vel + clamp(force, -limit, limit) * h, -k.vMax, k.vMax)
    track.value += (track.vel + nextVelocity) * 0.5 * h
    track.vel = nextVelocity
  }
}

/**
 * Each footfall lowers and raises the body, with left/right weight transfer over a
 * complete stride. The head keeps its viewing angle steady. Lengthen the step as ground
 * speed rises so a brisk walk remains legible, rather than turning into a rapid buzz.
 * Only real ground travel advances the feet; the envelope settles at rest.
 */
export function stepMotion(state, moved, dt, _time, reducedMotion) {
  const groundSpeed = moved / Math.max(dt, 1e-4)
  state.speed = THREE.MathUtils.damp(state.speed, groundSpeed, 8, dt)
  if (reducedMotion) return { bobY: 0, sway: 0, roll: 0, nod: 0, breath: 0 }
  const walking = smoothRange(0.04, 1.0, state.speed)
  const cadence = Math.min(1.3 + 0.45 * groundSpeed, 2.8)
  const stepLength = Math.max(0.38, groundSpeed / cadence)
  state.phase += (moved / stepLength) * Math.PI
  const phase = state.phase
  return {
    bobY: -Math.cos(phase * 2) * 0.018 * walking,
    sway: Math.sin(phase) * 0.008 * walking,
    roll: 0,
    nod: 0,
    breath: 0,
  }
}
