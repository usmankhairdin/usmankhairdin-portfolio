// All visible facade construction comes from Poly Haven's 3 x 3 metre kit.
// Families vary actual openings, bay rhythms, floors and projecting mouldings.
const windowPair = name => [`wall_window_${name}`, `window_${name}`]
const hotelPair = name => [`wall_door_window_${name}`, `door_window_${name}`]
export const ARCHITECTURE_FAMILIES = [
  { id: 'limestone-classical', bay: 3.85, storey: 3.7, crown: .23, corniceEvery: 2, pierEvery: 3, pierWidth: 1.4,
    windows: [windowPair('centered_large_03'), windowPair('centered_small_03')], palette: [1.28, 1.26, 1.14], trim: [1.5, 1.47, 1.34], glass: [.65, .78, .9] },
  { id: 'red-masonry', bay: 3.45, storey: 3.3, crown: .08, corniceEvery: 4, pierEvery: 0, pierWidth: .9,
    windows: [windowPair('centered_small_02'), windowPair('offset_small_03'), windowPair('offset_small_04')], palette: [1.05, .46, .35], trim: [.65, .69, .73], glass: [.59, .73, .83] },
  { id: 'pale-concrete', bay: 4.7, storey: 3.4, crown: .055, corniceEvery: 1, pierEvery: 4, pierWidth: .9,
    windows: [windowPair('centered_double_02'), windowPair('centered_large_02')], palette: [1.42, 1.46, 1.48], trim: [.72, .79, .85], glass: [.57, .72, .83] },
  { id: 'steel-glass-office', bay: 4.45, storey: 4.15, crown: .025, corniceEvery: 5, pierEvery: 1, pierWidth: .6,
    windows: [windowPair('centered_double_01'), windowPair('centered_large_01')], palette: [.36, .53, .69], trim: [1.2, 1.34, 1.43], glass: [.46, .72, .97] },
  { id: 'hotel-juliet', bay: 4.05, storey: 3.55, crown: .12, corniceEvery: 1, pierEvery: 2, pierWidth: 1.25,
    windows: [hotelPair('small_05'), hotelPair('small_07')], palette: [1.2, 1.23, 1.22], trim: [.52, .62, .68], glass: [.75, .8, .81] },
  { id: 'charcoal-modern', bay: 4.3, storey: 3.65, crown: .045, corniceEvery: 3, pierEvery: 2, pierWidth: 1.9,
    windows: [windowPair('offset_small_05'), windowPair('offset_small_06'), windowPair('centered_double_03')], palette: [.36, .40, .45], trim: [.81, .88, .94], glass: [.5, .69, .83] },
]
export const SOURCE_MODULES = [...new Set([
  ...ARCHITECTURE_FAMILIES.flatMap(family => family.windows.flat()),
  'wall_door_centered_large_01', 'door_centered_large_01',
  'cornice_standard_standard_01', 'crown_standard_standard_01', 'base_standard_01',
  'wall_pier_standard_01', 'wall_pier_corner_01', 'crown_pier_pedestal_01',
])]
export function realBuildingEligible(b) {
  return [b.x, b.z, b.y, b.w, b.d, b.h].every(Number.isFinite) && b.w > 0 && b.d > 0 && b.h > 0
}
export const realRoundEligible = realBuildingEligible

export function buildingDistanceSquared(b, eye) {
  const c = Math.cos(b.yaw || 0), s = Math.sin(b.yaw || 0)
  const x = eye.x - b.x, z = eye.z - b.z
  const dx = Math.max(0, Math.abs(c*x-s*z) - b.w / 2)
  const dz = Math.max(0, Math.abs(s*x+c*z) - b.d / 2)
  const dy = Math.max(0, b.y - eye.y, eye.y - b.y - b.h)
  return dx * dx + dy * dy + dz * dz
}

/** Conservative world bounds for a rigid lot, shared by culling and allocation. */
export function buildingPlanBounds(b, padding = 0) {
  const c = Math.abs(Math.cos(b.yaw || 0)), s = Math.abs(Math.sin(b.yaw || 0))
  const halfX = (c*b.w+s*b.d)/2+padding, halfZ = (s*b.w+c*b.d)/2+padding
  return { minX:b.x-halfX, maxX:b.x+halfX, minZ:b.z-halfZ, maxZ:b.z+halfZ }
}

// Every lot has a persistent opaque far body. Distance only swaps its detail.
export function architectureLod(b, eye, nearDistance) {
  return buildingDistanceSquared(b, eye) < nearDistance * nearDistance ? 1 : 2
}

// Upper bound for a camera anywhere in one spatial cell. Unlike a citywide
// allocation this scales with the densest actual near neighborhood. Vertical
// distance and the view frustum can only reduce the instances needed further.
export function neighborhoodInstanceCapacity(entries, buildings, radius, cellSize = 128) {
  const cells = new Map()
  let maximum = 0
  for (const { buildingIndex, count } of entries) {
    const b = buildings[buildingIndex]
    const { minX:left, maxX:right, minZ:back, maxZ:front } = buildingPlanBounds(b)
    for (let x = Math.floor((left - radius) / cellSize); x <= Math.floor((right + radius) / cellSize); x++) {
      const dx = Math.max(0, left - (x + 1) * cellSize, x * cellSize - right)
      for (let z = Math.floor((back - radius) / cellSize); z <= Math.floor((front + radius) / cellSize); z++) {
        const dz = Math.max(0, back - (z + 1) * cellSize, z * cellSize - front)
        if (dx * dx + dz * dz > radius * radius) continue
        const key = `${x},${z}`, value = (cells.get(key) || 0) + count
        cells.set(key, value)
        maximum = Math.max(maximum, value)
      }
    }
  }
  return maximum
}

function lotHash(x, z) {
  let hash = Math.imul(Math.round(x * 100), 73856093) ^ Math.imul(Math.round(z * 100), 19349663)
  hash ^= hash >>> 16
  hash = Math.imul(hash, 2246822507)
  hash ^= hash >>> 13
  return hash >>> 0
}
function planStoreys(b) {
  const [ax, az] = b.anchor || [b.x, b.z]
  const hash = lotHash(ax, az)
  const familyIndex = hash % ARCHITECTURE_FAMILIES.length
  const family = ARCHITECTURE_FAMILIES[familyIndex]
  const paletteSeed = ((hash >>> 5) % 10007) / 10007
  const rhythmSeed = ((hash >>> 9) % 101) / 101
  const floors = Math.max(1, Math.round(b.h / (family.storey * (.94 + rhythmSeed * .12))))
  const floorHeight = b.h / (floors + family.crown)
  return { ...b, baseY: b.y, family, familyIndex, paletteSeed, rhythmSeed, floors, floorHeight, crownHeight: floorHeight * family.crown }
}

function orientFaces(b, faces) {
  const yaw = b.yaw || 0, c = Math.cos(yaw), s = Math.sin(yaw)
  return faces.map(face => {
    const x = face.x-b.x, z = face.z-b.z, [nx,ny,nz] = face.normal
    return { ...face, x:b.x+c*x+s*z, z:b.z-s*x+c*z, yaw:face.yaw+yaw,
      normal:[c*nx+s*nz,ny,-s*nx+c*nz] }
  })
}
export function planRealBuilding(b) {
  const plan = planStoreys(b)
  const face = (length, x, z, yaw, normal) => {
    const bays = Math.max(1, Math.ceil(length / (plan.family.bay * (.94 + plan.rhythmSeed * .12))))
    return { length, bays, bayWidth: length / bays, x, z, yaw, normal }
  }
  return {
    ...plan, shape: 'box',
    faces: orientFaces(b, [
      face(b.w, b.x - b.w / 2, b.z + b.d / 2, 0, [0, 0, 1]),
      face(b.d, b.x + b.w / 2, b.z + b.d / 2, Math.PI / 2, [1, 0, 0]),
      face(b.w, b.x + b.w / 2, b.z - b.d / 2, Math.PI, [0, 0, -1]),
      face(b.d, b.x - b.w / 2, b.z - b.d / 2, -Math.PI / 2, [-1, 0, 0]),
    ]),
  }
}
export function planRealRound(b) {
  const plan = planStoreys(b)
  const rx = b.w / 2, rz = b.d / 2
  const circumference = Math.PI * (3 * (rx + rz) - Math.sqrt((3 * rx + rz) * (rx + 3 * rz)))
  const count = Math.max(8, Math.ceil(circumference / plan.family.bay))
  const faces = []
  for (let i = 0; i < count; i++) {
    const angle = i * Math.PI * 2 / count, next = (i + 1) * Math.PI * 2 / count
    const x = b.x + rx * Math.cos(angle), z = b.z - rz * Math.sin(angle)
    const dx = rx * (Math.cos(next) - Math.cos(angle)), dz = -rz * (Math.sin(next) - Math.sin(angle))
    const length = Math.hypot(dx, dz), yaw = Math.atan2(-dz, dx)
    faces.push({ x, z, length, yaw, bays: 1, bayWidth: length, normal: [-dz / length, 0, dx / length] })
  }
  return { ...plan, shape: 'round', faces:orientFaces(b,faces) }
}

// A continuous recessed interior prevents any frame/opening simplification from
// revealing the opposite facade. Round cores follow the same polygon as their
// facade chords; a smooth ellipse would protrude through those flat walls.
export function planStructuralCore(b) {
  const apothem = Math.min(...b.faces.map(face =>
    (face.x - b.x) * face.normal[0] + (face.z - b.z) * face.normal[2]))
  const scale = Math.max(.1, 1 - .32 / apothem)
  const roofHeight = b.h - b.crownHeight * .45
  const height = roofHeight - Math.min(.04, roofHeight * .05)
  return { x: b.x, y: b.y + height / 2, z: b.z, w: b.w * scale, d: b.d * scale, h: height, yaw:b.yaw || 0,
    segments: b.shape === 'round' ? b.faces.length : 0 }
}
