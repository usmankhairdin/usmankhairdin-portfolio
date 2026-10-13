#!/usr/bin/env node
/*
 * Lifts the four big rooms out of the Shahz Connect world model (used with the owner's
 * permission) into this portfolio's room frame, and writes them as public/assets/rooms/rooms.glb.
 *
 *   node scripts/extract-reference-rooms.mjs <path/to/shahz-connect/public/models/world.glb>
 *
 * Every room is turned so that it opens off the corridor the way ours do: room-local +x runs
 * from the corridor wall into the room, z runs along the corridor with the door at z = 0, and
 * the floor lies on the corridor's floor plane (y = -0.075) so one planar reflection serves
 * both. The door wall lands 1 cm inside the corridor wall's room face.
 *
 * The rooms come across exactly as they are - architecture, light fittings and furniture -
 * except for the reference's own door frames (our door portal stands in the opening). The UVs
 * are untouched: UV0 is metric for the tiling materials and UV1 addresses the baked lightmaps,
 * which are copied alongside unchanged.
 */
import fs from 'node:fs'
import path from 'node:path'

const source = process.argv[2]
if (!source) {
  console.error('usage: node scripts/extract-reference-rooms.mjs <world.glb>')
  process.exit(1)
}
const OUT = path.resolve('public/assets/rooms/rooms.glb')
const FLOOR_Y = -0.075
const DOOR_WALL_INSET = 0.01

// reference world -> room-local frame (position, and the same rotation for normals)
const FRAMES = {
  services: { p: ([x, y, z]) => [0.9 - x, y, -(z + 24)], n: ([x, y, z]) => [-x, y, -z] },
  about: { p: ([x, y, z]) => [0.9 - x, y, -(z + 44)], n: ([x, y, z]) => [-x, y, -z] },
  process: { p: ([x, y, z]) => [x + 0.9, y, z + 34], n: (v) => v },
  contact: { p: ([x, y, z]) => [-z - 58.7, y, x], n: ([x, y, z]) => [-z, y, x] },
}

// Which islands (connected pieces, bounds in room-local metres) stay in the room: all of them,
// exactly as in the reference, except the reference's own door frame - this portfolio's door
// portal stands in that opening.
const keep = (room, material, b) => !(material === 'bronze' && b.max[0] < 3.7)

const glb = fs.readFileSync(source)
const jsonLength = glb.readUInt32LE(12)
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'))
const bin = glb.subarray(20 + jsonLength + 8)

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
const ARRAYS = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }
function read(index) {
  const a = gltf.accessors[index]
  const view = gltf.bufferViews[a.bufferView]
  const n = COMPONENTS[a.type]
  const Arr = ARRAYS[a.componentType]
  const stride = view.byteStride || n * Arr.BYTES_PER_ELEMENT
  const base = (view.byteOffset || 0) + (a.byteOffset || 0)
  const out = new Float64Array(a.count * n)
  const dv = new DataView(bin.buffer, bin.byteOffset)
  const get = { 5126: (o) => dv.getFloat32(o, true), 5125: (o) => dv.getUint32(o, true), 5123: (o) => dv.getUint16(o, true), 5121: (o) => dv.getUint8(o) }[a.componentType]
  for (let i = 0; i < a.count; i++) for (let j = 0; j < n; j++) out[i * n + j] = get(base + i * stride + j * Arr.BYTES_PER_ELEMENT)
  return { data: out, n, count: a.count }
}

function islands(positions, indices) {
  const count = positions.length / 3
  const parent = new Int32Array(count).map((_, i) => i)
  const find = (i) => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]]
    return i
  }
  const join = (a, b) => { parent[find(a)] = find(b) }
  for (let t = 0; t < indices.length; t += 3) {
    join(indices[t], indices[t + 1])
    join(indices[t], indices[t + 2])
  }
  const seen = new Map()
  for (let i = 0; i < count; i++) {
    const key = `${positions[i * 3].toFixed(4)},${positions[i * 3 + 1].toFixed(4)},${positions[i * 3 + 2].toFixed(4)}`
    if (seen.has(key)) join(i, seen.get(key))
    else seen.set(key, i)
  }
  return (i) => find(i)
}

// ---- build the output -------------------------------------------------------------------
const outMaterials = []
const materialIndex = (name) => {
  let i = outMaterials.findIndex((m) => m.name === name)
  if (i < 0) i = outMaterials.push({ name }) - 1
  return i
}
const chunks = []
let byteLength = 0
const views = []
const accessors = []
function addAccessor(typed, type, { target, minmax = false, componentType }) {
  const pad = (4 - (byteLength % 4)) % 4
  if (pad) { chunks.push(Buffer.alloc(pad)); byteLength += pad }
  const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength)
  views.push({ buffer: 0, byteOffset: byteLength, byteLength: buf.length, ...(target ? { target } : {}) })
  chunks.push(buf)
  byteLength += buf.length
  const n = COMPONENTS[type]
  const acc = { bufferView: views.length - 1, componentType, count: typed.length / n, type }
  if (minmax) {
    acc.min = Array(n).fill(Infinity)
    acc.max = Array(n).fill(-Infinity)
    for (let i = 0; i < typed.length; i++) {
      acc.min[i % n] = Math.min(acc.min[i % n], typed[i])
      acc.max[i % n] = Math.max(acc.max[i % n], typed[i])
    }
  }
  accessors.push(acc)
  return accessors.length - 1
}

const nodes = []
const meshes = []
const report = []
for (const node of gltf.nodes) {
  const frame = FRAMES[node.name]
  if (!frame || node.mesh === undefined) continue
  const primitives = []
  for (const prim of gltf.meshes[node.mesh].primitives) {
    const material = gltf.materials[prim.material].name
    const pos = read(prim.attributes.POSITION).data
    const nor = read(prim.attributes.NORMAL).data
    const uv0 = read(prim.attributes.TEXCOORD_0).data
    const uv1 = read(prim.attributes.TEXCOORD_1).data
    const idx = read(prim.indices).data
    const count = pos.length / 3
    const framed = new Float64Array(count * 3) // room-local, before the floor and wall offsets
    for (let i = 0; i < count; i++) framed.set(frame.p([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]), i * 3)
    // bounds of every island, then the triangles of the islands that stay
    const root = islands(pos, idx)
    const bounds = new Map()
    for (let i = 0; i < count; i++) {
      const r = root(i)
      const b = bounds.get(r) || { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
      for (let j = 0; j < 3; j++) {
        b.min[j] = Math.min(b.min[j], framed[i * 3 + j])
        b.max[j] = Math.max(b.max[j], framed[i * 3 + j])
      }
      bounds.set(r, b)
    }
    const kept = new Set([...bounds].filter(([, b]) => keep(node.name, material, b)).map(([r]) => r))
    const dropped = bounds.size - kept.size
    const tris = []
    for (let t = 0; t < idx.length; t += 3) {
      if (kept.has(root(idx[t]))) tris.push(idx[t], idx[t + 1], idx[t + 2])
    }
    if (!tris.length) {
      report.push(`${node.name}: ${material} removed`)
      continue
    }
    // compact the vertices that are still used
    const order = []
    const remap = new Int32Array(count).fill(-1)
    for (const v of tris) if (remap[v] < 0) remap[v] = order.push(v) - 1
    const P = new Float32Array(order.length * 3)
    const N = new Float32Array(order.length * 3)
    const T0 = new Float32Array(order.length * 2)
    const T1 = new Float32Array(order.length * 2)
    order.forEach((v, i) => {
      P.set([framed[v * 3] + DOOR_WALL_INSET, framed[v * 3 + 1] + FLOOR_Y, framed[v * 3 + 2]], i * 3)
      N.set(frame.n([nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]]), i * 3)
      T0.set([uv0[v * 2], uv0[v * 2 + 1]], i * 2)
      T1.set([uv1[v * 2], uv1[v * 2 + 1]], i * 2)
    })
    const I = order.length < 65536 ? new Uint16Array(tris.map((v) => remap[v])) : new Uint32Array(tris.map((v) => remap[v]))
    primitives.push({
      attributes: {
        POSITION: addAccessor(P, 'VEC3', { target: 34962, minmax: true, componentType: 5126 }),
        NORMAL: addAccessor(N, 'VEC3', { target: 34962, componentType: 5126 }),
        TEXCOORD_0: addAccessor(T0, 'VEC2', { target: 34962, componentType: 5126 }),
        TEXCOORD_1: addAccessor(T1, 'VEC2', { target: 34962, componentType: 5126 }),
      },
      indices: addAccessor(I, 'SCALAR', { target: 34963, componentType: I instanceof Uint16Array ? 5123 : 5125 }),
      material: materialIndex(material),
    })
    if (dropped) report.push(`${node.name}: ${material} -${dropped} piece(s)`)
  }
  meshes.push({ name: node.name, primitives })
  nodes.push({ name: node.name, mesh: meshes.length - 1, extras: { room: node.name } })
}

const json = {
  asset: { version: '2.0', generator: 'extract-reference-rooms (from Shahz Connect world.glb, used with permission)' },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, i) => i) }],
  nodes,
  meshes,
  materials: outMaterials,
  accessors,
  bufferViews: views,
  buffers: [{ byteLength }],
}
const binChunk = Buffer.concat(chunks)
const binPad = Buffer.alloc((4 - (binChunk.length % 4)) % 4)
let jsonChunk = Buffer.from(JSON.stringify(json))
jsonChunk = Buffer.concat([jsonChunk, Buffer.alloc((4 - (jsonChunk.length % 4)) % 4, 0x20)])
const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length + binPad.length
const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(total, 8)
const jsonHead = Buffer.alloc(8)
jsonHead.writeUInt32LE(jsonChunk.length, 0)
jsonHead.writeUInt32LE(0x4e4f534a, 4)
const binHead = Buffer.alloc(8)
binHead.writeUInt32LE(binChunk.length + binPad.length, 0)
binHead.writeUInt32LE(0x004e4942, 4)
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, Buffer.concat([header, jsonHead, jsonChunk, binHead, binChunk, binPad]))
console.log(report.join('\n'))
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(total / 1024).toFixed(0)} KB)`)
