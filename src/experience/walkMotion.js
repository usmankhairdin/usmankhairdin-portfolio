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
export const WALK = { vMax: 4.2 * CORRIDOR_SCALE, accel: 4.0 * CORRIDOR_SCALE, decel: 5.0 * CORRIDOR_SCALE }
export const WALK_TOUCH = { vMax: 6.5 * CORRIDOR_SCALE, accel: 10 * CORRIDOR_SCALE, decel: 7.5 * CORRIDOR_SCALE }

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
 * Moves `track.value` toward `track.target` (both in metres) like a walker: limited
 * acceleration and an eased stop, settling exactly instead of creeping forever.
 */
export function walkToward(track, k, dt) {
  const d = track.target - track.value
  if ((Math.abs(d) < 0.012 && Math.abs(track.vel) < 0.35) || (Math.abs(d) < 0.03 && Math.sign(d) !== Math.sign(track.vel) && Math.abs(track.vel) < 0.6)) {
    track.vel = 0
    track.value = track.target
    return
  }
  const desired = Math.sign(d) * Math.min(k.vMax, Math.sqrt(2 * k.decel * Math.abs(d)))
  const dv = desired - track.vel
  const a = Math.abs(desired) < Math.abs(track.vel) ? k.decel : k.accel
  track.vel += clamp(dv, -a * dt, a * dt)
  const step = track.vel * dt
  // never overshoot the target in a single long frame
  track.value = Math.abs(step) >= Math.abs(d) && Math.sign(step) === Math.sign(d) ? track.target : track.value + step
}

/**
 * Human camera motion for one frame: step bob, weight shift, a hint of roll and nod, scaled
 * by walking speed; above a brisk walk the camera glides like a steadicam instead of bobbing
 * harder. Idle breathing keeps a standing visitor alive. Returns offsets in metres / radians.
 */
export function stepMotion(state, moved, dt, time, reducedMotion) {
  state.speed = THREE.MathUtils.damp(state.speed, moved / Math.max(dt, 1e-4), 5, dt)
  if (reducedMotion) return { bobY: 0, sway: 0, roll: 0, nod: 0, breath: 0 }
  const walking = smoothRange(0.08, 1.35, state.speed)
  const glide = smoothRange(2.4 * CORRIDOR_SCALE, 5.0 * CORRIDOR_SCALE, state.speed)
  const walk = walking * (1 - glide * 0.8)
  state.phase += (moved / (0.74 + glide * 0.7)) * Math.PI
  const phase = state.phase
  return {
    bobY: (Math.abs(Math.sin(phase)) - 0.6) * 0.03 * walk,
    sway: Math.sin(phase) * 0.014 * walk,
    roll: Math.sin(phase) * 0.004 * walk,
    nod: Math.sin(phase * 2) * 0.0035 * walk,
    breath: Math.sin(time * 0.85) * 0.004 + Math.sin(time * 0.37) * 0.002,
  }
}
