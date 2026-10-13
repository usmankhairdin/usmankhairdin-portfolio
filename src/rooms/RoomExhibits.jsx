import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { projectAsset, projects } from '../data/projects.js'
import { sectionHeroes } from '../data/sectionHeroes.jsx'
import { look } from '../experience/freeLook.js'
import { ON_DARK, ON_LIGHT, body, eyebrow, paintGraphic, titleRuns, traceLettering, useFontsReady } from './roomGraphics.js'
import { roomLit, useRoomTextures } from './referenceRooms.js'
import { followLink, inFront, linkState, linkTargets, pointLink, registerLink } from './linkTargets.js'

/*
 * The portfolio's content, built into the rooms rather than laid over them.
 *   - Headlines are lettering that belongs to the wall: cut into stone, or cast in brass and
 *     standing proud of ink plaster, felt and walnut, catching the light on their edges.
 *   - Copy sits on real boards - ink lacquer or walnut with a brass edge, mounted off the wall
 *     on a shadow gap - printed square, so it reads straight to anyone standing in front of it.
 *   - Projects play on real LED screens; the About niches and the gallery's light box are lit
 *     from behind; the six Services monoliths carry their service lines on their glass.
 * Text keeps one fixed size in metres and is never stretched. Positions are room-local
 * (x into the room from the door wall, z along the corridor, floor at y = -0.075), so every
 * exhibit rides with its room.
 */
const FLOOR = -0.075
const FACE = { left: [0, 0, 0], right: [0, Math.PI, 0], far: [0, -Math.PI / 2, 0] }
const BRASS = '#d4ad66'
const BRASS_LIGHT = '#ecd29c'

/* ------------------------------------------------------------------ links */
// A piece that leads somewhere answers the cursor (as a hand) and the centre dot when the
// mouse is captured; either way a note says where it goes before it is clicked.
function useLinkTarget(ref, route, material, glow = 1.18) {
  const navigate = useNavigate()
  const registered = useRef(null)
  useEffect(() => () => registered.current?.(), [])
  useFrame(() => {
    // the mesh appears once its print is painted; register it then
    if (route && ref.current && !linkTargets.has(ref.current)) {
      registered.current?.()
      registered.current = registerLink(ref.current, route)
    }
    if (!material || !route) return
    const lit = linkState.hovered === ref.current || linkState.aimed === ref.current
    if (material.userData.base == null) material.userData.base = material.color.clone()
    material.color.copy(material.userData.base).multiplyScalar(lit ? glow : 1)
  })
  if (!route) return {}
  // only what is actually in view answers - never a link behind a wall or another room
  const front = (e) => inFront(e, ref.current)
  return {
    onPointerOver: (e) => {
      if (look.locked || !front(e)) return
      e.stopPropagation()
      pointLink('hovered', ref.current)
    },
    onPointerMove: (e) => {
      if (look.locked) return
      const visible = front(e)
      if (visible && linkState.hovered !== ref.current) pointLink('hovered', ref.current)
      if (!visible && linkState.hovered === ref.current) pointLink('hovered', null)
    },
    onPointerOut: () => {
      if (linkState.hovered === ref.current) pointLink('hovered', null)
    },
    onClick: (e) => {
      if (look.locked || look.dragging || !front(e)) return
      e.stopPropagation()
      followLink(route, navigate)
    },
  }
}

// Frees a material or texture this exhibit made when it goes (shared maps are left alone).
const useDisposable = (value) => {
  useEffect(() => () => value?.dispose?.(), [value])
  return value
}

/* ------------------------------------------------------------------ printed surfaces */
/* Print on a lit-from-behind surface (light boxes, the monoliths' glass). */
function Print({ width, height, draw, position, rotation, glow = false, ppm = 300, link }) {
  const ready = useFontsReady()
  // the drawing is fixed for a given exhibit, so it is painted once the fonts are in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => (ready ? paintGraphic(width, height, draw, { ppm }) : null), [ready, width, height, ppm])
  const material = useDisposable(useMemo(() => texture && new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false, toneMapped: !glow, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8,
  }), [texture, glow]))
  useEffect(() => () => texture?.dispose(), [texture])
  const mesh = useRef()
  const handlers = useLinkTarget(mesh, link, material)
  if (!material) return null
  return <mesh ref={mesh} position={position} rotation={rotation} material={material} renderOrder={2} {...handlers}>
    <planeGeometry args={[width, height]} />
  </mesh>
}

/*
 * Lettering mounted on the wall: solid letters in the site's fonts, extruded a few centimetres
 * deep with softened edges, standing just off the wall on hidden pins, so the light from the
 * cove above catches their tops and edges and they cast a soft shadow on the wall below them.
 * Each colour of the design is its own finish: brass, satin black metal, cobalt lacquer.
 */
const LETTER_FINISH = {
  [BRASS]: { color: BRASS, roughness: 0.32, metalness: 0.45, level: 1.15 },
  [BRASS_LIGHT]: { color: BRASS_LIGHT, roughness: 0.3, metalness: 0.45, level: 1.15 },
  '#1c2534': { color: '#1d232d', roughness: 0.42, metalness: 0.35, level: 1.0 },
  '#3c52e6': { color: '#2f45d8', roughness: 0.22, metalness: 0.1, level: 1.05 },
}
function Lettering({ width, height, draw, position, rotation, ppm = 420, depth }) {
  const ready = useFontsReady()
  const group = useRef()
  const keyDir = useMemo(() => new THREE.Vector3(0.25, 0.85, 0.45).normalize(), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const traced = useMemo(() => (ready ? traceLettering(width, height, draw, { ppm }) : null), [ready, width, height, ppm])
  // letters stand as deep as suits their size: a few centimetres for a headline, millimetres for a label
  const thick = depth ?? Math.min(0.028, Math.max(0.006, height * 0.02))
  const pieces = useMemo(() => traced && traced.groups.map(({ color, shapes }) => {
    const finish = LETTER_FINISH[color] || { color, roughness: 0.4, metalness: 0.2, level: 1 }
    const bevel = Math.min(0.0025, thick * 0.18)
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: thick - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.6, bevelSegments: 2, curveSegments: 1 })
    geometry.computeVertexNormals()
    const material = roomLit(new THREE.MeshStandardMaterial({ color: finish.color, roughness: finish.roughness, metalness: finish.metalness }), finish.level, { key: 0.75, keyDir })
    return { geometry, material, bevel }
  }), [traced, thick, keyDir])
  const shadow = useMemo(() => traced && new THREE.MeshBasicMaterial({
    color: '#000000', alphaMap: traced.shadow, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4,
  }), [traced])
  useEffect(() => () => {
    pieces?.forEach((p) => { p.geometry.dispose(); p.material.dispose() })
    shadow?.dispose()
    traced?.shadow.dispose()
  }, [pieces, shadow, traced])
  // the key light comes from above this wall and a little in front of it, whichever way it faces
  useLayoutEffect(() => {
    if (!group.current) return
    const q = new THREE.Quaternion()
    group.current.getWorldQuaternion(q)
    keyDir.set(0.12, 0.85, 0.5).normalize().applyQuaternion(q)
  })
  if (!pieces) return null
  const standoff = 0.012
  return <group ref={group} position={position} rotation={rotation}>
    <mesh material={shadow} position={[0.004, -thick * 0.9 - 0.008, 0.0015]} renderOrder={1} raycast={() => null}>
      <planeGeometry args={traced.size} />
    </mesh>
    {pieces.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} position={[0, 0, standoff + p.bevel]} />)}
  </group>
}

/* A board on the wall: a lacquered or walnut panel with a brass edge, off the wall on a shadow gap. */
const BOARD_FINISH = { ink: '#121827', walnut: '#3f2a1d', stone: '#d8ccb6' }
function Board({ width, height, finish = 'ink', draw, position, rotation, link, ppm = 330 }) {
  const ready = useFontsReady()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => (ready ? paintGraphic(width - 0.08, height - 0.08, draw, { ppm }) : null), [ready, width, height, ppm])
  const face = useDisposable(useMemo(() => texture && new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }), [texture]))
  const panel = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: BOARD_FINISH[finish], roughness: finish === 'ink' ? 0.3 : 0.55 }), 0.9, { key: 0.5 }), [finish]))
  const brass = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.35, metalness: 0.3 }), 1.1, { key: 0.6 }), []))
  const gap = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ color: '#05060a' }), []))
  useEffect(() => () => texture?.dispose(), [texture])
  const faceRef = useRef()
  const handlers = useLinkTarget(faceRef, link, face, 1.22)
  const T = 0.036
  return <group position={position} rotation={rotation}>
    <mesh material={gap} position={[0, 0, 0.012]}><boxGeometry args={[width - 0.08, height - 0.08, 0.024]} /></mesh>
    <mesh material={panel} position={[0, 0, 0.03 + T / 2]}><boxGeometry args={[width, height, T]} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} material={brass} position={[0, s * (height / 2 - 0.006), 0.03 + T + 0.001]}><boxGeometry args={[width, 0.012, 0.004]} /></mesh>)}
    {face && <mesh ref={faceRef} material={face} position={[0, 0, 0.03 + T + 0.002]} renderOrder={2} {...handlers}><planeGeometry args={[width - 0.08, height - 0.08]} /></mesh>}
  </group>
}

/* Vertical walnut slats, the acoustic finish that frames a board. */
function Slats({ width, height, position, rotation }) {
  const material = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: 0.55 }), 0.85, { key: 0.65 }), []))
  const count = Math.floor(width / 0.07)
  const mesh = useRef()
  const geometry = useMemo(() => new THREE.BoxGeometry(0.045, height, 0.035), [height])
  useEffect(() => () => geometry.dispose(), [geometry])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) mesh.current.setMatrixAt(i, m.makeTranslation(-width / 2 + 0.035 + i * 0.07, 0, 0.03))
    mesh.current.instanceMatrix.needsUpdate = true
  }, [count, width])
  return <group position={position} rotation={rotation}><instancedMesh ref={mesh} args={[geometry, material, count]} /></group>
}

/* ------------------------------------------------------------------ an image, cover-fitted */
function useCoverTexture(url, width, height) {
  const source = useLoader(THREE.TextureLoader, url)
  return useDisposable(useMemo(() => {
    const t = source.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    const img = source.image.width / source.image.height
    const box = width / height
    if (img > box) { t.repeat.set(box / img, 1); t.offset.set((1 - box / img) / 2, 0) } else { t.repeat.set(1, img / box); t.offset.set(0, (1 - img / box) / 2) }
    t.needsUpdate = true
    return t
  }, [source, width, height]))
}

function Picture({ url, width, height, position, rotation }) {
  const texture = useCoverTexture(url, width, height)
  const material = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]))
  return <mesh position={position} rotation={rotation} material={material}><planeGeometry args={[width, height]} /></mesh>
}

/* A framed print: a walnut moulding with a brass fillet, a deep warm mat, the photograph. */
function FramedPortrait({ url, position, rotation }) {
  const W = 2.1
  const H = 2.66
  const mat = 0.16
  const bar = 0.07
  const wood = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: '#3b2619', roughness: 0.5 }), 1, { key: 0.7 }), []))
  const fillet = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.35, metalness: 0.3 }), 1.1, { key: 0.7 }), []))
  const board = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: '#efe8dc', roughness: 0.9 }), 1, { key: 0.4 }), []))
  const pw = W - bar * 2 - mat * 2
  const ph = H - bar * 2 - mat * 2
  return <group position={position} rotation={rotation}>
    <mesh material={board} position={[0, 0, 0.01]}><boxGeometry args={[W - bar, H - bar, 0.02]} /></mesh>
    {[-1, 1].map((s) => <mesh key={`v${s}`} material={wood} position={[s * (W / 2 - bar / 2), 0, 0.035]}><boxGeometry args={[bar, H, 0.07]} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={`h${s}`} material={wood} position={[0, s * (H / 2 - bar / 2), 0.035]}><boxGeometry args={[W, bar, 0.07]} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={`fv${s}`} material={fillet} position={[s * (W / 2 - bar - 0.006), 0, 0.03]}><boxGeometry args={[0.012, H - bar * 2, 0.012]} /></mesh>)}
    {[-1, 1].map((s) => <mesh key={`fh${s}`} material={fillet} position={[0, s * (H / 2 - bar - 0.006), 0.03]}><boxGeometry args={[W - bar * 2, 0.012, 0.012]} /></mesh>)}
    <Picture url={url} width={pw} height={ph} position={[0, 0, 0.022]} />
  </group>
}

/* ------------------------------------------------------------------ LED screens */
let sheenTexture = null
let spillTexture = null
function screenTextures() {
  if (!sheenTexture) {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const g = c.getContext('2d')
    const grd = g.createLinearGradient(0, 0, 256, 256)
    grd.addColorStop(0, 'rgba(255,255,255,0.10)')
    grd.addColorStop(0.42, 'rgba(255,255,255,0.025)')
    grd.addColorStop(0.43, 'rgba(255,255,255,0)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 256, 256)
    sheenTexture = new THREE.CanvasTexture(c)
    const s = document.createElement('canvas')
    s.width = 256
    s.height = 160
    const sg = s.getContext('2d')
    const r = sg.createRadialGradient(128, 80, 30, 128, 80, 128)
    r.addColorStop(0, 'rgba(255,255,255,0.55)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    sg.fillStyle = r
    sg.fillRect(0, 0, 256, 160)
    spillTexture = new THREE.CanvasTexture(s)
  }
  return { sheen: sheenTexture, spill: spillTexture }
}

const LED = { bezel: 0.022, depth: 0.05, standoff: 0.04 }
function LedScreen({ url, width, height, position, rotation, link }) {
  const texture = useCoverTexture(url, width, height)
  const { sheen, spill } = screenTextures()
  const screen = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]))
  const housing = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.32, metalness: 0.5 }), 0.8, { key: 0.6 }), []))
  const edge = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: '#8a8f98', roughness: 0.3, metalness: 0.6 }), 1, { key: 0.6 }), []))
  const glass = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: sheen, transparent: true, depthWrite: false }), [sheen]))
  const glow = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: spill, color: '#9fb2ff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }), [spill]))
  const screenRef = useRef()
  const handlers = useLinkTarget(screenRef, link, screen, 1.12)
  const W = width + LED.bezel * 2
  const H = height + LED.bezel * 2
  const z0 = LED.standoff
  return <group position={position} rotation={rotation}>
    {/* the screen's light falling on the wall around it */}
    <mesh material={glow} position={[0, 0, 0.004]} renderOrder={1}><planeGeometry args={[W * 1.5, H * 1.6]} /></mesh>
    <mesh material={housing} position={[0, 0, z0 + LED.depth / 2]}><boxGeometry args={[W, H, LED.depth]} /></mesh>
    {[-1, 1].map((s) => <mesh key={`v${s}`} material={edge} position={[s * (W / 2), 0, z0 + LED.depth / 2]}><boxGeometry args={[0.006, H, LED.depth + 0.002]} /></mesh>)}
    <mesh ref={screenRef} material={screen} position={[0, 0, z0 + LED.depth + 0.001]} {...handlers}><planeGeometry args={[width, height]} /></mesh>
    <mesh material={glass} position={[0, 0, z0 + LED.depth + 0.003]} raycast={() => null} renderOrder={3}><planeGeometry args={[width, height]} /></mesh>
  </group>
}

/* ------------------------------------------------------------------ the ceiling's lights */
/*
 * Recessed downlights set into each room's ceiling: a slim white trim, a deep warm lens, a soft
 * glow round it, and the pool of light it throws on the floor below. Laid out per room clear of
 * the room's own fixtures (the About pendant, the Services halo, the gallery's light lines and
 * gates, the Contact hall's globes). Room-local [x, z]; the ceiling's height.
 */
const DOWNLIGHTS = {
  about: { y: 5.93, at: [5.6, 8.6, 11.6, 14.6, 17.4].flatMap((x) => [[x, -4.7], [x, 4.7]]) },
  services: { y: 5.93, at: [[5.4, 0], ...[5.6, 9.2, 12.8, 16.4].flatMap((x) => [[x, -6.0], [x, 6.0]])] },
  process: { y: 4.93, at: [6.2, 11.2, 16.0, 20.8, 25.6].flatMap((x) => [[x, -1.9], [x, 1.9]]) },
  contact: {
    y: 5.93,
    at: [5.8, 9.6, 13.4, 17.2, 20.2].flatMap((x) => [-8.5, -3.6, 3.6, 8.5].map((z) => [x, z]))
      .filter(([x, z]) => !(x > 11 && x < 15.5 && z > 0 && z < 5)),
  },
}
let poolMap = null
function poolTexture() {
  if (poolMap) return poolMap
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  poolMap = new THREE.CanvasTexture(c)
  return poolMap
}
function CeilingLights({ kind }) {
  const plan = DOWNLIGHTS[kind]
  const geo = useMemo(() => ({
    trim: new THREE.CylinderGeometry(0.11, 0.11, 0.012, 32),
    lens: new THREE.CircleGeometry(0.08, 32).rotateX(Math.PI / 2),
    glow: new THREE.PlaneGeometry(0.62, 0.62).rotateX(Math.PI / 2),
    pool: new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2),
  }), [])
  const mats = useMemo(() => ({
    trim: roomLit(new THREE.MeshStandardMaterial({ color: '#e9e6e0', roughness: 0.4, metalness: 0.2 }), 1.0, { key: 0.3 }),
    lens: new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 3.7, 3.1), toneMapped: true }),
    glow: new THREE.MeshBasicMaterial({ map: poolTexture(), color: new THREE.Color(1, 0.86, 0.68), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    pool: new THREE.MeshBasicMaterial({ map: poolTexture(), color: new THREE.Color(1, 0.85, 0.66), transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 }),
  }), [])
  useEffect(() => () => { Object.values(geo).forEach((g) => g.dispose()); Object.values(mats).forEach((m) => m.dispose()) }, [geo, mats])
  if (!plan) return null
  const none = () => null
  return <group>
    {plan.at.map(([x, z]) => <group key={`${x}:${z}`} position={[x, plan.y, z]}>
      <mesh geometry={geo.trim} material={mats.trim} position={[0, -0.006, 0]} raycast={none} />
      <mesh geometry={geo.lens} material={mats.lens} position={[0, -0.013, 0]} raycast={none} />
      <mesh geometry={geo.glow} material={mats.glow} position={[0, -0.015, 0]} raycast={none} renderOrder={2} />
      <mesh geometry={geo.pool} material={mats.pool} position={[0, FLOOR - plan.y + 0.004, 0]} raycast={none} renderOrder={2} />
    </group>)}
  </group>
}

/* ------------------------------------------------------------------ the web version of a room */
/*
 * In every room, the way to the same content as a page of the website: a blade sign, the kind
 * galleries and streets use - a lit panel in a brass frame held out from the wall on a brass arm,
 * above head height, square to the way in. So it is read from the room's door, across the room,
 * and grows as the visitor walks up to it. Lit on both faces; the same sign in every room.
 */
const WEB_SIGN = { w: 1.8, h: 0.95, frame: 0.038, depth: 0.07, out: 0.14, y: 2.45 }
function useSignFace(route, texture, ref) {
  const material = useDisposable(useMemo(() => texture && new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]))
  return [material, useLinkTarget(ref, route, material, 1.2)]
}
function WebVersionSign({ route, position, rotation }) {
  const ready = useFontsReady()
  const { w: W, h: H, frame: F, depth: D, out } = WEB_SIGN
  const fw = W - F * 2
  const fh = H - F * 2
  const texture = useMemo(() => (!ready ? null : paintGraphic(fw, fh, (pen, { width, height }) => {
    const g = pen.g
    const grd = g.createLinearGradient(0, 0, 0, height * pen.s)
    grd.addColorStop(0, '#172235')
    grd.addColorStop(1, '#0a0e16')
    g.fillStyle = grd
    g.fillRect(0, 0, width * pen.s, height * pen.s)
    const k = height / 0.874                      // the layout scales with the sign
    pen.text('WEB VERSION', 0.09 * k, 0.08 * k, eyebrow(0.05 * k, '#d9b878'))
    pen.flow([{ text: 'View on the web ', style: { size: 0.152 * k, weight: 800, color: '#f4eee4' } }, { text: '↗', style: { size: 0.152 * k, weight: 700, color: '#8f9dff' } }], 0.09 * k, 0.23 * k, width - 0.18 * k)
    pen.rule(0.09 * k, 0.53 * k, width - 0.18 * k, 'rgba(217,184,120,.55)', 0.004)
    pen.text(`usmankhairdin.com${route.replace(/\/$/, '')}`, 0.09 * k, 0.61 * k, { size: 0.05 * k, weight: 500, family: 'mono', color: '#b9b0a0', tracking: 0.06 })
  }, { ppm: 560 })), [ready, fw, fh, route])
  useEffect(() => () => texture?.dispose(), [texture])
  const frontRef = useRef()
  const backRef = useRef()
  const [front, frontHandlers] = useSignFace(route, texture, frontRef)
  const [, backHandlers] = useSignFace(route, texture, backRef)
  const brass = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ color: BRASS, roughness: 0.32, metalness: 0.45 }), 1.15, { key: 0.7 }), []))
  const body = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ color: '#06080d' }), []))
  const zc = out + W / 2                          // the panel's middle, out from the wall
  const armY = H / 2 + 0.09
  // local frame: x along the wall, y up, z out of the wall into the room; the panel lies in y-z
  return <group position={position} rotation={rotation}>
    <mesh material={brass} position={[0, armY, 0.012]}><boxGeometry args={[0.07, 0.16, 0.024]} /></mesh>
    <mesh material={brass} position={[0, armY, (out + W) / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.013, 0.013, out + W, 12]} /></mesh>
    {[out + 0.16, out + W - 0.16].map((z) => <mesh key={z} material={brass} position={[0, (H / 2 + armY) / 2, z]}><cylinderGeometry args={[0.006, 0.006, armY - H / 2, 8]} /></mesh>)}
    <mesh material={body} position={[0, 0, zc]}><boxGeometry args={[D, H - 0.01, W - 0.01]} /></mesh>
    {[-1, 1].map((k) => <mesh key={`v${k}`} material={brass} position={[0, 0, zc + k * (W / 2 - F / 2)]}><boxGeometry args={[D + 0.01, H, F]} /></mesh>)}
    {[-1, 1].map((k) => <mesh key={`h${k}`} material={brass} position={[0, k * (H / 2 - F / 2), zc]}><boxGeometry args={[D + 0.01, F, W]} /></mesh>)}
    {front && <mesh ref={frontRef} material={front} position={[-D / 2 - 0.002, 0, zc]} rotation={[0, -Math.PI / 2, 0]} {...frontHandlers}><planeGeometry args={[fw, fh]} /></mesh>}
    {front && <mesh ref={backRef} material={front} position={[D / 2 + 0.002, 0, zc]} rotation={[0, Math.PI / 2, 0]} {...backHandlers}><planeGeometry args={[fw, fh]} /></mesh>}
  </group>
}

/* ------------------------------------------------------------------ Services */
// The six service lines, one on each smoked-glass monolith; the last one is the agency offer.
const SERVICE_LINES = [
  { title: 'Product / UI/UX Design', body: 'Make complex workflows feel clear: product flows and reusable interface systems shaped around the people using them.', tags: 'User flows · Design systems', link: '/services/' },
  { title: 'Website & Landing Page Design', body: 'Websites and landing pages with considered content, a distinct visual direction and a straightforward path to enquiry.', tags: 'Website design · Landing pages', link: '/services/' },
  { title: 'SaaS / Dashboard UI', body: 'Dense workflows, responsive application states and a consistent component system.', tags: 'Dashboards · Components', link: '/services/' },
  { title: 'Website Redesign', body: 'Give an existing business website a clearer presence and a distinct visual direction.', tags: 'Redesigns · Content', link: '/services/' },
  { title: 'Frontend Development', body: 'Approved design carried into the browser: responsive React, Tailwind CSS and HTML/CSS, with care for states and accessibility.', tags: 'React · Tailwind CSS', link: '/services/' },
  { title: 'White-label Agency Production', body: 'Senior UI/UX design and frontend production that fits your agency workflow, under your name.', tags: 'Paid pilot · Agency led', link: '/for-agencies/' },
]
const ARC = { centre: [6.9, 0], radius: 5.4, angles: [50, 30, 10, -10, -30, -50] } // the reference plinth arc
const MONOLITH = { w: 1.25, h: 2.5, d: 0.06, base: 0.095 }

let backlight = null
function backlightTexture() {
  if (backlight) return backlight
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 256, 0, 0)
  grd.addColorStop(0, 'rgb(255,255,255)')
  grd.addColorStop(0.3, 'rgb(70,70,70)')
  grd.addColorStop(1, 'rgb(6,6,6)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 256)
  backlight = new THREE.CanvasTexture(c)
  backlight.colorSpace = THREE.SRGBColorSpace
  return backlight
}

function Monolith({ index, item, angle }) {
  const a = THREE.MathUtils.degToRad(angle)
  const x = ARC.centre[0] + ARC.radius * Math.cos(a)
  const z = -ARC.radius * Math.sin(a)
  const rotY = Math.atan2(-Math.cos(a), Math.sin(a))
  const slab = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({
    color: '#0a0d15', roughness: 0.18, metalness: 0, emissive: new THREE.Color('#ffe2c4'), emissiveMap: backlightTexture(), emissiveIntensity: 0.24,
  }), 0.25, { key: 0.5 }), []))
  const { w, h, d, base } = MONOLITH
  return <group position={[x, FLOOR + base, z]} rotation={[0, rotY, 0]}>
    <mesh material={slab} position={[0, h / 2, 0]}><boxGeometry args={[w, h, d]} /></mesh>
    {/* a fine brass light line on the leading edge */}
    <mesh position={[-w / 2 + 0.035, h / 2, d / 2 + 0.002]}><boxGeometry args={[0.012, h - 0.12, 0.004]} /><meshBasicMaterial color={new THREE.Color('#e3b56c').multiplyScalar(2.2)} /></mesh>
    <Print width={w - 0.1} height={h - 0.1} position={[0.02, h / 2, d / 2 + 0.004]} link={item.link} ppm={420} draw={(pen, { width }) => {
      const ink = ON_DARK
      const left = 0.1
      pen.text(String(index + 1).padStart(2, '0'), width - 0.06, 0.12, { ...eyebrow(0.06, ink.brass), align: 'right' })
      let y = pen.flow([{ text: item.title, style: { size: 0.112, weight: 700, color: ink.text } }], left, 0.34, width - 0.18, { lineHeight: 1.08 })
      pen.rule(left, y + 0.06, 0.2, ink.brass, 0.005)
      y = pen.flow([{ text: item.body, style: body(0.048, ink.body) }], left, y + 0.14, width - 0.22, { lineHeight: 1.5 })
      pen.text(item.tags.toUpperCase(), left, 2.12, eyebrow(0.032, ink.brass))
    }} />
  </group>
}

/* A brass title in the site's voice: one plain line, then the italic accent. */
const brassTitle = (lines, size, align = 'left') => (pen, { width }) => {
  let y = 0.04
  lines.forEach(([plain, accent]) => {
    const runs = [{ text: plain, style: { size, weight: 700, color: BRASS } }]
    if (accent) runs.push({ text: accent, style: { size: size * 1.05, weight: 500, family: 'serif', italic: true, color: BRASS_LIGHT } })
    y = pen.flow(runs, align === 'center' ? width / 2 : 0, y, width, { lineHeight: 1.06, align })
  })
}

/* A small plate that leads somewhere: the line and its arrow, on its own board. */
const actionPlate = (label, ink = ON_DARK, size = 0.13) => (pen, { height }) => {
  const y = (height - size) / 2
  pen.text(`${label} ↗`, 0.06, y, { size, weight: 700, color: ink.accent })
}

function ServicesExhibit() {
  const hero = sectionHeroes.services
  const agencies = sectionHeroes.agencies
  const steps = [
    ['Share a defined brief', 'One project, interface or production need.'],
    ['Agree the paid pilot', 'Scope, timing and output set before production.'],
    ['Review asynchronously', 'Assess the work and handoff within your process.'],
    ['Explore repeat support', 'The next project, if the fit works for both sides.'],
  ]
  return <>
    {SERVICE_LINES.map((item, i) => <Monolith key={item.title} index={i} item={item} angle={ARC.angles[i]} />)}

    {/* cast brass on the cobalt felt behind the arc */}
    <Lettering width={10} height={1.5} position={[18.6, 4.3, 0]} rotation={FACE.far} draw={(pen, { width }) => {
      pen.flow([{ text: 'From product UX to ', style: { size: 0.52, weight: 700, color: BRASS } }, { text: 'production.', style: { size: 0.55, weight: 500, family: 'serif', italic: true, color: BRASS_LIGHT } }], width / 2, 0.06, width, { align: 'center' })
      pen.flow([{ text: 'Design only. Frontend only. Or design and build, together.', style: { size: 0.17, weight: 600, color: BRASS } }], width / 2, 0.86, width, { align: 'center' })
    }} />

    {/* the web version: a blade sign out from the right wall beyond the slats, high enough to be
        seen over the monoliths from the door */}
    <WebVersionSign route="/services/" position={[17.55, 4.2, 7.5]} rotation={FACE.right} />

    {/* left wall: the agency model, framed by walnut slats */}
    <Slats width={1.3} height={3.6} position={[6.55, 2.05, -7.5]} rotation={FACE.left} />
    <Slats width={1.3} height={3.6} position={[15.85, 2.05, -7.5]} rotation={FACE.left} />
    <Lettering width={7.6} height={0.9} position={[11.2, 3.55, -7.5]} rotation={FACE.left} draw={brassTitle([['More hands. ', 'Less complexity.']], 0.46)} />
    <Board width={7.6} height={2.2} position={[11.2, 1.95, -7.5]} rotation={FACE.left} link="/for-agencies/" draw={(pen) => {
      const ink = ON_DARK
      pen.text(agencies.eyebrow, 0.1, 0.1, eyebrow(0.07, ink.brass))
      const y = pen.flow([{ text: agencies.intro, style: body(0.1, ink.body) }], 0.1, 0.3, 7.1, { lineHeight: 1.5 })
      steps.forEach(([title, detail], i) => {
        const x = 0.1 + (i % 2) * 3.65
        const top = y + 0.2 + Math.floor(i / 2) * 0.5
        pen.text(String(i + 1).padStart(2, '0'), x, top + 0.02, eyebrow(0.065, ink.brass))
        pen.text(title, x + 0.34, top, { size: 0.11, weight: 700, color: ink.text })
        pen.text(detail, x + 0.34, top + 0.16, body(0.07, ink.muted))
      })
    }} />
    <Board width={3.4} height={0.4} position={[9.1, 0.58, -7.5]} rotation={FACE.left} link="/for-agencies/" draw={actionPlate('See the agency model')} />

    {/* right wall: where to bring me in */}
    <Slats width={1.3} height={3.6} position={[6.55, 2.05, 7.5]} rotation={FACE.right} />
    <Slats width={1.3} height={3.6} position={[15.85, 2.05, 7.5]} rotation={FACE.right} />
    <Lettering width={7.6} height={0.9} position={[11.2, 3.55, 7.5]} rotation={FACE.right} draw={brassTitle([['The right help, at the ', 'right stage.']], 0.42)} />
    <Board width={7.6} height={1.75} position={[11.2, 2.15, 7.5]} rotation={FACE.right} link="/services/" draw={(pen) => {
      const ink = ON_DARK
      pen.text(hero.eyebrow, 0.1, 0.1, eyebrow(0.07, ink.brass))
      const y = pen.flow([{ text: hero.intro, style: body(0.1, ink.body) }], 0.1, 0.3, 7.1, { lineHeight: 1.5 })
      pen.flow([{ text: 'A new product, an existing website or an approved design ready to build. Bring me in where you need the work.', style: body(0.1, ink.text, 700) }], 0.1, y + 0.14, 7.1, { lineHeight: 1.5 })
    }} />
    <Board width={3.4} height={0.4} position={[13.3, 0.98, 7.5]} rotation={FACE.right} link="/services/" draw={actionPlate('Explore all services')} />
    <Board width={3.4} height={0.4} position={[9.1, 0.98, 7.5]} rotation={FACE.right} link="/contact/" draw={actionPlate('Discuss your project')} />
  </>
}

/* ------------------------------------------------------------------ About */
const NICHE = { x: 18.875, y: 2.325, w: 2.34, h: 2.94, z: [-5.1, -1.7, 1.7, 5.1] }
// Usman's portrait; swap the file for the original photo when it arrives
const PORTRAIT = '/assets/about/portrait-editorial.webp'

function AboutExhibit() {
  const hero = sectionHeroes.about
  const ink = ON_LIGHT
  const niche = (z, draw) => <Print width={NICHE.w} height={NICHE.h} position={[NICHE.x, NICHE.y, z]} rotation={FACE.far} glow ppm={380} draw={draw} />
  return <>
    {/* the four lit niches in the walnut wall: the years, the portrait, the practice, the path */}
    {niche(NICHE.z[0], (pen, { width }) => {
      pen.text(hero.heroNote.label, 0.18, 0.3, eyebrow(0.07, ink.muted))
      pen.text('16+', 0.12, 0.62, { size: 0.95, weight: 800, color: ink.text })
      pen.text('YEARS', 0.18, 1.62, eyebrow(0.11, ink.accent))
      pen.flow([{ text: hero.heroNote.detail, style: body(0.1, ink.body) }], 0.18, 1.98, width - 0.36, { lineHeight: 1.45 })
    })}
    <FramedPortrait url={PORTRAIT} position={[NICHE.x - 0.03, NICHE.y, NICHE.z[1]]} rotation={FACE.far} />
    {niche(NICHE.z[2], (pen, { width }) => {
      let y = pen.flow([{ text: 'Design and development, in the same hands.', style: { size: 0.21, weight: 700, color: ink.text } }], 0.18, 0.3, width - 0.36, { lineHeight: 1.08 })
      y = pen.flow([{ text: 'I shape interfaces around the people using them, then carry the design into responsive frontend.', style: body(0.092, ink.body) }], 0.18, y + 0.2, width - 0.36, { lineHeight: 1.5 })
      pen.flow([{ text: 'For 16+ years, my work has spanned business products, websites and agency production.', style: body(0.092, ink.body) }], 0.18, y + 0.14, width - 0.36, { lineHeight: 1.5 })
    })}
    {niche(NICHE.z[3], (pen) => {
      pen.text('EXPERIENCE', 0.18, 0.3, eyebrow(0.07, ink.muted))
      ;[['eWorx International', 'Product Designer', '2019–present'], ['ArhamSoft', 'Senior Web Designer', '2012–2019']].forEach(([company, role, years], i) => {
        const top = 0.66 + i * 0.95
        pen.text(company, 0.18, top, { size: 0.17, weight: 700, color: ink.text })
        pen.text(role, 0.18, top + 0.26, body(0.1, ink.body))
        pen.text(years, 0.18, top + 0.44, eyebrow(0.07, ink.accent))
      })
    })}

    {/* the web version: a blade sign out from the left wall, toward the far corner */}
    <WebVersionSign route="/about/" position={[17.0, WEB_SIGN.y, -7.5]} rotation={FACE.left} />

    {/* left wall: the line, in satin black and cobalt letters standing off the travertine */}
    <Lettering width={8.8} height={1.6} position={[11.4, 3.3, -7.5]} rotation={FACE.left} draw={(pen, { width }) => {
      let y = pen.flow([{ text: 'I design the interface.', style: { size: 0.62, weight: 700, color: '#1c2534' } }], 0, 0.04, width, { lineHeight: 1.04 })
      pen.flow([{ text: 'Then I ', style: { size: 0.62, weight: 700, color: '#1c2534' } }, { text: 'build it.', style: { size: 0.65, weight: 500, family: 'serif', italic: true, color: '#3c52e6' } }], 0, y, width, { lineHeight: 1.04 })
    }} />
    <Board width={5.4} height={1.25} position={[9.7, 1.6, -7.5]} rotation={FACE.left} link="/about/" draw={(pen) => {
      const dark = ON_DARK
      pen.text(hero.eyebrow, 0.08, 0.08, eyebrow(0.065, dark.brass))
      const y = pen.flow([{ text: hero.intro, style: body(0.095, dark.body) }], 0.08, 0.26, 5.1, { lineHeight: 1.5 })
      pen.text('Explore the practice ↗', 0.08, y + 0.06, { size: 0.1, weight: 700, color: dark.accent })
    }} />

    {/* right wall: the practice in brass and the way to start, as one piece in the middle of the
        wall - centred along it (x 3.61 to 18.61) and up it (floor to ceiling, 2.93 at the middle) */}
    <Lettering width={8.8} height={1.27} position={[11.11, 3.49, 7.5]} rotation={FACE.right} draw={brassTitle([['Good ideas deserve a', ''], ['considered ', 'interface.']], 0.56, 'center')} />
    <Board width={5.6} height={0.82} finish="walnut" position={[11.11, 2.15, 7.5]} rotation={FACE.right} link="/contact/" draw={(pen, { width }) => {
      const dark = ON_DARK
      const mid = width / 2
      let y = pen.flow([{ text: 'Product interfaces, websites and production work. Designed for people, built for the real world.', style: body(0.105, dark.text, 600) }], mid, 0.1, width - 0.3, { lineHeight: 1.45, align: 'center' })
      y = pen.text('Based in Lahore, Pakistan · Working with clients and agencies globally.', mid, y + 0.06, { ...body(0.075, dark.body), align: 'center' })
      pen.text('Talk about your project ↗', mid, y + 0.09, { size: 0.105, weight: 700, color: dark.accent, align: 'center' })
    }} />
  </>
}

/* ------------------------------------------------------------------ Work */
const GATES = [8.81, 13.61, 18.41, 23.21]          // front faces of the four light gates
const BAYS = [11.3, 16.1, 20.9]                     // the wall between one gate and the next
const SCREEN = { w: 3.4, h: 2.125, y: 2.35 }

function ProjectExhibit({ project, index, x, side }) {
  const z = side === 'left' ? -5 : 5
  const rotation = side === 'left' ? FACE.left : FACE.right
  const link = `/work/${project.slug}/`
  return <>
    <LedScreen url={projectAsset(project.slug, 'showcase-1x.webp')} width={SCREEN.w} height={SCREEN.h} position={[x, SCREEN.y, z]} rotation={rotation} link={link} />
    <Board width={SCREEN.w} height={0.62} position={[x, 0.86, z]} rotation={rotation} link={link} ppm={400} draw={(pen, { width }) => {
      const ink = ON_DARK
      pen.text(`${String(index + 1).padStart(2, '0')} / ${project.category.toUpperCase()}`, 0.06, 0.06, eyebrow(0.05, ink.brass))
      pen.text(project.title, 0.06, 0.17, { size: 0.17, weight: 800, color: ink.text })
      pen.text(project.role, 0.06, 0.4, body(0.065, ink.body))
      pen.text('VIEW PROJECT ↗', width - 0.06, 0.42, { ...eyebrow(0.05, ink.accent), align: 'right' })
    }} />
  </>
}

function WorkExhibit() {
  const hero = sectionHeroes.work
  const labels = [0, 1, 2].map((bay) => projects.slice(bay * 2, bay * 2 + 2).map((p) => p.title.toUpperCase()).join('  ·  '))
  return <>
    {projects.slice(0, 6).map((project, i) => <ProjectExhibit key={project.slug} project={project} index={i} x={BAYS[Math.floor(i / 2)]} side={i % 2 ? 'right' : 'left'} />)}

    {/* brass letters on each gate's head name the projects in the bay it opens onto */}
    {GATES.map((x, i) => <Lettering
      key={x}
      width={3.2}
      height={0.3}
      position={[x - 0.004, 3.835, 0]}
      rotation={FACE.far}
      ppm={1600}
      draw={(pen, { width, height }) => {
        pen.text(i === 3 ? 'THE FULL GALLERY' : labels[i], width / 2, (height - 0.1) / 2, { ...eyebrow(0.1, BRASS_LIGHT), align: 'center' })
      }}
    />)}

    {/* the light box at the end of the gallery */}
    {/* the web version: a blade sign out from the left wall by the second gate, above the screens */}
    <WebVersionSign route="/work/" position={[13.7, 3.98, -5]} rotation={FACE.left} />
    <Print width={5.8} height={3.4} position={[27.64, 2.03, 0]} rotation={FACE.far} glow ppm={320} link="/work/" draw={(pen, { width }) => {
      const ink = ON_LIGHT
      let y = pen.text(hero.eyebrow, width / 2, 0.42, { ...eyebrow(0.1, ink.muted), align: 'center' })
      y = pen.flow(titleRuns(hero.title, 0.56, ink), width / 2, y + 0.16, width - 0.6, { lineHeight: 1.04, align: 'center' })
      y = pen.flow([{ text: hero.intro, style: body(0.13, ink.body) }], width / 2, y + 0.24, width - 1.2, { lineHeight: 1.5, align: 'center' })
      pen.text('OPEN THE FULL GALLERY ↗', width / 2, y + 0.3, { ...eyebrow(0.08, ink.accent), align: 'center' })
    }} />
  </>
}

/* ------------------------------------------------------------------ Contact */
/* The hall's great glass wall: one sheet between the brass fins, the city beyond it. */
let facadeSheen = null
function GlassFacade() {
  if (!facadeSheen) {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const g = c.getContext('2d')
    const grd = g.createLinearGradient(0, 0, 512, 128)
    grd.addColorStop(0, 'rgba(255,255,255,0.05)')
    grd.addColorStop(0.35, 'rgba(255,255,255,0.012)')
    grd.addColorStop(0.36, 'rgba(255,255,255,0)')
    grd.addColorStop(0.62, 'rgba(255,255,255,0)')
    grd.addColorStop(0.63, 'rgba(255,255,255,0.03)')
    grd.addColorStop(1, 'rgba(255,255,255,0.008)')
    g.fillStyle = grd
    g.fillRect(0, 0, 512, 128)
    facadeSheen = new THREE.CanvasTexture(c)
  }
  const material = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: facadeSheen, color: '#cfe0ea', transparent: true, depthWrite: false }), []))
  return <mesh material={material} position={[21.27, 2.88, 0]} rotation={FACE.far} raycast={() => null} renderOrder={3}>
    <planeGeometry args={[24, 5.7]} />
  </mesh>
}

function ContactExhibit() {
  const hero = sectionHeroes.contact
  return <>
    <GlassFacade />
    <UsmanDesk />

    {/* brass on the walnut wall, with the brief and the address beneath it */}
    <Lettering width={10} height={1.75} position={[12.4, 3.75, -12]} rotation={FACE.left} draw={brassTitle([['Let’s talk about', ''], ['', 'your next project.']], 0.66)} />
    <Board width={7.8} height={1.3} position={[11.3, 2.0, -12]} rotation={FACE.left} link="/contact/" draw={(pen) => {
      const ink = ON_DARK
      pen.text(hero.eyebrow, 0.1, 0.1, eyebrow(0.07, ink.brass))
      const y = pen.flow([{ text: 'A rough scope, reference or live URL is enough to begin. Share what exists, what needs to change and your timing.', style: body(0.1, ink.body) }], 0.1, 0.3, 7.3, { lineHeight: 1.5 })
      pen.text('Send a brief ↗', 0.1, y + 0.1, { size: 0.13, weight: 700, color: ink.accent })
    }} />
    <Board width={4.6} height={0.62} position={[11.2, 0.98, -12]} rotation={FACE.left} link="mailto:brief@usmankhairdin.com" draw={(pen) => {
      const ink = ON_DARK
      pen.text('brief@usmankhairdin.com ↗', 0.1, 0.08, { size: 0.2, weight: 700, color: ink.brass })
      pen.text('Based in Lahore, Pakistan · Working with clients and agencies globally.', 0.1, 0.36, body(0.065, ink.muted))
    }} />

    {/* the web version: a blade sign out from the travertine, near the glass */}
    <WebVersionSign route="/contact/" position={[17.6, WEB_SIGN.y, 12]} rotation={FACE.right} />

    {/* on the travertine opposite: how a start looks, and the agency route */}
    <Board width={3.4} height={2.2} position={[13.6, 2.05, 12]} rotation={FACE.right} draw={(pen, { width }) => {
      const ink = ON_DARK
      pen.text(hero.heroNote.label, 0.08, 0.1, eyebrow(0.065, ink.brass))
      pen.text('Clear start.', 0.08, 0.32, { size: 0.3, weight: 800, color: ink.text })
      pen.flow([{ text: hero.heroNote.detail, style: body(0.095, ink.body) }], 0.08, 0.8, width - 0.2, { lineHeight: 1.5 })
    }} />
    <Board width={3.4} height={2.2} position={[9.4, 2.05, 12]} rotation={FACE.right} link="/for-agencies/" draw={(pen, { width }) => {
      const ink = ON_DARK
      pen.text('FOR AGENCIES', 0.08, 0.1, eyebrow(0.065, ink.brass))
      let y = pen.flow([{ text: 'Coming from an agency?', style: { size: 0.22, weight: 800, color: ink.text } }], 0.08, 0.32, width - 0.2, { lineHeight: 1.08 })
      y = pen.flow([{ text: 'White-label design and frontend production, starting with a focused paid pilot.', style: body(0.095, ink.body) }], 0.08, y + 0.12, width - 0.2, { lineHeight: 1.5 })
      pen.flow([{ text: 'Explore the partnership model ↗', style: { size: 0.095, weight: 700, color: ink.accent } }], 0.08, y + 0.14, width - 0.2)
    }} />
  </>
}

/* ------------------------------------------------------------------ Contact: Usman's desk */
// By the glass on the walnut side: a walnut desk on black steel frames, his chair pulled up to
// it, and his laptop open on the Contact page (a link to it), the city at his right hand.
const DESK = { x: 17.5, z: -9.0, w: 1.8, d: 0.8, h: 0.74, top: 0.038 }
const LAPTOP = { w: 0.304, d: 0.212, h: 0.0156, lid: 0.0055, open: (112 * Math.PI) / 180 }

let deskMaps = null
function roundRect(g, x, y, w, h, r) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}
function deskTextures() {
  if (deskMaps) return deskMaps
  // the laptop's deck: keys in their well, and the trackpad
  const k = document.createElement('canvas')
  k.width = 1024
  k.height = 712
  const g = k.getContext('2d')
  g.fillStyle = '#5b5e64'
  g.fillRect(0, 0, 1024, 712)
  g.fillStyle = '#2a2c30'
  roundRect(g, 52, 34, 920, 398, 16)
  g.fill()
  const rows = [[14, 0.62], [14, 1], [14, 1], [13, 1], [12, 1], [9, 1]]
  let y = 46
  rows.forEach(([n, scale], r) => {
    const h = 58 * scale
    const gap = 7
    const w = (896 - gap * (n - 1)) / n
    for (let i = 0; i < n; i++) {
      // the bottom row: a wide space bar in the middle
      let x = 64 + i * (w + gap)
      let kw = w
      if (r === 5) {
        const unit = (896 - gap * 8) / 12
        const widths = [1, 1, 1, 1.4, 4.2, 1.4, 1, 1, 1]
        x = 64 + widths.slice(0, i).reduce((a, b) => a + b * unit + gap, 0)
        kw = widths[i] * unit
      }
      g.fillStyle = '#0d0e10'
      roundRect(g, x, y, kw, h, 7)
      g.fill()
      g.fillStyle = 'rgba(255,255,255,0.05)'
      roundRect(g, x + 2, y + 2, kw - 4, h * 0.45, 6)
      g.fill()
    }
    y += h + gap
  })
  g.fillStyle = '#62656b'
  roundRect(g, 512 - 205, 466, 410, 222, 18)
  g.fill()
  g.strokeStyle = 'rgba(0,0,0,0.25)'
  g.lineWidth = 2
  g.stroke()
  const keyboard = new THREE.CanvasTexture(k)
  keyboard.colorSpace = THREE.SRGBColorSpace
  keyboard.anisotropy = 8
  // a soft contact shadow, for anything standing on the floor or the desk
  const s = document.createElement('canvas')
  s.width = s.height = 128
  const sg = s.getContext('2d')
  sg.filter = 'blur(14px)'
  sg.fillStyle = '#fff'
  sg.fillRect(26, 26, 76, 76)
  const shadow = new THREE.CanvasTexture(s)
  deskMaps = { keyboard, shadow }
  return deskMaps
}

function ContactShadow({ width, depth, position, opacity = 0.45 }) {
  const { shadow } = deskTextures()
  const material = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({
    color: '#000000', alphaMap: shadow, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4,
  }), [shadow, opacity]))
  return <mesh material={material} position={position} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={1}>
    <planeGeometry args={[width, depth]} />
  </mesh>
}

function useDeskMaterials() {
  const tex = useRoomTextures()
  return useMemo(() => {
    const lit = (params, level = 0.95, key = 0.6) => roomLit(new THREE.MeshStandardMaterial(params), level, { key })
    return {
      walnut: lit({ map: tex.oak.map, roughnessMap: tex.oak.orm, normalMap: tex.oak.normal, color: '#68503d', roughness: 1 }, 1, 0.7),
      steel: lit({ color: '#121418', roughness: 0.45, metalness: 0.35 }, 0.9),
      leather: lit({ color: '#17181b', roughness: 0.42 }, 1, 0.75),
      aluminium: lit({ color: '#80858d', roughness: 0.28, metalness: 0.6 }, 0.9, 0.75),
      graphite: lit({ color: '#4d5056', roughness: 0.3, metalness: 0.5 }, 1, 0.65),
      bezel: lit({ color: '#08090b', roughness: 0.2 }, 0.8),
      rubber: lit({ color: '#0b0b0c', roughness: 0.7 }, 0.8),
      ceramic: lit({ color: '#ece6dc', roughness: 0.32 }, 1, 0.6),
      coffee: lit({ color: '#2a170c', roughness: 0.15 }, 0.8),
      cover: lit({ color: '#1c2638', roughness: 0.6 }, 0.95),
      paper: lit({ color: '#efe8da', roughness: 0.9 }, 1),
      brass: lit({ color: BRASS, roughness: 0.3, metalness: 0.4 }, 1.1),
      mouse: lit({ color: '#e9e9ea', roughness: 0.22 }, 1, 0.6),
    }
  }, [tex])
}

function Laptop({ mats, position, rotation }) {
  const { keyboard } = deskTextures()
  const texture = useCoverTexture('/assets/rooms/laptop-contact.webp', 0.286, 0.179)
  const screen = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, color: new THREE.Color(0.86, 0.86, 0.86) }), [texture]))
  const deck = useDisposable(useMemo(() => roomLit(new THREE.MeshStandardMaterial({ map: keyboard, roughness: 0.5, metalness: 0.3 }), 1, { key: 0.65 }), [keyboard]))
  const { sheen, spill } = screenTextures()
  const glass = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: sheen, transparent: true, opacity: 0.6, depthWrite: false }), [sheen]))
  const glow = useDisposable(useMemo(() => new THREE.MeshBasicMaterial({ map: spill, color: '#7f95ff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }), [spill]))
  const geo = useMemo(() => ({
    base: new RoundedBoxGeometry(LAPTOP.w, LAPTOP.h, LAPTOP.d, 3, 0.006),
    lid: new RoundedBoxGeometry(LAPTOP.w, LAPTOP.d, LAPTOP.lid, 3, 0.0025),
  }), [])
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])
  const screenRef = useRef()
  const handlers = useLinkTarget(screenRef, '/contact/', screen, 1.1)
  const L = LAPTOP
  // origin: the hinge, on the desk; the keyboard runs toward +z, the screen faces +z
  return <group position={position} rotation={rotation}>
    <mesh geometry={geo.base} material={mats.graphite} position={[0, L.h / 2, L.d / 2]} />
    <mesh material={deck} position={[0, L.h + 0.0004, L.d / 2 + 0.002]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[L.w - 0.016, L.d - 0.02]} />
    </mesh>
    {/* the screen's light on the desk in front of it */}
    <mesh material={glow} position={[0, 0.0006, L.d * 0.9]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={2}>
      <planeGeometry args={[0.6, 0.42]} />
    </mesh>
    <group position={[0, L.h, 0.004]} rotation={[-(L.open - Math.PI / 2), 0, 0]}>
      <mesh geometry={geo.lid} material={mats.graphite} position={[0, L.d / 2, -L.lid / 2]} />
      <mesh material={mats.bezel} position={[0, L.d / 2, 0.0004]}><planeGeometry args={[L.w - 0.005, L.d - 0.005]} /></mesh>
      <mesh ref={screenRef} material={screen} position={[0, L.d / 2 + 0.006, 0.0008]} {...handlers}><planeGeometry args={[0.286, 0.179]} /></mesh>
      <mesh material={glass} position={[0, L.d / 2, 0.0012]} raycast={() => null} renderOrder={3}><planeGeometry args={[L.w - 0.005, L.d - 0.005]} /></mesh>
    </group>
  </group>
}

/* A task chair in the Aluminium Group manner: five-star base on castors, black leather. */
function Chair({ mats, position, rotation }) {
  const geo = useMemo(() => ({
    seat: new RoundedBoxGeometry(0.5, 0.085, 0.49, 4, 0.034),
    back: new RoundedBoxGeometry(0.47, 0.62, 0.07, 4, 0.03),
    pad: new RoundedBoxGeometry(0.055, 0.026, 0.27, 3, 0.012),
  }), [])
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])
  const spokes = [0, 1, 2, 3, 4].map((i) => (i * Math.PI * 2) / 5 + 0.3)
  return <group position={position} rotation={rotation}>
    {spokes.map((a) => <group key={a} rotation={[0, a, 0]}>
      <mesh material={mats.aluminium} position={[0, 0.082, 0.16]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.042, 0.026, 0.3]} /></mesh>
      <mesh material={mats.rubber} position={[0, 0.03, 0.31]}><sphereGeometry args={[0.029, 16, 12]} /></mesh>
    </group>)}
    <mesh material={mats.aluminium} position={[0, 0.095, 0]}><cylinderGeometry args={[0.045, 0.05, 0.05, 24]} /></mesh>
    <mesh material={mats.steel} position={[0, 0.2, 0]}><cylinderGeometry args={[0.032, 0.032, 0.18, 20]} /></mesh>
    <mesh material={mats.aluminium} position={[0, 0.35, 0]}><cylinderGeometry args={[0.022, 0.022, 0.16, 20]} /></mesh>
    <mesh material={mats.steel} position={[0, 0.435, 0.02]}><boxGeometry args={[0.2, 0.035, 0.22]} /></mesh>
    <mesh geometry={geo.seat} material={mats.leather} position={[0, 0.49, 0]} />
    {/* the spine up to the back, and the back, leaning a little */}
    <mesh material={mats.aluminium} position={[0, 0.6, 0.255]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.05, 0.3, 0.022]} /></mesh>
    <mesh geometry={geo.back} material={mats.leather} position={[0, 0.88, 0.3]} rotation={[0.2, 0, 0]} />
    {[-1, 1].map((s) => <group key={s} position={[s * 0.275, 0, 0.02]}>
      <mesh material={mats.aluminium} position={[0, 0.6, 0.04]}><boxGeometry args={[0.024, 0.2, 0.045]} /></mesh>
      <mesh geometry={geo.pad} material={mats.leather} position={[0, 0.712, 0]} />
    </group>)}
  </group>
}

function Cup({ mats, position }) {
  const geo = useMemo(() => {
    const pts = [[0, 0], [0.033, 0], [0.036, 0.004], [0.04, 0.085], [0.042, 0.092], [0.038, 0.092], [0.035, 0.012], [0, 0.012]].map(([x, y]) => new THREE.Vector2(x, y))
    return { body: new THREE.LatheGeometry(pts, 40), handle: new THREE.TorusGeometry(0.022, 0.0055, 10, 24, Math.PI) }
  }, [])
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])
  return <group position={position}>
    <mesh geometry={geo.body} material={mats.ceramic} />
    <mesh material={mats.coffee} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.037, 32]} /></mesh>
    <mesh geometry={geo.handle} material={mats.ceramic} position={[0.04, 0.048, 0]} rotation={[0, 0, -Math.PI / 2]} />
  </group>
}

function UsmanDesk() {
  const mats = useDeskMaterials()
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  const top = useMemo(() => new RoundedBoxGeometry(DESK.w, DESK.top, DESK.d, 3, 0.008), [])
  useEffect(() => () => top.dispose(), [top])
  const legH = DESK.h - DESK.top
  return <group position={[DESK.x, FLOOR, DESK.z]}>
    <ContactShadow width={2.2} depth={1.25} position={[0, 0.003, 0.05]} opacity={0.5} />
    <mesh geometry={top} material={mats.walnut} position={[0, DESK.h - DESK.top / 2, 0]} />
    {/* two sled frames in black steel, and a rail tying them under the top */}
    {[-1, 1].map((s) => <group key={s} position={[s * 0.78, 0, 0]}>
      {[-1, 1].map((e) => <mesh key={e} material={mats.steel} position={[0, legH / 2, e * 0.34]}><boxGeometry args={[0.032, legH, 0.032]} /></mesh>)}
      <mesh material={mats.steel} position={[0, 0.016, 0]}><boxGeometry args={[0.032, 0.032, 0.72]} /></mesh>
      <mesh material={mats.steel} position={[0, legH - 0.016, 0]}><boxGeometry args={[0.032, 0.032, 0.72]} /></mesh>
    </group>)}
    <mesh material={mats.steel} position={[0, legH - 0.04, -0.33]}><boxGeometry args={[1.56, 0.07, 0.02]} /></mesh>
    {/* on the desk: the laptop, its mouse, a notebook and pen, a coffee */}
    <group position={[0, DESK.h, 0]}>
      <ContactShadow width={0.4} depth={0.3} position={[-0.04, 0.001, -0.02]} opacity={0.35} />
      <Laptop mats={mats} position={[-0.04, 0, -0.13]} rotation={[0, -0.06, 0]} />
      <mesh material={mats.mouse} position={[0.3, 0.015, 0.13]} scale={[0.031, 0.016, 0.056]}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <group position={[-0.5, 0, 0.06]} rotation={[0, 0.16, 0]}>
        <mesh material={mats.cover} position={[0, 0.008, 0]}><boxGeometry args={[0.15, 0.016, 0.21]} /></mesh>
        <mesh material={mats.paper} position={[0.077, 0.008, 0]}><boxGeometry args={[0.004, 0.012, 0.204]} /></mesh>
        <group position={[0.02, 0.0205, -0.01]} rotation={[0, 0.35, 0]}>
          <mesh material={mats.brass} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0042, 0.0042, 0.14, 12]} /></mesh>
        </group>
      </group>
      <Cup mats={mats} position={[0.6, 0, -0.2]} />
    </group>
    {/* his chair, pulled up to the desk and turned a little */}
    <ContactShadow width={0.8} depth={0.8} position={[-0.05, 0.003, 0.82]} opacity={0.4} />
    <Chair mats={mats} position={[-0.05, 0, 0.82]} rotation={[0, 0.2, 0]} />
  </group>
}

const EXHIBITS = { services: ServicesExhibit, about: AboutExhibit, process: WorkExhibit, contact: ContactExhibit }

export default function RoomExhibits({ kind }) {
  const Exhibit = EXHIBITS[kind]
  return <>
    <CeilingLights kind={kind} />
    {Exhibit && <Exhibit />}
  </>
}
