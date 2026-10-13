import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/*
 * The corridor's planters: a glazed navy ceramic vessel with a brass rim, floating on a dark
 * recessed plinth, top-dressed with river pebbles and planted with a clump of Sansevieria.
 * Everything is built in real depth - the vessel has a wall and a rolled lip, the soil sits
 * well down inside it - so no two surfaces ever share a plane and nothing can flicker. The
 * blades rise, arch, cup and twist like the living plant, each with its own banding, gold
 * margins and tint.
 */
export const VESSEL = Object.freeze({ plinth: 0.02, height: 0.6, soil: 0.5, radius: 0.295 })

function random(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* Sansevieria 'Laurentii': deep green crossed by wavy grey-green bands, with gold margins. */
function bladeTexture() {
  const w = 128
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  g.fillStyle = '#1e3823'
  g.fillRect(0, 0, w, h)
  const rnd = random(11)
  for (let y = -8; y < h + 8; y += 5 + rnd() * 9) {
    const amp = 2 + rnd() * 4
    const phase = rnd() * Math.PI * 2
    const freq = 0.05 + rnd() * 0.06
    g.strokeStyle = rnd() > 0.35 ? `rgba(122,152,108,${0.3 + rnd() * 0.35})` : `rgba(8,24,12,${0.35 + rnd() * 0.3})`
    g.lineWidth = 1.5 + rnd() * 3.5
    g.beginPath()
    for (let x = 0; x <= w; x += 4) {
      const yy = y + Math.sin(x * freq + phase) * amp
      if (x) g.lineTo(x, yy)
      else g.moveTo(x, yy)
    }
    g.stroke()
  }
  // a soft darker midrib
  const rib = g.createLinearGradient(0, 0, w, 0)
  rib.addColorStop(0, 'rgba(0,0,0,0)')
  rib.addColorStop(0.5, 'rgba(6,18,10,.3)')
  rib.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = rib
  g.fillRect(0, 0, w, h)
  // gold margins
  ;[[0, 1], [w, -1]].forEach(([x0, dir]) => {
    const m = g.createLinearGradient(x0, 0, x0 + dir * 15, 0)
    m.addColorStop(0, 'rgba(206,190,98,1)')
    m.addColorStop(0.45, 'rgba(190,176,88,.85)')
    m.addColorStop(1, 'rgba(190,176,88,0)')
    g.fillStyle = m
    g.fillRect(dir > 0 ? 0 : w - 15, 0, 15, h)
  })
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

/** The planters' materials, made once by the corridor and handed to every planter. */
export function createPlantMaterials() {
  return {
    blade: new THREE.MeshStandardMaterial({ map: bladeTexture(), vertexColors: true, roughness: 0.42, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.5 }),
    vessel: new THREE.MeshStandardMaterial({ color: '#16224a', roughness: 0.3, metalness: 0, envMapIntensity: 0.85 }),
    soil: new THREE.MeshStandardMaterial({ color: '#1b1511', roughness: 1, metalness: 0 }),
    pebble: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0, envMapIntensity: 0.3 }),
  }
}

const ALONG = 20
const ACROSS = 5

/* One blade: a cupped strip that rises, arches out along `heading` and twists as it goes. */
function addBlade(out, b) {
  const dir = new THREE.Vector3(Math.cos(b.heading), 0, Math.sin(b.heading))
  const spine = (t) => new THREE.Vector3(
    b.base.x + dir.x * b.lean * b.height * t * t,
    b.base.y + b.height * t * (1 - 0.18 * b.lean * t),
    b.base.z + dir.z * b.lean * b.height * t * t,
  )
  const widthAt = (t) => b.width * (0.4 + 0.6 * smooth(0, 0.32, t)) * Math.pow(1 - smooth(0.66, 1, t), 0.85)
  const first = out.positions.length / 3
  const T = new THREE.Vector3()
  const A = new THREE.Vector3()
  const N = new THREE.Vector3()
  const side = new THREE.Vector3(-dir.z, 0, dir.x)
  for (let i = 0; i <= ALONG; i++) {
    const t = i / ALONG
    const p = spine(t)
    T.subVectors(spine(Math.min(1, t + 0.02)), spine(Math.max(0, t - 0.02))).normalize()
    A.copy(side).applyAxisAngle(T, b.baseTwist + b.twist * t)
    A.addScaledVector(T, -A.dot(T)).normalize()
    N.crossVectors(T, A).normalize()
    const w = widthAt(t)
    const dry = 1 - 0.3 * smooth(0.9, 1, t)
    for (let j = 0; j < ACROSS; j++) {
      const s = j / (ACROSS - 1) - 0.5
      const q = p.clone().addScaledVector(A, s * w).addScaledVector(N, b.cup * w * 4 * s * s)
      out.positions.push(q.x, q.y, q.z)
      out.uvs.push(j / (ACROSS - 1), b.vOffset + t * b.height * 1.3)
      out.colors.push(b.tint[0] * dry, b.tint[1] * dry, b.tint[2] * (dry * 0.9 + 0.1))
    }
  }
  for (let i = 0; i < ALONG; i++) {
    for (let j = 0; j < ACROSS - 1; j++) {
      const a = first + i * ACROSS + j
      const c = a + ACROSS
      out.indices.push(a, c, a + 1, a + 1, c, c + 1)
    }
  }
}

/* A clump of 14-17 blades: tall and upright at the heart, shorter and arching at the edge. */
function clumpGeometry(seed) {
  const rnd = random(seed)
  const out = { positions: [], uvs: [], colors: [], indices: [] }
  const count = 14 + Math.floor(rnd() * 4)
  for (let k = 0; k < count; k++) {
    const r = 0.015 + Math.pow(rnd(), 0.8) * 0.15
    const heading = (k / count) * Math.PI * 2 + (rnd() - 0.5) * 0.7
    const heart = 1 - r / 0.165
    const shade = 0.82 + rnd() * 0.32
    addBlade(out, {
      base: new THREE.Vector3(Math.cos(heading) * r, VESSEL.soil - 0.04, Math.sin(heading) * r),
      heading,
      height: 0.5 + heart * 0.42 + rnd() * 0.22,
      width: 0.062 + rnd() * 0.038,
      lean: 0.08 + (1 - heart) * 0.34 + rnd() * 0.08,
      baseTwist: (rnd() - 0.5) * 0.7,
      twist: (rnd() - 0.5) * 1.3,
      cup: 0.1 + rnd() * 0.14,
      vOffset: rnd(),
      tint: [shade * (0.94 + rnd() * 0.1), shade, shade * (0.9 + rnd() * 0.12)],
    })
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(out.positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(out.uvs, 2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(out.colors, 3))
  geometry.setIndex(out.indices)
  geometry.computeVertexNormals()
  return geometry
}

/* The vessel in section: rolled foot, gently swelling wall, rolled lip, inner wall down past the soil. */
function vesselGeometry() {
  const profile = [
    [0, 0], [0.228, 0], [0.242, 0.005], [0.25, 0.02],
    [0.272, 0.2], [0.287, 0.42], [0.294, 0.56], [0.295, 0.585],
    [0.29, 0.596], [0.281, 0.6], [0.272, 0.596], [0.268, 0.585],
    [0.266, 0.56], [0.258, 0.45], [0, 0.45],
  ]
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 72)
}

const PEBBLES = 90

export function Planter({ seed = 1, mats, plantMats }) {
  const geometry = useMemo(() => ({
    vessel: vesselGeometry(),
    plinth: new THREE.CylinderGeometry(0.21, 0.21, VESSEL.plinth, 48),
    rim: new THREE.TorusGeometry(0.2815, 0.0075, 10, 96),
    soil: new THREE.CircleGeometry(0.263, 48),
    pebble: new THREE.IcosahedronGeometry(1, 1),
    clump: clumpGeometry(seed),
  }), [seed])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])

  // River-pebble top dressing: flattened, turned and tinted stones from warm white to slate.
  const pebbles = useRef()
  useLayoutEffect(() => {
    const rnd = random(seed * 977 + 3)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const colour = new THREE.Color()
    for (let i = 0; i < PEBBLES; i++) {
      const r = Math.sqrt(rnd()) * 0.235
      const a = rnd() * Math.PI * 2
      const size = 0.016 + rnd() * 0.016
      const s = new THREE.Vector3(size * (1 + rnd() * 0.4), size * (0.45 + rnd() * 0.2), size)
      q.setFromEuler(e.set((rnd() - 0.5) * 0.4, rnd() * Math.PI, (rnd() - 0.5) * 0.4))
      m.compose(new THREE.Vector3(Math.cos(a) * r, VESSEL.soil + s.y * 0.5, Math.sin(a) * r), q, s)
      pebbles.current.setMatrixAt(i, m)
      const tone = rnd()
      colour.setRGB(0.5 + tone * 0.38, 0.49 + tone * 0.36, 0.47 + tone * 0.33, THREE.LinearSRGBColorSpace)
      pebbles.current.setColorAt(i, colour)
    }
    pebbles.current.instanceMatrix.needsUpdate = true
    if (pebbles.current.instanceColor) pebbles.current.instanceColor.needsUpdate = true
  }, [seed])

  return <group>
    {/* a dark recessed plinth, so the vessel floats a finger's width above the stone */}
    <mesh geometry={geometry.plinth} material={mats.shadowGap} position={[0, VESSEL.plinth / 2, 0]} />
    <group position={[0, VESSEL.plinth, 0]}>
      <mesh geometry={geometry.vessel} material={plantMats.vessel} />
      <mesh geometry={geometry.rim} material={mats.brassSatin} position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geometry.soil} material={plantMats.soil} position={[0, VESSEL.soil, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <instancedMesh ref={pebbles} args={[geometry.pebble, plantMats.pebble, PEBBLES]} />
      <mesh geometry={geometry.clump} material={plantMats.blade} />
    </group>
  </group>
}
