import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTraffic, stepTraffic, placeOf, placeTurning, KIND } from '../src/rooms/cityPlan.js'

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z)
const angleBetween = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

test('a bus already past a wider turn entry continues forward instead of snapping back into it', () => {
  const traffic = createTraffic()
  for (const lane of traffic.lanes) { lane.vehicles = []; lane.stops = [] }
  traffic.rnd = () => 0
  const lane = traffic.lanes.find(l => l.axis === 'x' && l.dir === 1 && l.turnsOff?.length)
  const car = { kind: KIND.bus, len: 12, v: 5.5, v0: 5.5, s: lane.turnsOff[0].s - 2, brake: 0 }
  lane.vehicles.push(car)
  const before = placeOf(lane, car, {})
  stepTraffic(traffic, 1/60)
  const turn = traffic.turning.find(t => t.car === car)
  const after = turn ? placeTurning(turn, {}) : placeOf(lane, car, {})
  assert.ok(after.x >= before.x, 'Late route choice never moves the bus backwards')
  assert.ok(distance(before, after) < 0.1, 'Late route choice never teleports to an earlier tangent')
})

function junction(kind, axis = 'd', dir = -1, right = false) {
  const traffic = createTraffic()
  for (const lane of traffic.lanes) { lane.vehicles = []; lane.stops = [] }
  traffic.rnd = () => right || axis === 'x' ? 0 : 0.99
  const lane = traffic.lanes.find(l => l.axis === axis && l.dir === dir && (axis === 'd' ? l.m === 1 && l.endTurn : l.turnsOff?.length))
  const car = { kind, len: [4.5, 12, 2.1][kind], v: 5.5, v0: 5.5, s: axis === 'd' ? lane.s1 - 40 : lane.turnsOff[0].s - 40, brake: 0 }
  lane.vehicles.push(car)
  for (let i = 0; i < 20000; i++) {
    stepTraffic(traffic, 1 / 240)
    if (traffic.turning.length) return { traffic, lane, car, turn: traffic.turning[0] }
  }
  assert.fail('Vehicle must reach the junction')
}

for (const [name, kind] of Object.entries(KIND)) {
  for (const [axis, dir, right] of [['d', -1, false], ['d', 1, false], ['d', -1, true], ['d', 1, true], ['x', -1, false], ['x', 1, false]]) {
  if (kind === KIND.bus && right) continue // buses use the left-turn route at avenue ends
  test(`${name} ${axis}/${dir} ${right ? 'right' : 'left'} turn has tangent seams and constant speed`, () => {
    const { lane, car, turn } = junction(kind, axis, dir, right)
    const samples = []
    for (let i = 0; i <= 200; i++) {
      turn.t = turn.T * i / 200
      samples.push(placeTurning(turn, {}))
    }
    const entry = placeOf(lane, { ...car, s: turn.fromS ?? car.s }, {})
    assert.ok(distance(entry, samples[0]) < 1e-8, 'Curve begins on the incoming lane')
    assert.ok(angleBetween(entry.yaw, samples[0].yaw) < 1e-8, 'Entry heading matches incoming lane')
    const exit = placeOf(turn.to, { ...car, s: turn.toS }, {})
    assert.ok(distance(exit, samples.at(-1)) < 1e-8, 'Curve ends on the outgoing lane')
    assert.ok(angleBetween(exit.yaw, samples.at(-1).yaw) < 1e-8, 'Exit heading matches outgoing lane')
    const steps = samples.slice(1).map((p, i) => distance(p, samples[i]))
    assert.ok(Math.max(...steps) / Math.min(...steps) < 1.02, 'Turn speed stays constant instead of easing abruptly')
    for (let i = 1; i < samples.length; i++) {
      const yaw = angleBetween(samples[i].yaw, samples[i - 1].yaw)
      assert.ok(yaw < 0.03, 'Heading changes gradually throughout the turn')
      if (yaw > 1e-6) assert.ok(steps[i - 1] / yaw > (kind === KIND.bus ? 10.5 : 6), 'Turning radius does not collapse at the lane exit')
    }
  })
  }
  test(`${name} uses each timestep once when leaving a turn`, () => {
    const { traffic, car, turn } = junction(kind)
    const dt = 1 / 60
    let previous = placeTurning(turn, {})
    let speed = car.v
    let joined = false
    for (let i = 0; i < 1000; i++) {
      stepTraffic(traffic, dt)
      const currentTurn = traffic.turning.find(t => t.car === car)
      const currentLane = traffic.lanes.find(l => l.vehicles.includes(car))
      const next = currentTurn ? placeTurning(currentTurn, {}) : placeOf(currentLane, car, {})
      assert.ok(distance(previous, next) <= Math.max(speed, car.v) * dt * 1.01 + 1e-8, 'No extra timestep or position snap at handoff')
      assert.ok(angleBetween(previous.yaw, next.yaw) < 0.03, 'No heading snap when joining the outgoing lane')
      previous = next; speed = car.v
      if (currentLane) { joined = true; break }
    }
    assert.ok(joined, 'Vehicle completes its turn')
  })
}
