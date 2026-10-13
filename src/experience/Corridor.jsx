import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { doors } from '../data/projects.js'
import DoorPortal from './DoorPortal.jsx'
import { useSurface } from './surfaces.js'
import { FloorSculpture, GalleryArtwork } from './GalleryArtwork.jsx'
import { Planter, createPlantMaterials } from './OrganicObjects.jsx'
import EntranceDoor, { ENTRANCE_OPENING } from './EntranceDoor.jsx'
import CorridorExterior from './CorridorExterior.jsx'
import { ART, END_Z, PLANTS, SCULPTURES, START_Z } from './corridorLayout.js'
import { CorridorProbe } from './CorridorAtmosphere.jsx'
import { GalleryFinishContext, PALETTE } from './GalleryFabrication.jsx'
import { createCorridorMaterials, createGalleryFinishes, floorWashMap, metricBox, metricPlane, useCorridorTextures, wallWashMap } from './corridorMaterials.js'
import { floorReflection } from './floorReflection.js'
import { CORRIDOR_WALL_THICKNESS, CORRIDOR_WALL_X, ROOM_BACK_X } from '../rooms/roomCoordinates.js'

/*
 * Corridor architecture. The physical build-up follows the Shahz Connect corridor (used with
 * the owner's permission): a mirror-polished stone floor, a shadow-gap skirting, wall-washing
 * coves and concealed light. The design is the portfolio's own: a chevron of dark marble with a
 * brass spine; walls of matte large-format travertine punctuated by slotted cobalt felt bands
 * with brass edges; a dark ceiling with floating oak rafts on concealed light; walnut doors in
 * dark bronze portals. The rooms behind the doors come from the reference too (see rooms/).
 *
 * The corridor's wall line is stated once, in roomCoordinates, because the room shell is
 * built up to the room-side face of this same wall. Only the CORRIDOR face of that wall takes
 * the stone: its room side keeps its original plaster, behind each room's own door wall.
 */
const WALL_X = CORRIDOR_WALL_X
const T = CORRIDOR_WALL_THICKNESS
const FACE_X = CORRIDOR_WALL_X - T / 2
const FLOOR_Y = -0.075
const WALL_H = 3.675                    // floor line to wall top
const WALL_Y = FLOOR_Y + WALL_H / 2
const CEILING_Y = 3.53                  // ceiling underside
const SKIRT = { proud: 0.012, height: 0.07 }
const WALL_WASH = 0.85                  // lightMapIntensity of the cove wash on the stone
const FLOOR_WASH = 0.5
const FLOOR_BORDER = 0.46               // navy marble border along each wall
const FLOOR_INLAY = 0.05                // brass inlay, this far inside the border
const LENGTH = START_Z + 0.3 - (END_Z - 0.1)   // from just outside the entrance threshold to the end wall
const MID_Z = (START_Z + 0.3 + END_Z - 0.1) / 2


/* Where the wall runs between door openings start and stop, per side. */
function wallRuns(side) {
  const gaps = doors
    .filter((d) => d.side === side)
    .map((d) => [d.z + 1.10, d.z - 1.10])
    .sort((a, b) => b[0] - a[0])
  const runs = []
  let cursor = START_Z - 0.2
  gaps.forEach(([front, back]) => {
    if (cursor > front) runs.push([cursor, front])
    cursor = back
  })
  if (cursor > END_Z) runs.push([cursor, END_Z])
  return { runs, gaps }
}

/* Cobalt felt bands punctuate the stone every 8 m, kept clear of doors, art and plants. */
const BAND = { step: 8, width: 0.62, proud: 0.03, trim: 0.03, trimProud: 0.036, doorClear: 2.3, artClear: 1.95, plantClear: 0.95 }
function bandPositions(side) {
  const out = []
  for (let z = 10; z > END_Z + 2; z -= BAND.step) {
    const nearDoor = doors.some((d) => d.side === side && Math.abs(z - d.z) < BAND.doorClear)
    const nearArt = ART.some(([s, az]) => s === side && Math.abs(z - az) < BAND.artClear)
    const nearPlant = PLANTS.some(([s, pz]) => s === side && Math.abs(z - pz) < BAND.plantClear)
    if (!nearDoor && !nearArt && !nearPlant) out.push(z)
  }
  return out
}

/* Box material order: px, nx, py, ny, pz, nz. The corridor face of a left wall is +x. */
const corridorFaces = (side) => (side === 'left' ? [0, 4, 5] : [1, 4, 5])
function wallMaterials(side, corridor, room) {
  const list = [room, room, room, room, corridor, corridor]
  list[side === 'left' ? 0 : 1] = corridor
  return list
}

function WallSide({ side, mats }) {
  const sign = side === 'right' ? 1 : -1
  const { runs, gaps } = useMemo(() => wallRuns(side), [side])
  const geometry = useMemo(() => ({
    runs: runs.map(([a, b]) => metricBox(T, WALL_H, a - b, corridorFaces(side))),
    headers: gaps.map(([front, back]) => metricBox(T, 0.53, front - back, corridorFaces(side))),
    skirts: runs.map(([a, b]) => metricBox(SKIRT.proud, SKIRT.height, a - b)),
  }), [runs, gaps, side])
  useEffect(() => () => Object.values(geometry).flat().forEach((g) => g.dispose()), [geometry])
  const runMats = useMemo(() => wallMaterials(side, mats.stoneWall, mats.roomSide), [side, mats])
  const headerMats = useMemo(() => wallMaterials(side, mats.stoneHeader, mats.roomSide), [side, mats])

  return <>
    {runs.map(([a, b], i) => <group key={`${side}-${i}`}>
      {/* One continuous wall all the way to the floor: stone on the corridor face only. */}
      <mesh geometry={geometry.runs[i]} material={runMats} position={[sign * WALL_X, WALL_Y, (a + b) / 2]} />
      {/* Shadow-gap skirting: a thin dark metal line where wall meets floor. */}
      <mesh geometry={geometry.skirts[i]} material={mats.shadowGap} position={[sign * (FACE_X - SKIRT.proud / 2), FLOOR_Y + SKIRT.height / 2, (a + b) / 2]} />
    </group>)}

    {/* Solid wall header above every doorway, so the wall continues between lintel and ceiling. */}
    {gaps.map(([front, back], i) => <mesh
      key={`header-${side}-${i}`}
      geometry={geometry.headers[i]}
      material={headerMats}
      position={[sign * WALL_X, 3.335, (front + back) / 2]}
    />)}
  </>
}

/* Felt bands and their brass edge trims, instanced: two draw calls for the whole corridor. */
function FeltBands({ mats }) {
  const bands = useRef()
  const trims = useRef()
  const items = useMemo(() => ['left', 'right'].flatMap((side) => bandPositions(side).map((z) => ({ sign: side === 'right' ? 1 : -1, z }))), [])
  const height = CEILING_Y - (FLOOR_Y + SKIRT.height)
  const geometry = useMemo(() => ({
    band: metricBox(BAND.proud, height, BAND.width),
    trim: metricBox(BAND.trimProud, height, BAND.trim),
  }), [height])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const y = FLOOR_Y + SKIRT.height + height / 2
    items.forEach(({ sign, z }, i) => {
      bands.current.setMatrixAt(i, m.makeTranslation(sign * (FACE_X - BAND.proud / 2), y, z))
      ;[-1, 1].forEach((edge, j) => {
        trims.current.setMatrixAt(i * 2 + j, m.makeTranslation(sign * (FACE_X - BAND.trimProud / 2), y, z + edge * (BAND.width / 2 + BAND.trim / 2)))
      })
    })
    bands.current.instanceMatrix.needsUpdate = true
    trims.current.instanceMatrix.needsUpdate = true
  }, [items, height])

  return <>
    <instancedMesh ref={bands} args={[geometry.band, mats.felt, items.length]} frustumCulled={false} />
    <instancedMesh ref={trims} args={[geometry.trim, mats.brassSatin, items.length * 2]} frustumCulled={false} />
  </>
}

/*
 * The ceiling: a deep ink plane with floating oak rafts between the doors, each lifted off
 * the ceiling by a warm halo of concealed light, and a soft concealed line of light along the
 * top of each wall. Over every door, where the rafts break, a concealed downlight pools warm
 * light on the floor - there is no visible fitting, only the light.
 *
 * Everything that glows up here is a soft gradient, and nothing sits within the depth
 * buffer's reach of the ceiling, so the far end of the corridor stays perfectly still as the
 * visitor walks.
 */
const DOWNLIGHT = { y: 3.2, intensity: 2.6, distance: 11 }
const DOWNLIGHT_Z = [4, ...doors.map((d) => d.z)]
const RAFT = { width: 3.4, depth: 0.12, drop: 0.24, clear: 2.4, haloDrop: 0.03 }
const COVE = { width: 1.0, inset: 0.16 }
const raftSpans = () => DOWNLIGHT_Z.slice(0, -1).map((a, i) => {
  const b = DOWNLIGHT_Z[i + 1]
  return { z: (a + b) / 2, length: Math.abs(a - b) - RAFT.clear * 2 }
}).filter((r) => r.length > 3)

/*
 * Concealed light: a warm glow that falls away from a rectangle (the core) with no hard edge
 * anywhere. It fades with the scene's fog toward nothing, as light would, and is drawn a hair
 * forward of the ceiling it lies against.
 */
function glowMaterial({ plane, core, falloff = 0.34, strength = 0.85 }) {
  const uniforms = {
    uPlane: { value: new THREE.Vector2(plane[0], plane[1]) },
    uCore: { value: new THREE.Vector2(core[0], core[1]) },
    uFalloff: { value: falloff },
    uStrength: { value: strength },
    uColor: { value: new THREE.Color(1.0, 0.78, 0.52) },
    uFogNear: { value: 1e4 },
    uFogFar: { value: 2e4 },
  }
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -8,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      uniform vec2 uPlane; uniform vec2 uCore; uniform float uFalloff; uniform float uStrength; uniform vec3 uColor;
      uniform float uFogNear; uniform float uFogFar;
      void main() {
        vec2 p = (vUv - 0.5) * uPlane;
        vec2 d = max(abs(p) - uCore * 0.5, 0.0);
        vec2 edge = 0.5 * uPlane - abs(p);
        float fade = smoothstep(0.0, 0.3, min(edge.x, edge.y)) * (1.0 - smoothstep(uFogNear, uFogFar, vDepth));
        float a = exp(-length(d) / uFalloff) * uStrength * fade;
        gl_FragColor = vec4(uColor * a, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  material.onBeforeRender = (renderer, scene) => {
    if (!scene.fog) return
    uniforms.uFogNear.value = scene.fog.near
    uniforms.uFogFar.value = scene.fog.far
  }
  return material
}

/* A floating oak raft: one solid timber-faced panel, lifted off the ceiling by its halo. */
function Raft({ span, mats }) {
  const y = CEILING_Y - RAFT.drop - RAFT.depth / 2
  const halo = useMemo(() => {
    const plane = [RAFT.width + 2.2, span.length + 2.2]
    return {
      geometry: new THREE.PlaneGeometry(plane[0], plane[1]),
      material: glowMaterial({ plane, core: [RAFT.width, span.length] }),
    }
  }, [span.length])
  const body = useMemo(() => {
    // Built long along x so the oak grain runs the length of the raft, then turned onto z.
    const box = metricBox(span.length, RAFT.depth, RAFT.width)
    box.rotateY(Math.PI / 2)
    return box
  }, [span.length])
  useEffect(() => () => {
    halo.geometry.dispose()
    halo.material.dispose()
    body.dispose()
  }, [halo, body])
  return <group position={[0, y, span.z]}>
    {/* concealed light lifting the raft off the dark ceiling */}
    <mesh geometry={halo.geometry} material={halo.material} rotation={[Math.PI / 2, 0, 0]} position={[0, RAFT.depth / 2 + RAFT.drop - RAFT.haloDrop, 0]} renderOrder={2} />
    <mesh geometry={body} material={mats.oak} />
  </group>
}

/* Deep ink ceiling, soft concealed wall lines, floating oak rafts and the concealed downlights. */
function Ceiling({ mats }) {
  const length = START_Z - END_Z
  const parts = useMemo(() => ({
    slab: metricBox(ROOM_BACK_X * 2, 0.18, LENGTH),
    cove: new THREE.PlaneGeometry(COVE.width, length),
  }), [length])
  const cove = useMemo(() => glowMaterial({ plane: [COVE.width, length], core: [0.05, length], falloff: 0.15, strength: 0.75 }), [length])
  useEffect(() => () => {
    Object.values(parts).forEach((g) => g.dispose())
    cove.dispose()
  }, [parts, cove])
  const spans = useMemo(raftSpans, [])
  const lineZ = (START_Z + END_Z) / 2
  return <>
    <mesh geometry={parts.slab} material={mats.ceiling} position={[0, CEILING_Y + 0.09, MID_Z]} />
    {[-1, 1].map((s) => <mesh key={s} geometry={parts.cove} material={cove} rotation={[Math.PI / 2, 0, 0]} position={[s * (FACE_X - COVE.inset), CEILING_Y - RAFT.haloDrop, lineZ]} renderOrder={2} />)}
    {spans.map((span) => <Raft key={span.z} span={span} mats={mats} />)}
    {DOWNLIGHT_Z.map((z) => <pointLight key={z} position={[0, DOWNLIGHT.y, z]} intensity={DOWNLIGHT.intensity} distance={DOWNLIGHT.distance} decay={2} color="#ffd6a6" />)}
  </>
}

/* The end of the corridor: travertine with the Contact door set in it - the same automatic
   glass door as every room - flanked by two cobalt felt bands. Its far face is travertine
   too, so it reads as the hall's own wall round the doorway. */
function EndWall({ mats }) {
  const opening = ENTRANCE_OPENING.width
  const sideW = (7.04 - opening) / 2
  const sideX = opening / 2 + sideW / 2
  const lintelBottom = FLOOR_Y + ENTRANCE_OPENING.height
  const headerH = FLOOR_Y + WALL_H - lintelBottom
  const bandH = CEILING_Y - (FLOOR_Y + SKIRT.height)
  const geometry = useMemo(() => ({
    side: metricBox(sideW + 0.035, WALL_H, 0.20),
    header: metricBox(opening + 0.04, headerH, 0.20),
    skirt: metricBox(sideW - 0.02, SKIRT.height, SKIRT.proud),
    band: metricBox(0.62, bandH, BAND.proud),
    trim: metricBox(BAND.trim, bandH, BAND.trimProud),
  }), [sideW, opening, headerH, bandH])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])
  const materials = useMemo(() => [mats.travertine, mats.travertine, mats.travertine, mats.travertine, mats.travertine, mats.travertine], [mats])
  const face = END_Z + 0.10
  return <group>
    {[-sideX, sideX].map((x) => <mesh key={x} geometry={geometry.side} material={materials} position={[x, WALL_Y, END_Z]} />)}
    <mesh geometry={geometry.header} material={materials} position={[0, lintelBottom + headerH / 2, END_Z]} />
    {[-sideX, sideX].map((x) => <mesh key={`skirt-${x}`} geometry={geometry.skirt} material={mats.shadowGap} position={[x + (x < 0 ? -0.01 : 0.01), FLOOR_Y + SKIRT.height / 2, face + SKIRT.proud / 2]} />)}
    {[-1, 1].map((s) => <group key={s} position={[s * 2.25, FLOOR_Y + SKIRT.height + bandH / 2, face]}>
      <mesh geometry={geometry.band} material={mats.felt} position={[0, 0, BAND.proud / 2]} />
      {[-1, 1].map((e) => <mesh key={e} geometry={geometry.trim} material={mats.brassSatin} position={[e * (0.31 + BAND.trim / 2), 0, BAND.trimProud / 2]} />)}
    </group>)}
  </group>
}

/* The start wall carries the entrance: travertine inside, and the door in its dark bronze
   portal. Outside, the building's front stands proud of it (CorridorExterior). */
function StartWall({ mats }) {
  const opening = ENTRANCE_OPENING.width
  const sideW = (7.04 - opening) / 2
  const sideX = opening / 2 + sideW / 2
  const lintelBottom = FLOOR_Y + ENTRANCE_OPENING.height
  const headerH = FLOOR_Y + WALL_H - lintelBottom
  const geometry = useMemo(() => ({
    side: metricBox(sideW + .035, WALL_H, .20),
    header: metricBox(opening + .04, headerH, .20),
    skirt: metricBox(sideW - .02, SKIRT.height, SKIRT.proud),
  }), [sideW, opening, headerH])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])
  // px, nx, py, ny, pz (outside), nz (corridor side)
  const materials = useMemo(() => [mats.travertine, mats.travertine, mats.travertine, mats.travertine, mats.plasterLight, mats.travertine], [mats])

  return <group>
    {[-sideX, sideX].map((x) => <mesh key={x} geometry={geometry.side} material={materials} position={[x, WALL_Y, START_Z]} />)}
    <mesh geometry={geometry.header} material={materials} position={[0, lintelBottom + headerH / 2, START_Z]} />
    {[-sideX, sideX].map((x) => <mesh key={`skirt-${x}`} geometry={geometry.skirt} material={mats.shadowGap} position={[x + (x < 0 ? -.01 : .01), FLOOR_Y + SKIRT.height / 2, START_Z - .10 - SKIRT.proud / 2]} />)}
    <group position={[0, 0, START_Z]}>
      <EntranceDoor materials={mats} />
    </group>
  </group>
}

/*
 * Soft contact shadows. Nothing in the corridor casts a real shadow, so each object that
 * stands on the floor or hangs on a wall is grounded by a soft-edged decal of its own
 * footprint - the difference between an object sitting in the space and floating over it.
 */
function softShadowTexture(round, core = 0.26) {
  const n = 128
  const c = document.createElement('canvas')
  c.width = n
  c.height = n
  const g = c.getContext('2d')
  const img = g.createImageData(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const px = (x + 0.5) / n - 0.5
      const py = (y + 0.5) / n - 0.5
      // distance outside the core (a disc, or a rounded box), as a fraction of the falloff
      const d = round
        ? Math.max(0, Math.hypot(px, py) - 0.22) / 0.28
        : Math.hypot(Math.max(0, Math.abs(px) - core), Math.max(0, Math.abs(py) - core)) / (0.5 - core)
      const a = Math.pow(Math.max(0, 1 - Math.min(1, d)), 2.2)
      img.data.set([0, 0, 0, Math.round(a * 255)], (y * n + x) * 4)
    }
  }
  g.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function shadowMaterial(round, opacity, core) {
  return new THREE.MeshBasicMaterial({
    map: softShadowTexture(round, core),
    color: '#000000',
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -8,
  })
}

const UNIT_PLANE = new THREE.PlaneGeometry(1, 1)

/* A decal lying on the floor; the floor's reflection never sees it. */
function FloorShadow({ material, size, position = [0, 0, 0] }) {
  const mesh = useRef()
  useLayoutEffect(() => {
    const m = mesh.current
    floorReflection.hidden.add(m)
    return () => floorReflection.hidden.delete(m)
  }, [])
  return <mesh ref={mesh} geometry={UNIT_PLANE} material={material} position={[position[0], FLOOR_Y + 0.001, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0], size[1], 1]} renderOrder={1} />
}

/* A planter standing off the wall, grounded by its soft contact shadow. */
function Plant({ side, z, seed, mats }) {
  const sign = side === 'right' ? 1 : -1
  return <group position={[sign * 2.75, 0, z]}>
    <FloorShadow material={mats.shadows.round} size={[1.05, 1.05]} />
    <group position={[0, FLOOR_Y, 0]}><Planter seed={seed} mats={mats} plantMats={mats.plant} /></group>
  </group>
}

/* A soft shadow on the wall behind each installation, so it reads as hung off the stone. */
function ArtShadow({ side, z, mats }) {
  const sign = side === 'right' ? 1 : -1
  return <mesh
    geometry={UNIT_PLANE}
    material={mats.shadows.wall}
    position={[sign * (FACE_X - 0.002), 1.86, z]}
    rotation={[0, -sign * Math.PI / 2, 0]}
    scale={[2.95, 2.05, 1]}
    renderOrder={1}
  />
}


function CorridorDecor({ animate = true, mats }) {
  // The pendants carry the corridor's light; this one finishes the walk at the end wall.
  return <>
    <pointLight position={[0, 3.0, END_Z + 4.5]} intensity={1.6} distance={8} decay={2.0} color="#ffe0bd" />

    {ART.map(([side, z, kind]) => <GalleryArtwork key={kind} side={side} z={z} kind={kind} animate={animate} />)}
    {ART.map(([side, z]) => <ArtShadow key={z} side={side} z={z} mats={mats} />)}

    {PLANTS.map(([side, z], i) => <Plant key={z} side={side} z={z} seed={i * 31 + 7} mats={mats} />)}
    {SCULPTURES.map(([kind, [x, z]]) => <group key={kind}>
      <FloorShadow material={mats.shadows.box} size={[1.5, 1.3]} position={[x, 0, z]} />
      <FloorSculpture position={[x, FLOOR_Y, z]} kind={kind} />
    </group>)}
  </>
}

function Floor({ mats }) {
  const floor = useRef()
  const geometry = useMemo(() => metricPlane(ROOM_BACK_X * 2, LENGTH), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useLayoutEffect(() => {
    const mesh = floor.current
    floorReflection.hidden.add(mesh)
    return () => floorReflection.hidden.delete(mesh)
  }, [])
  return <mesh ref={floor} geometry={geometry} material={mats.floor} position={[0, FLOOR_Y, MID_Z]} rotation={[-Math.PI / 2, 0, 0]} />
}

export default function Corridor({ animate = true }) {
  // The original plaster stays on every face the rooms can see.
  const wallMap = useSurface('plaster', 2.4, 22, 11)
  const tex = useCorridorTextures()

  const mats = useMemo(() => {
    const base = createCorridorMaterials(tex, { floorBorderX: FACE_X - FLOOR_BORDER, floorInlayX: FACE_X - FLOOR_BORDER - FLOOR_INLAY })
    const stoneWall = base.wallStone.clone()
    stoneWall.lightMap = wallWashMap({ wallHeight: WALL_H })
    stoneWall.lightMapIntensity = WALL_WASH
    const stoneHeader = base.wallStone.clone()
    stoneHeader.lightMap = wallWashMap({ wallHeight: WALL_H, from: 3.335 - .265 - FLOOR_Y })
    stoneHeader.lightMapIntensity = WALL_WASH
    base.floor.lightMap = floorWashMap({ width: ROOM_BACK_X * 2, faceX: FACE_X })
    base.floor.lightMapIntensity = FLOOR_WASH
    const roomSide = new THREE.MeshStandardMaterial({ map: wallMap, color: '#fffaf1', roughness: .94, metalness: 0, bumpMap: wallMap, bumpScale: .005 })
    const finishes = createGalleryFinishes(tex, PALETTE, base.brass)
    const shadows = { round: shadowMaterial(true, 0.62), box: shadowMaterial(false, 0.55), wall: shadowMaterial(false, 0.42, 0.33) }
    return { ...base, stoneWall, stoneHeader, roomSide, finishes, plant: createPlantMaterials(), shadows }
  }, [tex, wallMap])

  useEffect(() => () => {
    // The wall slabs use their own larger-cut copies of the travertine maps.
    ;[mats.wallStone.map, mats.wallStone.roughnessMap, mats.wallStone.normalMap].forEach((t) => t?.dispose())
    ;[mats.plant.blade, ...Object.values(mats.shadows)].forEach((m) => m.map.dispose())
    const all = new Set([...Object.values(mats), ...Object.values(mats.finishes), ...Object.values(mats.plant), ...Object.values(mats.shadows)])
    all.forEach((m) => {
      if (!m?.isMaterial) return
      m.lightMap?.dispose()
      m.dispose()
    })
  }, [mats])

  const probeMaterials = useMemo(() => [
    mats.floor, mats.stoneWall, mats.stoneHeader, mats.felt, mats.oak, mats.brassSatin, mats.glass, mats.doorFrame, mats.travertine, mats.travertineDoor, mats.ceiling, mats.plasterLight, mats.brass, mats.shadowGap,
    mats.plant.blade, mats.plant.vessel, mats.plant.pebble,
    ...new Set(Object.values(mats.finishes)),
  ], [mats])

  return <GalleryFinishContext.Provider value={mats.finishes}>
    <group>
      <Floor mats={mats} />
      <Ceiling mats={mats} />
      <WallSide side="left" mats={mats} />
      <WallSide side="right" mats={mats} />
      <FeltBands mats={mats} />
      <StartWall mats={mats} />
      <EndWall mats={mats} />
      {!window.location.search.includes("noext") && <CorridorExterior textures={tex} />}
      <CorridorDecor animate={animate} mats={mats} />
      {doors.map((d) => <DoorPortal key={d.id} spec={d} mats={mats} />)}
      <CorridorProbe materials={probeMaterials} />
    </group>
  </GalleryFinishContext.Provider>
}
