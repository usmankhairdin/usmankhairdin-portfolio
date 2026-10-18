import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LEAD_M, METERS_PER_PX, WALK, WALK_TOUCH, stepMotion, walkToward } from '../src/experience/walkMotion.js'

function sampleGait(speed, dt = 1 / 120) {
  const state = { speed: 0, phase: 0 }
  const samples = []
  for (let frame = 0; frame < Math.round(8 / dt); frame++) {
    const motion = stepMotion(state, speed * dt, dt, frame * dt, false)
    if (frame * dt >= 1) samples.push(motion)
  }
  return samples
}

test('a short scroll accelerates into its distance instead of snapping to the target', () => {
  const track = { value: 0, target: 0.01, vel: 0 }
  walkToward(track, WALK, 1 / 60)
  assert.ok(track.value > 0 && track.value < track.target)
  assert.ok(track.vel > 0)
})

test('walking brakes within its acceleration budget all the way to a settled stop', () => {
  for (const tuning of [WALK, WALK_TOUCH]) {
    const track = { value: 0, target: 1, vel: 0 }
    const dt = 1 / 60
    for (let frame = 0; frame < 600; frame++) {
      const before = track.vel
      walkToward(track, tuning, dt)
      assert.ok(Math.abs(track.vel - before) <= Math.max(tuning.accel, tuning.decel) * dt + 1e-8,
        `velocity jumped from ${before} to ${track.vel}`)
      assert.ok(track.value >= 0 && track.value <= 1.0001)
    }
    assert.ok(Math.abs(track.value - 1) < 0.0001)
    assert.equal(track.vel, 0)
  }
})

test('reversing scroll brakes before smoothly stepping backward', () => {
  const track = { value: 0, target: 2, vel: 0 }
  for (let frame = 0; frame < 20; frame++) walkToward(track, WALK, 1 / 60)
  const forwardVelocity = track.vel
  track.target = track.value - 1
  walkToward(track, WALK, 1 / 60)
  assert.ok(track.vel > 0 && track.vel < forwardVelocity)
  for (let frame = 0; frame < 600; frame++) walkToward(track, WALK, 1 / 60)
  assert.ok(Math.abs(track.value - track.target) < 0.0001)
  assert.equal(track.vel, 0)
})

test('walking covers the same distance at 30 and 120 frames per second', () => {
  const run = dt => {
    const track = { value: 0, target: 10, vel: 0 }
    for (let time = 0; time < 1 - dt / 2; time += dt) walkToward(track, WALK, dt)
    return track
  }
  const slow = run(1 / 30)
  const fast = run(1 / 120)
  assert.ok(Math.abs(slow.value - fast.value) < 0.025)
  assert.ok(Math.abs(slow.vel - fast.vel) < 0.025)
})

test('the walking rise has a continuous slope through each footfall', () => {
  const at = phase => stepMotion({ speed: 1.6, phase }, 0, 0, 0, false).bobY
  const epsilon = 0.0001
  const before = (at(0) - at(-epsilon)) / epsilon
  const after = (at(epsilon) - at(0)) / epsilon
  assert.ok(Math.abs(before - after) < 0.001)
})

test('slow, ordinary and brisk travel each have a visible two to four centimetre step rise', () => {
  for (const speed of [0.6, 1.4, 3.4]) {
    const samples = sampleGait(speed)
    const rise = Math.max(...samples.map(s => s.bobY)) - Math.min(...samples.map(s => s.bobY))
    assert.ok(rise >= 0.02 && rise <= 0.04, `${speed} m/s has only ${rise * 1000} mm of rise`)
  }
})

test('step cadence stays legible as the walker lengthens their stride at brisk speed', () => {
  const dt = 1 / 120
  for (const [speed, minimum, maximum] of [[0.6, 1.3, 1.8], [1.4, 1.7, 2.2], [3.4, 2.6, 2.95]]) {
    const samples = sampleGait(speed, dt)
    const peaks = []
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i].bobY > samples[i - 1].bobY && samples[i].bobY >= samples[i + 1].bobY) peaks.push(i)
    }
    const cadence = (peaks.length - 1) / ((peaks.at(-1) - peaks[0]) * dt)
    assert.ok(cadence >= minimum && cadence <= maximum, `${speed} m/s produces ${cadence} steps/s`)
  }
})

test('successive ordinary footsteps transfer weight to opposite sides without camera rotation', () => {
  const samples = sampleGait(1.4)
  const peaks = samples.filter((s, i) => i > 0 && i < samples.length - 1
    && s.bobY > samples[i - 1].bobY && s.bobY >= samples[i + 1].bobY)
  assert.ok(peaks.length > 8)
  for (let i = 0; i < peaks.length; i++) {
    assert.ok(Math.abs(peaks[i].sway) >= 0.006 && Math.abs(peaks[i].sway) <= 0.01)
    if (i > 0) assert.ok(peaks[i].sway * peaks[i - 1].sway < 0)
  }
})

test('grounded walking bounds translation and never shakes the viewing angle', () => {
  const state = { speed: 0, phase: 0 }
  for (let frame = 0; frame < 600; frame++) {
    const motion = stepMotion(state, 2.2 / 60, 1 / 60, frame / 60, false)
    assert.ok(Math.abs(motion.bobY) <= 0.02)
    assert.ok(Math.abs(motion.sway) <= 0.01)
    assert.equal(motion.roll, 0)
    assert.equal(motion.nod, 0)
    assert.equal(motion.breath, 0)
  }
})

test('gait has the same pose at 30 and 120 fps through speed changes and a stop', () => {
  const run = dt => {
    const state = { speed: 0, phase: 0 }
    const poses = []
    for (const speed of [0.6, 1.4, 3.4, 0]) {
      let motion
      for (let frame = 0; frame < Math.round(1 / dt); frame++) motion = stepMotion(state, speed * dt, dt, 0, false)
      poses.push({ ...motion, phase: state.phase })
    }
    return poses
  }
  const slow = run(1 / 30)
  const fast = run(1 / 120)
  for (let i = 0; i < slow.length; i++) {
    assert.ok(Math.abs(slow[i].phase - fast[i].phase) < 0.001)
    assert.ok(Math.abs(slow[i].bobY - fast[i].bobY) < 0.0001)
    assert.ok(Math.abs(slow[i].sway - fast[i].sway) < 0.0001)
  }
})

test('a wheel sequence keeps perceptible smooth footsteps while accelerating and braking', () => {
  const track = { value: 0, target: 0, vel: 0 }
  const state = { speed: 0, phase: 0 }
  const samples = []
  let before = { bobY: 0, sway: 0 }
  let motion
  for (let frame = 0; frame < 480; frame++) {
    if (frame < 180 && frame % 12 === 0) {
      track.target = Math.min(track.value + LEAD_M, track.target + 120 * METERS_PER_PX)
    }
    const value = track.value
    walkToward(track, WALK, 1 / 60)
    motion = stepMotion(state, Math.abs(track.value - value), 1 / 60, frame / 60, false)
    assert.ok(Math.abs(motion.bobY - before.bobY) < 0.006, `footstep jolted on frame ${frame}`)
    assert.ok(Math.abs(motion.sway - before.sway) < 0.002)
    if (frame >= 60 && frame < 180) samples.push(motion.bobY)
    before = motion
  }
  assert.ok(Math.max(...samples) - Math.min(...samples) >= 0.03)
  for (const offset of Object.values(motion)) assert.ok(Math.abs(offset) < 0.00001)
})

test('gait phase advances with ground travel and freezes when a wall prevents movement', () => {
  const state = { speed: 1.4, phase: 0.7 }
  stepMotion(state, 0.1, 1 / 60, 0, false)
  assert.ok(state.phase > 0.7)
  const phase = state.phase
  for (let frame = 0; frame < 120; frame++) stepMotion(state, 0, 1 / 60, frame / 60, false)
  assert.equal(state.phase, phase)
})

test('standing settles to eye height and reduced motion suppresses every gait offset', () => {
  const state = { speed: 2, phase: 0.7 }
  let motion
  for (let frame = 0; frame < 300; frame++) motion = stepMotion(state, 0, 1 / 60, frame / 60, false)
  for (const offset of Object.values(motion)) assert.ok(Math.abs(offset) < 0.00001)
  assert.deepEqual(stepMotion(state, 0.1, 1 / 60, 10, true), { bobY: 0, sway: 0, roll: 0, nod: 0, breath: 0 })
})
