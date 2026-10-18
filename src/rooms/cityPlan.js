import { END_Z, TERRACE } from '../experience/corridorLayout.js'

/*
 * The city below the Contact hall: its plan and its traffic. Pure data and arithmetic - the
 * drawing is CityView.jsx.
 *
 * City space: x across (as the world), d = metres out from the hall's glass (world z = GLASS_Z
 * - d), the street at y = CITY_Y. Directly below the glass is the building's forecourt, then a
 * boulevard running along the glass; avenues run away from it, every block, the one on the
 * hall's centre line straight out to the horizon; cross streets run parallel to the boulevard.
 * Traffic keeps to the left, as at home in Lahore.
 *
 * The city lies all round our own tower, on which the whole building stands: past the
 * boulevard's near side too the blocks carry on, round the tower's plot (SITE, in plan space:
 * |x| < x, d0 < d < d1), which is the tower itself, its top level with the building's floors.
 */
export const CITY_Y = -96
export const GLASS_Z = END_Z - 17.9
// our own tower: its plot in plan space, its top just under the building's floors
export const SITE = { x: TERRACE.half, d0: GLASS_Z - TERRACE.edgeZ, d1: GLASS_Z - TERRACE.backZ }
// The approved city's source lots use a stable reservation. Resizing the
// gallery roof must not consume a different sequence of city random numbers
// and silently regenerate every later building. The real tower uses SITE.
const SOURCE_SITE = Object.freeze({ x:42, d0:-99, d1:28 })
export const TOWER_TOP = -CITY_Y - 0.1
export const BLOCK = 80
export const BLVD = { d: 24, half: 13, walk: 5, lanes: 3, lane: 3.3, median: 1.6 }
export const AVENUE = { half: 8.6, walk: 4.5, lanes: 2, lane: 3.3 }        // x = m * BLOCK
export const MAIN_AVENUE = { half: 11, walk: 5, lanes: 3, lane: 3.2 }       // x = 0
export const STREET = { half: 7, walk: 4, lanes: 1, lane: 3.4 }             // d = BLVD.d + n * BLOCK
export const AVENUES = { from: -7, to: 7 }
export const STREETS = 12
export const REACH = { x: 720, d: 1150, back: -880 }     // how far the streets run: across, out ahead, back behind
export const NEAR_STREETS = 9                             // cross streets behind the boulevard, round the tower
export const POLE_SPACING = 30
export const POLE_HEIGHT = 9

export const avenueOf = (m) => (m === 0 ? MAIN_AVENUE : AVENUE)
export const streetOf = (n) => (n === 0 ? BLVD : STREET)
export const streetD = (n) => BLVD.d + n * BLOCK
export const worldZ = (d) => GLASS_Z - d

export function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ the buildings */
/*
 * Each block between the streets is cut into lots, and each lot gets a building: shops along
 * the street, offices in glass, apartments in stone or brick. Downtown (well out, a little to
 * the right) the towers rise; near the hall they stay low enough to see over.
 * style: 0 curtain-wall glass, 1 punched stone, 2 dark glass between fins, 3 brick apartments
 */
const inSite = (x0, x1, d0, d1) => x1 > -SOURCE_SITE.x && x0 < SOURCE_SITE.x && d1 > SOURCE_SITE.d0 && d0 < SOURCE_SITE.d1

export function layoutBuildings(seed = 20261012) {
  const rnd = mulberry32(seed)
  const boxes = []
  const rounds = []
  const roofs = []
  const beacons = []
  const tops = []
  for (let m = AVENUES.from - 1; m <= AVENUES.to; m++) {
    const a0 = avenueOf(m)
    const a1 = avenueOf(m + 1)
    const x0 = m * BLOCK + a0.half + a0.walk + 1
    const x1 = (m + 1) * BLOCK - a1.half - a1.walk - 1
    for (let n = -9; n < STREETS; n++) {
      const s0 = streetOf(n)
      const s1 = streetOf(n + 1)
      const d0 = streetD(n) + s0.half + s0.walk + 1
      const d1 = streetD(n + 1) - s1.half - s1.walk - 1
      const cx = (x0 + x1) / 2
      const cd = (d0 + d1) / 2
      // downtown rises well out beyond the hall's glass, and again behind the building's front
      const downtown = Math.exp(-((cx - 90) ** 2 + (cd - 640) ** 2) / (2 * 300 * 300)) + 0.9 * Math.exp(-((cx + 140) ** 2 + (cd + 420) ** 2) / (2 * 240 * 240))
      const near = Math.min(1, Math.max(0, (Math.abs(cd + 50) - 110) / 260))   // 0 right round the tower
      // cut the block into lots
      const lots = []
      const split = rnd()
      if (split < 0.25) lots.push([x0, x1, d0, d1])
      else if (split < 0.5) { const sx = x0 + (x1 - x0) * (0.4 + rnd() * 0.2); lots.push([x0, sx, d0, d1], [sx, x1, d0, d1]) }
      else if (split < 0.7) { const sd = d0 + (d1 - d0) * (0.4 + rnd() * 0.2); lots.push([x0, x1, d0, sd], [x0, x1, sd, d1]) }
      else {
        const sx = x0 + (x1 - x0) * (0.42 + rnd() * 0.16)
        const sd = d0 + (d1 - d0) * (0.42 + rnd() * 0.16)
        lots.push([x0, sx, d0, sd], [sx, x1, d0, sd], [x0, sx, sd, d1], [sx, x1, sd, d1])
      }
      for (const [lx0, lx1, ld0, ld1] of lots) {
        if (rnd() < 0.05) continue                                   // a car park or a small square
        if (inSite(lx0 - 3, lx1 + 3, ld0 - 3, ld1 + 3)) continue
        const gap = 0.6 + rnd() * 1.4
        const w = lx1 - lx0 - gap
        const dd = ld1 - ld0 - gap
        const x = (lx0 + lx1) / 2
        const d = (ld0 + ld1) / 2
        const area = Math.sqrt(w * dd)
        let h = 14 + Math.pow(rnd(), 1.8) * 46 * (0.45 + near * 0.8) + downtown * Math.pow(rnd(), 1.2) * 230 * (area / 40)
        // before the hall's glass the blocks stay low, so its view runs out over them; round the
        // rest of the tower a few rise past the terrace
        if (cd > 0 && cd < 200) h = Math.min(h, 22 + rnd() * 40)
        else if (Math.abs(cd + 50) < 200) h = rnd() < 0.3 ? Math.max(h, 100 + rnd() * 80) : Math.min(h, 30 + rnd() * 45)
        // The corridor's own 96 m tower is the sole landmark above the city.
        h = Math.min(h, 76)
        const style = h > 70 ? (rnd() < 0.55 ? 0 : rnd() < 0.5 ? 2 : 1) : (rnd() < 0.45 ? 3 : rnd() < 0.6 ? 1 : rnd() < 0.5 ? 0 : 2)
        const storey = style === 3 ? 3.0 + rnd() * 0.3 : style === 1 ? 3.3 + rnd() * 0.4 : 3.7 + rnd() * 0.5
        const bay = style === 0 ? 1.5 + rnd() * 0.3 : style === 2 ? 2.2 + rnd() * 0.8 : style === 3 ? 3.0 + rnd() * 0.8 : 2.6 + rnd() * 0.8
        const lit = style === 0 || style === 2 ? 0.12 + rnd() * 0.26 : 0.1 + rnd() * 0.22
        const warm = style === 3 ? 0.8 + rnd() * 0.2 : style === 1 ? 0.55 + rnd() * 0.35 : 0.12 + rnd() * 0.35
        const seed = rnd()
        const shops = h < 160 || rnd() < 0.5 ? 1 : 0
        const z = worldZ(d)
        const info = (s, crown = 0) => ({ anchor: [x,z], a: [seed, s, storey, bay], b: [lit, warm, shops, crown] })
        if (h > 48 && rnd() < 0.8) {
          // a podium of shops, and the tower set back on it
          const podium = Math.round((8 + rnd() * 7) / storey) * storey
          boxes.push({ x, z, y: 0, w, d: dd, h: podium, ...info(rnd() < 0.5 ? 1 : style) })
          roofs.push(...roofUnits(rnd, x, z, w * 0.9, dd * 0.9, podium, 2))
          const inset = 3 + rnd() * 5
          let tw = w - inset * 2
          let td = dd - inset * 2
          const rest = h - podium
          if (downtown > 0.35 && rest > 120 && rnd() < 0.18) {
            const r = Math.min(tw, td) / 2
            rounds.push({ x, z, y: podium, w: r * 2, d: r * 2, h: rest * 0.86, ...info(0) })
            rounds.push({ x, z, y: podium + rest * 0.86, w: r * 1.5, d: r * 1.5, h: rest * 0.14, ...info(0, 1) })
            tops.push({ x, z, h: h + 1 })
            continue
          }
          const tiers = rest > 150 ? [[0.55, 1], [0.27, 0.8], [0.18, 0.58]] : rest > 80 ? [[0.7, 1], [0.3, 0.76]] : [[1, 1]]
          let y = podium
          tiers.forEach(([share, k], t) => {
            const crown = t === tiers.length - 1 && rest > 140 && rnd() < 0.55 ? 1 : 0
            const th = Math.max(storey, Math.round((rest * share) / storey) * storey)
            boxes.push({ x, z, y, w: tw * k, d: td * k, h: th, ...info(style, crown) })
            y += th
            if (t < tiers.length - 1) roofs.push(...roofUnits(rnd, x, z, tw * k, td * k, y, 1))
          })
          roofs.push(...roofUnits(rnd, x, z, tw * tiers[tiers.length - 1][1], td * tiers[tiers.length - 1][1], y, 3))
          if (y > 150 && rnd() < 0.5) {
            const mast = 14 + rnd() * 24
            roofs.push({ x, z, y, w: 0.8, d: 0.8, h: mast, anchor:[x,z] })
            beacons.push({ x, z, y: y + mast + 0.6, anchor:[x,z] })
          } else if (y > 90) beacons.push({ x: x + tw * 0.3, z, y: y + 4.5, anchor:[x,z] })
          tops.push({ x, z, h: y })
        } else {
          const hh = Math.max(storey * 3, Math.round(h / storey) * storey)
          boxes.push({ x, z, y: 0, w, d: dd, h: hh, ...info(style) })
          roofs.push(...roofUnits(rnd, x, z, w, dd, hh, style === 3 ? 4 : 2))
          tops.push({ x, z, h: hh })
        }
      }
    }
  }
  // our own tower: offices in glass, its top level with the building's floors
  boxes.push({ x: 0, z: worldZ((SITE.d0 + SITE.d1) / 2), y: 0, w: SITE.x * 2, d: SITE.d1 - SITE.d0, h: TOWER_TOP, a: [0.37, 0, 3.9, 1.6], b: [0.34, 0.3, 1, 0] })
  return { boxes, rounds, roofs, beacons }
}

// plant rooms, tanks and lift overruns on a roof
function roofUnits(rnd, x, z, w, d, y, count) {
  const out = []
  const n = Math.floor(rnd() * (count + 1))
  for (let i = 0; i < n; i++) {
    const uw = 2 + rnd() * Math.min(9, w * 0.3)
    const ud = 2 + rnd() * Math.min(9, d * 0.3)
    out.push({ x: x + (rnd() - 0.5) * (w - uw - 2), z: z + (rnd() - 0.5) * (d - ud - 2), y, w: uw, d: ud, h: 1.5 + rnd() * 3.5, anchor:[x,z] })
  }
  return out
}

/* ------------------------------------------------------------------ streetlights and trees */
export function layoutStreetFurniture() {
  const rnd = mulberry32(77)
  const poles = []      // { x, z, warm }
  const trees = []      // { x, z, r, h }
  // along each avenue, both kerbs, from the boulevard out
  for (let m = AVENUES.from; m <= AVENUES.to; m++) {
    const a = avenueOf(m)
    for (let d = BLVD.d + BLVD.half + 8; d < REACH.d; d += POLE_SPACING) {
      for (const s of [-1, 1]) poles.push({ x: m * BLOCK + s * (a.half + 0.7), z: worldZ(d + (s > 0 ? POLE_SPACING / 2 : 0)), warm: 0 })
    }
    if (Math.abs(m) <= 1) {
      for (let d = BLVD.d + BLVD.half + 6; d < 700; d += 11) {
        for (const s of [-1, 1]) if (rnd() < 0.92) trees.push({ x: m * BLOCK + s * (a.half + a.walk - 1.4), z: worldZ(d + rnd() * 2), r: 2.2 + rnd() * 1.1, h: 5 + rnd() * 2 })
      }
    }
  }
  // round the tower, the avenues carry on back past it on the near side
  for (let m = AVENUES.from; m <= AVENUES.to; m++) {
    const a = avenueOf(m)
    for (let d = BLVD.d - BLVD.half - 8; d > -360; d -= POLE_SPACING) {
      for (const s of [-1, 1]) {
        const x = m * BLOCK + s * (a.half + 0.7)
        if (!inSite(x - 1, x + 1, d - 1, d + 1)) poles.push({ x, z: worldZ(d), warm: 0 })
      }
    }
  }
  // the boulevard and the cross streets, both kerbs
  for (let n = -9; n <= STREETS; n++) {
    const st = streetOf(n)
    for (let x = -REACH.x; x < REACH.x; x += POLE_SPACING) {
      for (const s of [-1, 1]) {
        const px = x + (s > 0 ? POLE_SPACING / 2 : 0)
        const d = streetD(n) + s * (st.half + 0.7)
        if (!inSite(px - 1, px + 1, d - 1, d + 1)) poles.push({ x: px, z: worldZ(d), warm: n === 0 ? 0 : 1 })
      }
    }
  }
  // the boulevard's trees: both pavements and the median
  for (let x = -REACH.x + 4; x < REACH.x; x += 10) {
    for (const off of [-(BLVD.half + BLVD.walk - 1.5), BLVD.half + BLVD.walk - 1.5]) {
      if (rnd() < 0.9) trees.push({ x: x + rnd() * 2, z: worldZ(BLVD.d + off), r: 2.4 + rnd() * 1.2, h: 5.5 + rnd() * 2 })
    }
  }
  return { poles, trees }
}

/* ------------------------------------------------------------------ traffic */
/*
 * Every lane carries its own queue of vehicles. Each drives by the intelligent-driver model:
 * it keeps its own pace, closes up behind the one ahead and brakes for it, and stops at the
 * line when the lights ahead are red. Cars, buses and motorbikes, each at its own pace.
 *
 * Every street round the tower carries traffic, on both sides of the boulevard. Nothing
 * appears or vanishes in sight: traffic coming along an avenue turns onto the boulevard
 * (mostly left, some right); some of the boulevard's traffic turns off along the avenues; far
 * out of sight an avenue's traffic turns round and comes back, and the boulevard and the cross
 * streets run on past either side of the view. Streets that meet our tower pass under it.
 */
export const KIND = { car: 0, bus: 1, bike: 2 }
const LENGTH = [4.5, 12, 2.1]
const CYCLE = 40           // a signal cycle: along x [0, 17), amber to 20; along the avenues [21, 37), amber to 40
const TURN_R = 7           // turning radius at a junction, metres
const TURN_SPEED = 5.5

export function lightState(t, m, n, along) {
  const p = (((t + m * 7.3 + n * 11.1) % CYCLE) + CYCLE) % CYCLE
  if (along === 'x') return p < 17 ? 'green' : p < 20 ? 'amber' : 'red'
  return p >= 21 && p < 37 ? 'green' : p >= 37 ? 'amber' : 'red'
}

// a lane's driving coordinate s <-> city coordinates
const laneXY = (lane, s) => (lane.axis === 'x'
  ? { x: lane.dir > 0 ? s : -s, d: lane.at }
  : { x: lane.at, d: lane.dir > 0 ? s : -s })
const laneS = (lane, x, d) => (lane.axis === 'x' ? (lane.dir > 0 ? x : -x) : (lane.dir > 0 ? d : -d))
const laneYaw = (lane) => (lane.axis === 'x' ? (lane.dir > 0 ? 0 : Math.PI) : (lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2))

// Centre-line tangencies are independent of vehicle length. Triggering on a vehicle's nose
// makes short vehicles reach the corner before steering, collapsing their turning radius.
function laneTurn(from, to, radius = TURN_R) {
  const cross = from.axis === 'x' ? { x: to.at, d: from.at } : { x: from.at, d: to.at }
  return { to, radius, s: laneS(from, cross.x, cross.d) - radius, toS: laneS(to, cross.x, cross.d) + radius }
}

const vehicleTurn = (lane, route, car) => car.kind === KIND.bus && route.radius < 11 ? laneTurn(lane, route.to, 11) : route

export function createTraffic(seed = 9) {
  const rnd = mulberry32(seed)
  const lanes = []
  const addLane = (lane) => { lane.vehicles = []; lanes.push(lane); return lane }
  // the boulevard and the cross streets run along x; the half nearer the hall carries -x (keep left)
  const boulevardOut = []           // the boulevard's +x lanes, median outward
  const boulevardIn = []            // and its -x lanes, on the hall's side
  for (let n = -NEAR_STREETS; n <= Math.min(STREETS, 9); n++) {
    const st = streetOf(n)
    const inner = n === 0 ? BLVD.median : 0
    for (let i = 0; i < st.lanes; i++) {
      const off = inner + st.lane * (i + 0.5)
      const back = addLane({ axis: 'x', at: streetD(n) - off, dir: -1, n, from: -REACH.x, to: REACH.x, density: n === 0 ? 1 : 0.5 })
      const out = addLane({ axis: 'x', at: streetD(n) + off, dir: 1, n, from: -REACH.x, to: REACH.x, density: n === 0 ? 1 : 0.5 })
      if (n === 0) { boulevardIn.push(back); boulevardOut.push(out) }
    }
  }
  const turnOff = (lane, turn) => { (lane.turnsOff = lane.turnsOff || []).push(turn) }
  // The avenues run along d, on both sides of the boulevard; keeping left, traffic heading +d is
  // on the -x side. On each side a lane heads away from the boulevard (it turns round far out of
  // sight into its twin) and one heads back to it, to turn onto it.
  for (let m = AVENUES.from; m <= AVENUES.to; m++) {
    const av = avenueOf(m)
    const lanesEach = m === 0 ? MAIN_AVENUE.lanes : 1
    const density = m === 0 ? 1 : 0.55
    const outer = BLVD.lanes - 1
    for (const side of [1, -1]) {
      // side 1: out ahead of the hall's glass; side -1: back behind, round the tower
      const from = side > 0 ? BLVD.d + BLVD.half : REACH.back
      const to = side > 0 ? REACH.d : BLVD.d - BLVD.half
      const away = []
      const toward = []
      for (let i = 0; i < lanesEach; i++) {
        const off = (m === 0 ? 1.2 : 0) + av.lane * (i + 0.5)
        away.push(addLane({ axis: 'd', at: m * BLOCK - side * off, dir: side, m, from, to, density }))
        toward.push(addLane({ axis: 'd', at: m * BLOCK + side * off, dir: -side, m, from, to, density }))
      }
      away.forEach((lane, i) => { lane.farEnd = toward[i] })
      // lane for lane, as at a real junction: the leftmost lanes turn into and out of the
      // boulevard's outer lanes on this side; the innermost may turn right across the median
      const near = side > 0 ? boulevardOut : boulevardIn
      const far = side > 0 ? boulevardIn : boulevardOut
      for (let i = 0; i < lanesEach; i++) {
        const j = outer - (lanesEach - 1 - i)
        const right = i === 0 ? (lanesEach === 1 ? 0.45 : 0.8) : 0
        toward[i].endTurn = { left: laneTurn(toward[i], near[j]), right: laneTurn(toward[i], far[1], TURN_R * 1.3), chance: right }
        turnOff(near[j], laneTurn(near[j], away[i]))
      }
      // from the far side of the boulevard, a right turn across it, out along this side
      turnOff(far[1], laneTurn(far[1], away[0], TURN_R * 1.3))
    }
  }
  const feeds = lanes.filter((l) => l.endTurn)
  for (const lane of [...boulevardOut, ...boulevardIn]) {
    lane.turnsOff = (lane.turnsOff || []).sort((a, b) => a.s - b.s)
    lane.feeds = feeds
  }
  // where each lane must stop: a line before every crossing on it, and the signal that governs it
  for (const lane of lanes) {
    lane.stops = []
    if (lane.axis === 'x') {
      for (let m = AVENUES.from; m <= AVENUES.to; m++) {
        const av = avenueOf(m)
        const line = m * BLOCK - lane.dir * (av.half + 5)
        lane.stops.push({ s: lane.dir > 0 ? line : -line, m, n: lane.n, along: 'x' })
      }
    } else {
      for (let n = -NEAR_STREETS; n <= STREETS; n++) {
        const st = streetOf(n)
        const line = streetD(n) - lane.dir * (st.half + 5)
        if (line < lane.from - 1 || line > lane.to + 6) continue
        lane.stops.push({ s: lane.dir > 0 ? line : -line, m: lane.m, n, along: 'd' })
      }
    }
    lane.stops.sort((a, b) => a.s - b.s)
    lane.s0 = lane.dir > 0 ? lane.from : -lane.to
    lane.s1 = lane.dir > 0 ? lane.to : -lane.from
    // fill it, nose to tail with gaps, from the far end back
    const entry = lane.endTurn ? Math.min(lane.s1, lane.endTurn.left.s, laneTurn(lane, lane.endTurn.left.to, 11).s) : lane.s1
    let s = entry - 4 - rnd() * 20
    while (s > lane.s0) {
      const kind = rnd() < 0.06 ? KIND.bus : rnd() < 0.15 ? KIND.bike : KIND.car
      lane.vehicles.push(makeVehicle(rnd, kind, s))
      s -= LENGTH[kind] + (14 + rnd() * 60) / lane.density
    }
  }
  // the boulevard takes in every avenue's traffic; past the edge of the view it hands back any
  // it has above its own share to the far ends of the avenues, so no street silts up
  for (const lane of lanes) lane.share = Math.max(4, lane.vehicles.length)
  return { lanes, turning: [], rnd, time: rnd() * CYCLE, count: lanes.reduce((a, l) => a + l.vehicles.length, 0) }
}

const CAR_PAINT = [
  [0.82, 0.82, 0.8], [0.8, 0.8, 0.78], [0.78, 0.78, 0.76],      // white
  [0.02, 0.02, 0.022], [0.025, 0.025, 0.03],                     // black
  [0.32, 0.33, 0.35], [0.45, 0.46, 0.48], [0.2, 0.21, 0.23],     // greys and silver
  [0.05, 0.1, 0.32], [0.45, 0.04, 0.03], [0.4, 0.33, 0.24], [0.06, 0.14, 0.09],
]
function makeVehicle(rnd, kind, s) {
  const paint = kind === KIND.bus ? [[0.75, 0.75, 0.72], [0.08, 0.2, 0.55], [0.55, 0.06, 0.05]][Math.floor(rnd() * 3)]
    : kind === KIND.bike ? [[0.03, 0.03, 0.035], [0.4, 0.05, 0.04], [0.3, 0.3, 0.32]][Math.floor(rnd() * 3)]
      : CAR_PAINT[Math.floor(rnd() * CAR_PAINT.length)]
  const v0 = kind === KIND.bus ? 8 + rnd() * 2.5 : kind === KIND.bike ? 9 + rnd() * 6 : 10 + rnd() * 6
  return { kind, s, v: v0 * (0.5 + rnd() * 0.5), v0, len: LENGTH[kind], paint, brake: 0, light:[.55+rnd()*.95,rnd(),rnd()] }
}

// room for a vehicle at s in a lane? (vehicles are kept nose-first, s falling)
function insertAt(lane, car, s) {
  const vs = lane.vehicles
  let i = 0
  while (i < vs.length && vs[i].s > s) i++
  const ahead = vs[i - 1]
  const behind = vs[i]
  if (ahead && ahead.s - ahead.len / 2 - (s + car.len / 2) < 5) return false
  if (behind && s - car.len / 2 - (behind.s + behind.len / 2) < 6) return false
  car.s = s
  vs.splice(i, 0, car)
  return true
}

function startTurn(traffic, car, fromLane, route, dt) {
  const { to, toS, radius, s } = route
  const a = laneXY(fromLane, s)
  const b = laneXY(to, toS)
  const incoming = { x: fromLane.axis === 'x' ? fromLane.dir : 0, d: fromLane.axis === 'd' ? fromLane.dir : 0 }
  const outgoing = { x: to.axis === 'x' ? to.dir : 0, d: to.axis === 'd' ? to.dir : 0 }
  const centre = { x: a.x + outgoing.x * radius, d: a.d + outgoing.d * radius }
  const angle = Math.atan2(a.d - centre.d, a.x - centre.x)
  const sweep = Math.sign(incoming.x * outgoing.d - incoming.d * outgoing.x) * Math.PI / 2
  const speed = Math.max(0.3, car.v)
  // The lane has already advanced this frame. Only its unused fraction belongs to the arc.
  const remaining = Math.max(0, (car.s - s) / speed)
  car.s = s
  traffic.turning.push({ car, a, b, centre, angle, sweep, radius, speed, fromS: s, t: remaining - dt, T: radius * Math.PI / (2 * speed), from: fromLane, to, toS })
}

const turnBusy = (traffic, lane) => traffic.turning.some((tr) => tr.from === lane && (tr.t < tr.T * 0.6 || tr.t >= tr.T))

/** One step of every lane. */
export function stepTraffic(traffic, dt) {
  traffic.time += dt
  const t = traffic.time
  const rnd = traffic.rnd
  const A = 1.4
  const B = 2.4
  for (const lane of traffic.lanes) {
    const vs = lane.vehicles
    for (let i = 0; i < vs.length; i++) {
      const car = vs[i]
      const lead = i > 0 ? vs[i - 1] : null
      if (lane.endTurn && !car.turnTo) {
        const end = lane.endTurn
        car.turnTo = vehicleTurn(lane, car.kind !== KIND.bus && rnd() < end.chance ? end.right : end.left, car)
      }
      // Choose a junction before reaching it so deceleration and steering share one route.
      if (!car.turnTo && lane.turnsOff?.length) {
        for (const turn of lane.turnsOff) {
          const candidate = vehicleTurn(lane, turn, car)
          if (candidate.s <= car.s || candidate.s - car.s > 35 || car.turnDecision === turn) continue
          car.turnDecision = turn
          const pull = Math.min(3, Math.max(0.4, turn.to.share / Math.max(1, turn.to.vehicles.length)))
          const push = Math.min(2.5, Math.max(0.5, vs.length / lane.share))
          if (rnd() < Math.min(0.9, 0.3 * pull * push)) car.turnTo = candidate
          break
        }
      }
      let gap = lead ? lead.s - lead.len / 2 - (car.s + car.len / 2) : 1e4
      let dv = lead ? car.v - lead.v : 0
      // the next stop line ahead, if its light says stop
      for (const stop of lane.stops) {
        if (stop.s < car.s + car.len / 2 - 0.5) continue
        const ahead = stop.s - (car.s + car.len / 2)
        if (ahead > 90) break
        const light = lightState(t, stop.m, stop.n, stop.along)
        const canStop = ahead > (car.v * car.v) / (2 * B) - 1
        if ((light === 'red' || (light === 'amber' && canStop)) && ahead < gap) { gap = Math.max(0.1, ahead); dv = car.v }
        break
      }
      // the end of a lane that turns: slow to turning pace before it, and wait while the one
      // before is still in the turn
      const turn = car.turnTo
      const wait = turn && turnBusy(traffic, lane)
      if (wait && turn.s - car.s < gap) { gap = Math.max(0.1, turn.s - car.s); dv = car.v }
      const pace = turn ? Math.min(car.v0, Math.sqrt(TURN_SPEED ** 2 + 2 * B * Math.max(0, turn.s - car.s))) : car.v0
      const sStar = 2 + car.v * 1.2 + (car.v * dv) / (2 * Math.sqrt(A * B))
      const acc = A * (1 - (car.v / pace) ** 4 - (Math.max(0, sStar) / Math.max(gap, 0.1)) ** 2)
      car.v = Math.max(0, car.v + Math.max(-8, acc) * dt)
      car.s += car.v * dt
      if (wait && car.s >= turn.s) { car.s = turn.s - 0.01; car.v = 0 }
      car.brake = acc < -0.6 || car.v < 0.3 ? 1 : 0
      if (turn && car.s >= turn.s && !wait) {
        car.turnTo = null
        car.turnDecision = null
        vs.splice(i, 1)
        i--
        startTurn(traffic, car, lane, turn, dt)
      }
    }
    // the far end of the lane
    while (!lane.endTurn && vs.length && vs[0].s > lane.s1 + 20) {
      const car = vs[0]
      if (lane.farEnd) {
        // out of sight: round into the lane coming back
        if (!insertAt(lane.farEnd, car, lane.farEnd.s0 + rnd() * 20)) break
        vs.shift()
        car.v = car.v0 * 0.7
      } else {
        // the boulevard and the cross streets: on round, far beyond the view
        if (lane.feeds && vs.length > lane.share) {
          // the avenue that is emptiest for its size takes it
          let back = null
          for (const f of lane.feeds) if (!back || f.vehicles.length / f.share < back.vehicles.length / back.share) back = f
          if (back && insertAt(back, car, back.s0 + rnd() * 30)) { vs.shift(); car.v = car.v0 * 0.7; continue }
        }
        vs.shift()
        const last = vs[vs.length - 1]
        car.s = Math.min(lane.s0 - 10 - rnd() * 40, last ? last.s - last.len - 12 : lane.s0)
        car.v = car.v0 * 0.8
        vs.push(car)
      }
    }
  }
  // vehicles in the middle of a turn, and those waiting at its end to join their lane
  for (let i = traffic.turning.length - 1; i >= 0; i--) {
    const turn = traffic.turning[i]
    turn.t = Math.max(0, turn.t + dt)
    if (turn.t >= turn.T) {
      if (insertAt(turn.to, turn.car, turn.toS + (turn.t - turn.T) * turn.speed)) {
        turn.car.v = turn.speed
        traffic.turning.splice(i, 1)
      } else { turn.t = turn.T; turn.car.v = 0 }
    }
  }
}

/** True where a street passes under our tower: the vehicles there are out of sight. */
export const underTower = (x, z) => Math.abs(x) < SITE.x && GLASS_Z - z > SITE.d0 && GLASS_Z - z < SITE.d1

/** Where a vehicle is: world x, z and heading (yaw, the nose along local +x). */
export function placeOf(lane, car, out) {
  const p = laneXY(lane, car.s)
  out.x = p.x
  out.z = worldZ(p.d)
  out.yaw = laneYaw(lane)
  return out
}

/** Where a turning vehicle is, on its curve from one lane into the next. */
export function placeTurning(turn, out) {
  const angle = turn.angle + Math.min(1, Math.max(0, turn.t / turn.T)) * turn.sweep
  out.x = turn.centre.x + Math.cos(angle) * turn.radius
  out.z = worldZ(turn.centre.d + Math.sin(angle) * turn.radius)
  // The radius rotated a quarter turn in the sweep direction is the velocity tangent.
  out.yaw = angle + Math.sign(turn.sweep) * Math.PI / 2
  return out
}
