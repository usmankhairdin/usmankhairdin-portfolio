import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { floorReflection } from './floorReflection.js'

/*
 * Corridor material library. The physically based approach and the texture sets in
 * /assets/corridor/textures come from the Shahz Connect corridor (world/materials.js and
 * world/assets.js), used with the owner's permission. The finishes themselves are this
 * portfolio's own: a dark marble chevron floor with a brass spine, honed travertine walls with
 * cobalt felt bands, an ink ceiling with oak rafts, glass doors, brushed brass and cobalt lacquer.
 * The reference's baked lightmaps fit only its own building; the light they carried is
 * approximated with small generated wash maps.
 */
const ROOT = '/assets/corridor/textures'
const SETS = ['stone_floor', 'walnut_fluted', 'travertine', 'plaster', 'bronze', 'oak', 'felt']
const MAPS = ['albedo', 'orm', 'normal']

/** Metres covered by one repeat of each texture; geometry UVs are made metric to match. */
export const TEXTURE_SPAN = { stone_floor: 2.4, walnut_fluted: 0.96, travertine: 2.0, plaster: 3.0, bronze: 1.0, oak: 2.0, felt: 0.5 }
const WALL_STONE_SPAN = 3.2   // the wall slabs are cut larger than the door's travertine

export const corridorTextureQuality = () => (
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px), (pointer: coarse)').matches ? 'lo' : 'hi'
)

const textureUrls = (quality) => SETS.flatMap((set) => MAPS.map((map) => `${ROOT}/${set}_${map}${quality === 'lo' ? '_lo' : ''}.webp`))

/** Loads (and suspends on) every corridor texture set. Returns { set: { map, orm, normal } }. */
export function useCorridorTextures() {
  const quality = useMemo(corridorTextureQuality, [])
  const textures = useLoader(THREE.TextureLoader, textureUrls(quality))
  return useMemo(() => {
    const out = {}
    SETS.forEach((set, i) => {
      const [map, orm, normal] = textures.slice(i * 3, i * 3 + 3)
      const span = TEXTURE_SPAN[set]
      const floor = set === 'stone_floor'
      ;[map, orm, normal].forEach((t, j) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1 / span, 1 / span)
        t.colorSpace = j === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace
        t.anisotropy = floor ? 8 : 4
        t.needsUpdate = true
      })
      out[set] = { map, orm, normal }
    })
    return out
  }, [textures])
}

const linear = (hex) => new THREE.Color(hex)

function surface(set, { color, map = true, normalScale = 1, envMapIntensity = 0.5, metal = false, roughness = 1, roughnessMap = true, normalMap = true } = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: map ? set.map : null,
    roughnessMap: roughnessMap ? set.orm : null,
    metalnessMap: metal ? set.orm : null,
    normalMap: normalMap ? set.normal : null,
    roughness,
    metalness: metal ? 1 : 0,
    envMapIntensity,
  })
  if (Array.isArray(color)) m.color.setRGB(color[0], color[1], color[2], THREE.LinearSRGBColorSpace)
  else if (color) m.color.copy(linear(color))
  m.normalScale.set(normalScale, normalScale)
  return m
}

// The floor's palette (linear values): two dark marbles and a brass inlay.
export const FLOOR_FINISH = Object.freeze({
  nero: [0.006, 0.007, 0.012],        // near-black marble, silver veins
  neroVein: [0.42, 0.43, 0.47],
  graphite: [0.016, 0.019, 0.032],    // a deep navy-graphite marble, a breath lighter
  graphiteVein: [0.34, 0.37, 0.45],
  joint: [0.05, 0.05, 0.055],
  brass: [0.8, 0.56, 0.26],
  plank: 0.3,      // plank width, metres
  length: 1.2,     // plank length along its own axis, metres
  spine: 0.022,    // half-width of the brass spine down the centre line
})

/*
 * The corridor floor: polished dark marble laid as a chevron. Long planks run at 45 degrees
 * and meet on the centre line, so the whole floor points down the corridor toward where the
 * visitor is going; a brass spine runs where the two halves meet. Rows alternate gently
 * between near-black Nero and a deep navy-graphite marble, each plank's veins flowing along
 * its own length and never repeating. Toward each wall a straight runner of the same stone
 * is set off by a fine brass line. Joints are hairline and low-contrast, and every line is
 * antialiased in screen space, so nothing shimmers as the visitor walks. The vein pattern
 * comes from the reference's Nero marble; the layout is composed here.
 */
export function patchFloorChevron(material, { borderX, inlayX, space = 'corridor' }) {
  const reflect = material.onBeforeCompile
  const f = FLOOR_FINISH
  const v3 = (c) => new THREE.Vector3(c[0], c[1], c[2])
  const uniforms = {
    uNero: { value: v3(f.nero) },
    uNeroVein: { value: v3(f.neroVein) },
    uGraphite: { value: v3(f.graphite) },
    uGraphiteVein: { value: v3(f.graphiteVein) },
    uJointColor: { value: v3(f.joint) },
    uBrass: { value: v3(f.brass) },
    uPlank: { value: f.plank },
    uLength: { value: f.length },
    uSpine: { value: f.spine },
    uBorderX: { value: borderX },
    uInlayX: { value: inlayX },
  }
  material.onBeforeCompile = (shader, renderer) => {
    reflect?.(shader, renderer)
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uNero; uniform vec3 uNeroVein; uniform vec3 uGraphite; uniform vec3 uGraphiteVein;
        uniform vec3 uJointColor; uniform vec3 uBrass;
        uniform float uPlank; uniform float uLength; uniform float uSpine; uniform float uBorderX; uniform float uInlayX;
        // Sampled with the gradients of a continuous coordinate, so the per-plank offsets never
        // drop a seam of the wrong mip level along the joints.
        float marbleVein( sampler2D tex, vec2 uv, vec2 gx, vec2 gy ) {
          return smoothstep( 0.07, 0.5, dot( textureGrad( tex, uv, gx, gy ).rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) );
        }
        float hash12( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
        // A line of half-width w (metres) at distance d, antialiased by its own screen footprint.
        // Once it is thinner than a pixel it fades by its coverage instead of breaking into
        // moire, so distant joints settle into the stone rather than crawling.
        float lineMask( float d, float w ) {
          float aa = max( fwidth( d ), 1e-5 );
          return ( 1.0 - smoothstep( w - aa, w + aa, d ) ) * clamp( w / aa, 0.0, 1.0 );
        }`)
      .replace('#include <map_fragment>', `
        float marbleInlay = 0.0;
        #ifdef USE_MAP
        {
          // x across the floor from its centre line, y along the way the visitor walks in
          vec2 w = ${space === 'room' ? 'vec2( vRoomLocal.z, -vRoomLocal.x )' : 'vReflWorld.xz'};
          float across = abs( w.x );
          // chevron: planks at 45 degrees, mirrored about the centre line, pointing to -z
          float along = ( w.y - across ) * 0.70710678;      // across the plank rows
          float run = ( w.y + across ) * 0.70710678;        // along each plank
          float row = floor( along / uPlank );
          float inRow = fract( along / uPlank );
          float col = floor( ( run + row * uLength * 0.5 ) / uLength );
          float inCol = fract( ( run + row * uLength * 0.5 ) / uLength );
          vec2 plankId = vec2( row, col + step( 0.0, w.x ) * 97.0 );
          // Far down the corridor many planks share a pixel; there the alternation and the
          // per-plank shading ease to their average so the distance stays perfectly still.
          float detail = 1.0 - smoothstep( 0.15, 0.55, fwidth( along ) / uPlank );
          float tone = mix( 0.5, mod( row, 2.0 ), detail );
          float shade = mix( 1.0, 0.82 + 0.36 * hash12( plankId ), detail );
          vec2 veinCont = vec2( run, along ) / 2.4;
          vec2 gx = dFdx( veinCont );
          vec2 gy = dFdy( veinCont );
          vec2 veinUv = vec2( inCol * uLength, inRow * uPlank ) / 2.4 + vec2( hash12( plankId + 3.1 ), hash12( plankId + 7.7 ) );
          float vein = marbleVein( map, veinUv, gx, gy );
          vec3 stone = mix( mix( uNero, uNeroVein, vein ), mix( uGraphite, uGraphiteVein, vein ), tone ) * shade;
          // straight runner along each wall, the same stone in long planks
          float band = smoothstep( uBorderX - max( fwidth( across ), 1e-5 ), uBorderX + max( fwidth( across ), 1e-5 ), across );
          vec2 runnerUv = vec2( w.y, across * 2.0 ) / 2.4 + 0.37;
          float runnerVein = marbleVein( map, runnerUv, dFdx( runnerUv ), dFdy( runnerUv ) );
          vec3 runner = mix( uNero, uNeroVein, runnerVein ) * 0.92;
          stone = mix( stone, runner, band );
          // hairline joints: plank sides, plank ends, and the runner's cross joints
          float side = min( inRow, 1.0 - inRow ) * uPlank;
          float end = min( inCol, 1.0 - inCol ) * uLength;
          float joints = max( lineMask( side, 0.0012 ), lineMask( end, 0.0012 ) ) * ( 1.0 - band );
          float runnerJoint = lineMask( abs( fract( w.y / 1.2 ) - 0.5 ) * 1.2, 0.0012 ) * band;
          stone = mix( stone, uJointColor, max( joints, runnerJoint ) * 0.6 );
          // brass: the spine where the chevrons meet, and the lines that frame the field
          float spine = lineMask( across, uSpine );
          float frame = lineMask( abs( across - uInlayX ), 0.011 );
          marbleInlay = max( spine, frame );
          diffuseColor.rgb *= mix( stone, uBrass, marbleInlay );
        }
        #endif`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix( 0.06, 0.34, marbleInlay );`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = mix( metalnessFactor, 1.0, marbleInlay );`)
  }
  material.customProgramCacheKey = () => `${space}-floor-chevron`
}

/** The material set the corridor and its entrance door are built from. */
export function createCorridorMaterials(tex, { withFloor = true, floorBorderX = 2.95, floorInlayX = 2.9 } = {}) {
  let floor = null
  if (withFloor) {
    // The pattern drives colour and gloss itself; the stone's own maps would print its tile grid.
    floor = surface(tex.stone_floor, { roughnessMap: false, normalMap: false, roughness: 0.08, envMapIntensity: 0.25 })
    floorReflection.attach(floor)
    patchFloorChevron(floor, { borderX: floorBorderX, inlayX: floorInlayX })
  }
  // Large-format slabs: the same travertine at a bigger cut.
  const slab = Object.fromEntries(Object.entries(tex.travertine).map(([key, t]) => {
    const copy = t.clone()
    copy.repeat.set(1 / WALL_STONE_SPAN, 1 / WALL_STONE_SPAN)
    return [key, copy]
  }))
  const set = {
    floor,
    // Honed travertine wall slabs: matte stone, so the walls read solid and never glint.
    wallStone: surface(slab, { color: [1.06, 1.0, 0.92], normalScale: 0.75, envMapIntensity: 0.12 }),
    // Slotted acoustic felt in deep cobalt for the vertical wall bands.
    felt: surface(tex.felt, { color: [0.03, 0.065, 0.34], normalScale: 1.0, envMapIntensity: 0.04 }),
    // Oiled oak for the floating ceiling rafts.
    oak: surface(tex.oak, { color: [0.98, 0.8, 0.6], normalScale: 0.8, envMapIntensity: 0.25 }),
    // Satin brass without fine relief, for slim trims, inlays and rims (no sparkle at distance).
    brassSatin: surface(tex.bronze, { metal: true, map: true, roughnessMap: false, normalMap: false, roughness: 0.55, color: [1.9, 1.42, 0.72], envMapIntensity: 0.9 }),
    // The doors: clear automatic glass in dark bronze portals, edged in brass. The glass is
    // nearly invisible face-on and catches the corridor's light as it turns away.
    glass: new THREE.MeshPhysicalMaterial({
      color: '#dfe9ea', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.14, depthWrite: false,
      clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6, side: THREE.DoubleSide,
    }),
    doorFrame: surface(tex.bronze, { metal: true, color: [0.075, 0.066, 0.058], normalMap: false, envMapIntensity: 0.7 }),
    travertine: surface(tex.travertine, { normalScale: 0.6, envMapIntensity: 0.35 }),
    travertineDoor: surface(tex.travertine, { color: [1.2, 1.18, 1.15], normalScale: 0.5, envMapIntensity: 0.4 }),
    ceiling: surface(tex.plaster, { color: [0.011, 0.013, 0.022], envMapIntensity: 0.2 }),
    plasterLight: surface(tex.plaster, { color: [0.92, 0.88, 0.83], envMapIntensity: 0.15 }),
    brass: surface(tex.bronze, { metal: true, color: [1.9, 1.42, 0.72], envMapIntensity: 1.0 }),
    shadowGap: surface(tex.bronze, { metal: true, color: [0.03, 0.04, 0.08], envMapIntensity: 0.8 }),
  }
  // Inlays, edge lines and skirting sit only millimetres proud of the surface behind them.
  // Far down the corridor that is finer than the depth buffer can resolve, so they are drawn
  // a hair forward of it; otherwise the two surfaces would take turns showing and blink.
  ;[set.brassSatin, set.shadowGap, set.felt].forEach((m) => {
    m.polygonOffset = true
    m.polygonOffsetFactor = -1
    m.polygonOffsetUnits = -4
  })
  return set
}

/*
 * Premium finishes for the gallery pieces on the corridor walls and floor, keyed by the
 * fabrication palette colour they replace. Only the corridor provides these; the rooms keep
 * their own finishes.
 */
export function createGalleryFinishes(tex, palette, brass) {
  const lacquer = new THREE.MeshPhysicalMaterial({ color: '#3a52ec', roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.07, envMapIntensity: 0.9 })
  const steel = surface(tex.bronze, { metal: true, color: [0.11, 0.13, 0.18], envMapIntensity: 0.9 })
  const stone = surface(tex.travertine, { color: [1.12, 1.08, 1.0], normalScale: 0.7, envMapIntensity: 0.35 })
  // The pale 'paper' panels read as white cut-outs against the stone; in the corridor they are
  // oiled walnut instead, so every piece sits in the same warm wood-brass-cobalt family.
  const paper = surface(tex.walnut_fluted, { normalMap: false, color: [0.82, 0.74, 0.66], envMapIntensity: 0.35 })
  const wood = surface(tex.oak, { color: [0.82, 0.66, 0.52], normalScale: 0.8, envMapIntensity: 0.35 })
  return {
    [palette.brass]: brass,
    [palette.blue]: lacquer,
    [palette.ink]: steel,
    [palette.ivory]: stone,
    [palette.paper]: paper,
    [palette.wood]: wood,
  }
}

/*
 * Box / plane UVs are 0..1 per face; the texture library expects metric UVs (1 unit = 1 m),
 * so a 2 m wall shows two repeats of a 1 m texture and every surface keeps the same scale.
 */
export function metricBox(w, h, d, faces = [0, 1, 2, 3, 4, 5]) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv
  // BoxGeometry faces, 4 vertices each: px, nx, py, ny, pz, nz. Faces left out keep their
  // original 0..1 UVs (the corridor wall's room side is the rooms' own fourth wall).
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]
  for (const f of faces) {
    const [su, sv] = dims[f]
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
    }
  }
  uv.needsUpdate = true
  return g
}

export function metricPlane(w, h) {
  const g = new THREE.PlaneGeometry(w, h)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h)
  uv.needsUpdate = true
  return g
}

/*
 * Generated wash maps stand in for the reference's baked light. Each is a one-dimensional
 * ramp used as a lightMap on UV channel 0; the texture transform maps the metric UV onto it.
 */
function rampTexture(samples, fn, color) {
  const data = new Uint8Array(samples * 4)
  for (let i = 0; i < samples; i++) {
    const v = Math.max(0, Math.min(1, fn(i / (samples - 1))))
    data[i * 4] = Math.round(255 * v * color[0])
    data[i * 4 + 1] = Math.round(255 * v * color[1])
    data[i * 4 + 2] = Math.round(255 * v * color[2])
    data[i * 4 + 3] = 255
  }
  return data
}

/** Cove light grazing down the wall from the ceiling, with a little floor bounce at the foot. */
export function wallWashMap({ wallHeight, from = 0 }) {
  const samples = 128
  const data = rampTexture(samples, (t) => 0.22 + 0.78 * Math.exp(-(1 - t) * 3.1) + 0.1 * Math.exp(-t * 7), [1, 0.9, 0.8])
  const tex = new THREE.DataTexture(data, 1, samples, THREE.RGBAFormat)
  tex.colorSpace = THREE.NoColorSpace
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.magFilter = tex.minFilter = THREE.LinearFilter
  // metric v (0 at the mesh foot) -> position on the full-height ramp
  tex.repeat.set(1, 1 / wallHeight)
  tex.offset.set(0, from / wallHeight)
  tex.needsUpdate = true
  return tex
}

/** The ceiling spine pools light down the middle of the floor; the coves brighten its edges. */
export function floorWashMap({ width, faceX }) {
  const samples = 256
  const data = rampTexture(samples, (t) => {
    const x = (t - 0.5) * width
    const spine = Math.exp(-((x / 1.25) ** 2))
    const cove = Math.exp(-Math.max(0, faceX - Math.abs(x)) / 0.55)
    return 0.3 + 0.62 * spine + 0.22 * cove
  }, [1, 0.92, 0.82])
  const tex = new THREE.DataTexture(data, samples, 1, THREE.RGBAFormat)
  tex.colorSpace = THREE.NoColorSpace
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.magFilter = tex.minFilter = THREE.LinearFilter
  tex.repeat.set(1 / width, 1)
  tex.needsUpdate = true
  return tex
}

/*
 * The rooms' own floors, each in the room's local plan (vRoomLocal: x into the room from its
 * door, z across it), each a real material laid as it would be:
 *   pavers   - large-format dark granite in running bond, honed to a soft polish (Services;
 *              the plaza's paving brought indoors)
 *   planks   - wide oiled oak planks running into the room, end joints staggered (About)
 *   terrazzo - black terrazzo, marble chips at three sizes, brass divider strips (Work)
 * Every line is antialiased by its own screen footprint and fades out with distance.
 */
const FLOOR_COMMON = /* glsl */ `
  float flHash( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
  float flNoise( vec2 p ) {
    vec2 i = floor( p ); vec2 f = fract( p ); vec2 u = f * f * ( 3.0 - 2.0 * f );
    return mix( mix( flHash( i ), flHash( i + vec2( 1.0, 0.0 ) ), u.x ), mix( flHash( i + vec2( 0.0, 1.0 ) ), flHash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
  }
  float flLine( float d, float w ) {
    float aa = max( fwidth( d ), 1e-5 );
    return ( 1.0 - smoothstep( w - aa, w + aa, d ) ) * clamp( w / aa, 0.0, 1.0 );
  }`

function patchRoomFloor(material, name, body, rough) {
  const reflect = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    reflect?.(shader, renderer)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FLOOR_COMMON}`)
      .replace('#include <map_fragment>', `
        float floorRough = 0.2;
        float floorMetal = 0.0;
        #ifdef USE_MAP
        {
          vec2 w = vec2( vRoomLocal.x, vRoomLocal.z );
          ${body}
        }
        #endif`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = floorRough;`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = max( metalnessFactor, floorMetal );`)
  }
  material.customProgramCacheKey = () => `room-floor-${name}`
  material.roughness = rough
}

export function patchFloorPavers(material) {
  patchRoomFloor(material, 'pavers', /* glsl */ `
    float row = floor( w.y / 0.6 );
    float x = w.x + mod( row, 2.0 ) * 0.6;
    float fx = fract( x / 1.2 );
    float fz = fract( w.y / 0.6 );
    vec2 id = vec2( floor( x / 1.2 ), row );
    float joint = max( flLine( min( fx, 1.0 - fx ) * 1.2, 0.0022 ), flLine( min( fz, 1.0 - fz ) * 0.6, 0.0022 ) );
    float detail = 1.0 - smoothstep( 0.002, 0.02, fwidth( w.x ) );
    // granite: a fine fleck from the stone's own texture, each paver a shade apart
    float fleck = dot( texture2D( map, w * 0.8 + vec2( flHash( id ), flHash( id + 3.1 ) ) ).rgb, vec3( 0.299, 0.587, 0.114 ) );
    float tone = mix( 1.0, 0.8 + 0.4 * flHash( id ), detail );
    vec3 stone = mix( vec3( 0.026, 0.027, 0.03 ), vec3( 0.12, 0.115, 0.11 ), smoothstep( 0.3, 0.8, fleck ) * 0.55 * detail + 0.12 * ( 1.0 - detail ) ) * tone;
    stone = mix( stone, vec3( 0.008 ), joint * 0.85 );
    diffuseColor.rgb *= stone;
    floorRough = mix( 0.14 + 0.1 * flNoise( w * 0.7 ), 0.6, joint );`, 0.2)
}

export function patchFloorPlanks(material) {
  patchRoomFloor(material, 'planks', /* glsl */ `
    float pw = 0.22;
    float col = floor( w.y / pw );
    float along = w.x + flHash( vec2( col, 1.7 ) ) * 3.0;
    float len = 1.6 + 0.8 * step( 0.5, flHash( vec2( col, 4.2 ) ) );
    float seg = floor( along / len );
    vec2 id = vec2( col, seg );
    float fa = fract( along / len );
    float fc = fract( w.y / pw );
    float joint = max( flLine( min( fc, 1.0 - fc ) * pw, 0.0011 ), flLine( min( fa, 1.0 - fa ) * len, 0.0011 ) );
    float detail = 1.0 - smoothstep( 0.002, 0.02, fwidth( w.x ) );
    // the grain runs along each plank; each board cut from a different part of the log
    vec2 grainUv = vec2( fa * len, fc * pw ) / 2.0 + vec2( flHash( id ), flHash( id + 7.3 ) );
    vec3 wood = texture2D( map, grainUv ).rgb;
    wood *= vec3( 0.78, 0.62, 0.48 ) * mix( 1.0, 0.8 + 0.4 * flHash( id + 1.9 ), detail );
    wood = mix( wood, wood * 0.35, joint * 0.8 );
    diffuseColor.rgb *= wood;
    floorRough = 0.34 + 0.08 * flNoise( w * vec2( 0.6, 6.0 ) );`, 0.34)
}

export function patchFloorTerrazzo(material) {
  patchRoomFloor(material, 'terrazzo', /* glsl */ `
    vec3 col = vec3( 0.04, 0.04, 0.045 ) * ( 0.9 + 0.2 * flNoise( w * 3.0 ) );
    float px = fwidth( w.x );
    // marble chips at three sizes; far off they settle into the mix they make
    for ( int k = 0; k < 3; k ++ ) {
      float s = k == 0 ? 55.0 : ( k == 1 ? 120.0 : 240.0 );
      vec2 q = w * s + float( k ) * 17.0;
      vec2 cell = floor( q );
      vec2 f = fract( q );
      float h = flHash( cell );
      vec2 c = vec2( 0.3 + 0.4 * flHash( cell + 1.3 ), 0.3 + 0.4 * flHash( cell + 2.7 ) );
      float r = 0.18 + 0.2 * flHash( cell + 5.1 );
      float d = length( ( f - c ) * vec2( 1.0, 0.8 + 0.4 * h ) );
      float aa = max( fwidth( d ), 1e-4 );
      float chip = ( 1.0 - smoothstep( r - aa, r + aa, d ) ) * step( 0.5, h );
      vec3 stone = h > 0.95 ? vec3( 0.03, 0.05, 0.22 ) : ( h > 0.86 ? vec3( 0.22, 0.09, 0.05 ) : ( h > 0.7 ? vec3( 0.16, 0.155, 0.15 ) : vec3( 0.4, 0.39, 0.37 ) ) );
      float near = 1.0 - smoothstep( 0.06, 0.3, px * s );
      col = mix( col, mix( col + 0.03 * ( 1.0 - float( k ) * 0.25 ), stone, near ), chip * mix( 0.5, 1.0, near ) );
    }
    // brass divider strips, set flush in a grid
    vec2 g = abs( fract( w / 1.8 ) - 0.5 ) * 1.8;
    float strip = max( flLine( g.x, 0.0035 ), flLine( g.y, 0.0035 ) );
    col = mix( col, vec3( 0.8, 0.56, 0.26 ), strip );
    diffuseColor.rgb *= col;
    floorRough = mix( 0.1 + 0.05 * flNoise( w * 2.0 ), 0.3, strip );
    floorMetal = strip;`, 0.12)
}
