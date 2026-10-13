import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { paintGraphic, useFontsReady } from '../rooms/roomGraphics.js'
import { FACADE_Z, SIGN, START_Z, TERRACE, TERRACE_LAMPS } from './corridorLayout.js'
import { ENTRANCE_OPENING } from './EntranceDoor.jsx'
import { floorReflection } from './floorReflection.js'
import { metricBox, metricPlane } from './corridorMaterials.js'

/*
 * Outside the building, at night: the first thing a visitor sees, and where they come back to.
 * The building stands on top of a tower; this is the tower's roof terrace, before the building's
 * front, with a glass railing round it and the city all round and far below (CityView).
 *
 * The front is one dark stone wall, cut in large honed panels and ruled by slim bronze fins.
 * The entrance door stands at its centre, set back in a deep bronze-lined reveal. The plaza
 * before it is large-format granite, damp enough to hold the building's light. The light comes
 * only from the building's own fixtures:
 *   - a low bronze wall-washer at the foot of each bay, its glowing slot washing the stone upward;
 *   - an opal glass globe hanging in the reveal over the door, two small downlights beside it;
 *   - the corridor's light, out through the glass;
 *   - a few lamps round the plaza.
 * Everything here is lit by those fixtures alone (nightLit), never by the corridor's lamps.
 *
 * Over the door the UKD mark is mounted on the stone in dark bronze letters, lit from behind so
 * a warm halo spreads on the wall round them. On the plaza beside the door a bronze wayfinding
 * sign names the other way into the portfolio, the Web Experience; it is the link to it.
 *
 * World frame, as the corridor: the door's wall is at START_Z, the plaza runs out toward +z.
 */
const FLOOR_Y = -0.075
const WALL_BACK = START_Z + 0.1                    // the entrance wall's outer face, where the door stands
const DEPTH = FACADE_Z - WALL_BACK                 // depth of the reveal
const REVEAL = { w: ENTRANCE_OPENING.width + 1.2, h: ENTRANCE_OPENING.height + 0.55 }
const FRONT = { half: 26, top: 14 }
const BACK_Z = -72                                 // the building's sides run back to here
const BAY = 2.4
const FIRST_FIN = REVEAL.w / 2 + 1.0
const FIN = { w: 0.07, d: 0.26 }
const LAMPS = TERRACE_LAMPS
const RAIL = { inset: 0.3, h: 1.1 }

/* ------------------------------------------------------------------ the fixtures */
const WARM = [1, 0.72, 0.46]
const LAMP = [1, 0.8, 0.6]
// the fixtures you can see: where each light actually comes from
const WASHER = { w: 0.34, h: 0.1, d: 0.13, z: FACADE_Z + 0.16 }
const WASHERS = []
for (let k = 0; k < 6; k++) for (const s of [-1, 1]) WASHERS.push(s * (FIRST_FIN + BAY / 2 + k * BAY))
const SOFFIT_Y = FLOOR_Y + REVEAL.h
const GLOBE = { r: 0.15, y: SOFFIT_Y - 0.36, z: WALL_BACK + DEPTH * 0.55 }
const DOWNLIGHTS = [-1.0, 1.0]
// the UKD mark over the reveal
const LOGO = { width: 1.25, y: SOFFIT_Y + 0.5, z: FACADE_Z + 0.03, depth: 0.035 }
export { SIGN }
/** Shared with the page: whether the sign is pointed at (it brightens). */
export const exteriorSign = { hover: 0 }
function fixtures() {
  const list = []
  const add = (pos, dir, color, intensity, outer, inner, range) => list.push({
    pos: new THREE.Vector3(...pos),
    dir: new THREE.Vector3(...dir).normalize(),
    color: new THREE.Vector3(...color).multiplyScalar(intensity),
    cone: new THREE.Vector3(Math.cos(THREE.MathUtils.degToRad(outer)), Math.cos(THREE.MathUtils.degToRad(inner)), range),
  })
  // the globe over the door lights all round it; the downlights beside it throw pools below
  add([0, GLOBE.y, GLOBE.z], [0, -1, 0], [1, 0.76, 0.52], 5.5, 180, 168, 10)
  for (const x of DOWNLIGHTS) add([x, SOFFIT_Y - 0.03, GLOBE.z], [0, -1, 0.12], WARM, 4, 62, 22, 8)
  // the corridor's own light, out through the glass and onto the paving
  add([0, 1.9, START_Z - 1.4], [0, -0.3, 1], [1, 0.8, 0.6], 16, 58, 14, 17)
  // a wall-washer at the foot of each bay, its beam tipped back onto the stone
  for (const x of WASHERS) add([x, FLOOR_Y + WASHER.h + 0.01, WASHER.z + 0.02], [0, 1, -0.1], WARM, 24, 23, 5, 18)
  // lamps round the plaza
  for (const [x, z] of LAMPS) add([x, 4.45, FACADE_Z + z], [0, -1, 0], LAMP, 34, 74, 26, 22)
  // the sign's lit panel throws a little light on the paving at its foot
  add([SIGN.x + Math.sin(SIGN.rotY) * 0.3, SIGN.panel.y, SIGN.z + Math.cos(SIGN.rotY) * 0.3], [Math.sin(SIGN.rotY), -0.6, Math.cos(SIGN.rotY)], [0.9, 0.85, 0.75], 1.6, 80, 30, 5)
  return list
}
const LIGHTS = fixtures()
const nightUniforms = {
  uNightPos: { value: LIGHTS.map((l) => l.pos) },
  uNightDir: { value: LIGHTS.map((l) => l.dir) },
  uNightColor: { value: LIGHTS.map((l) => l.color) },
  uNightCone: { value: LIGHTS.map((l) => l.cone) },
  uNightSky: { value: new THREE.Vector3(0.2, 0.23, 0.32) },
}

/*
 * The fixtures above in place of the scene's lights, through the material's own BRDF, so stone
 * stays matte, bronze catches a highlight and the paving takes soft pools of light. Each fixture is a spot
 * (an omni one has a cone of 180 degrees) with a hard range.
 */
const NIGHT_LIGHTING = /* glsl */ `
  vec3 geometryPosition = - vViewPosition;
  vec3 geometryNormal = normal;
  vec3 geometryViewDir = normalize( vViewPosition );
  vec3 geometryClearcoatNormal = vec3( 0.0 );
  IncidentLight directLight;
  vec3 iblIrradiance = vec3( 0.0 );
  vec3 skyUp = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  vec3 irradiance = uNightSky * ( 0.55 + 0.45 * dot( geometryNormal, skyUp ) );
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );
  for ( int i = 0; i < NIGHT_LIGHTS; i ++ ) {
    vec3 toLight = ( viewMatrix * vec4( uNightPos[ i ], 1.0 ) ).xyz - geometryPosition;
    float dist = length( toLight );
    if ( dist > uNightCone[ i ].z ) continue;
    directLight.direction = toLight / dist;
    vec3 axis = normalize( ( viewMatrix * vec4( uNightDir[ i ], 0.0 ) ).xyz );
    float spot = smoothstep( uNightCone[ i ].x, uNightCone[ i ].y, dot( - directLight.direction, axis ) );
    directLight.color = uNightColor[ i ] * spot * getDistanceAttenuation( dist, uNightCone[ i ].z, 2.0 );
    directLight.visible = true;
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }`

function nightLit(material, key, patch) {
  const before = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    before?.(shader, renderer)
    Object.assign(shader.uniforms, nightUniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNightWorld;\nvarying vec3 vNightNormal;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 nightW = vec4( transformed, 1.0 );
        vec3 nightN = objectNormal;
        #ifdef USE_INSTANCING
          nightW = instanceMatrix * nightW;
          nightN = mat3( instanceMatrix ) * nightN;
        #endif
        vNightWorld = ( modelMatrix * nightW ).xyz;
        vNightNormal = normalize( mat3( modelMatrix ) * nightN );`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        #define NIGHT_LIGHTS ${LIGHTS.length}
        varying vec3 vNightWorld;
        varying vec3 vNightNormal;
        uniform vec3 uNightPos[ NIGHT_LIGHTS ];
        uniform vec3 uNightDir[ NIGHT_LIGHTS ];
        uniform vec3 uNightColor[ NIGHT_LIGHTS ];
        uniform vec3 uNightCone[ NIGHT_LIGHTS ];
        uniform vec3 uNightSky;
        float nightHash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
        // a line of half-width w at distance d, antialiased; it fades out rather than shimmer far off
        float nightLine( float d, float w ) {
          float aa = max( fwidth( d ), 1e-5 );
          return ( 1.0 - smoothstep( w - aa, w + aa, d ) ) * clamp( w / aa, 0.0, 1.0 );
        }`)
      .replace('#include <lights_fragment_begin>', NIGHT_LIGHTING)
    patch?.(shader)
  }
  material.customProgramCacheKey = () => `night|${key}`
  return material
}

/* Honed stone in large panels, each a shade apart, with fine dark joints. */
const stonePanels = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
    {
      vec3 nW = normalize( vNightNormal );
      vec2 p = abs( nW.z ) > 0.5 ? vec2( abs( vNightWorld.x ) - ${FIRST_FIN.toFixed(3)}, vNightWorld.y )
        : ( abs( nW.x ) > 0.5 ? vec2( vNightWorld.z, vNightWorld.y ) : vNightWorld.xz );
      vec2 cell = vec2( 1.2, 0.75 );
      vec2 q = p / cell;
      vec2 f = fract( q );
      vec2 e = min( f, 1.0 - f ) * cell;
      float joint = max( nightLine( e.x, 0.0035 ), nightLine( e.y, 0.0035 ) );
      float tone = 0.84 + 0.32 * nightHash( floor( q ) + sign( vNightWorld.x ) * 17.0 + nW.x * 5.0 );
      diffuseColor.rgb *= tone * ( 1.0 - 0.6 * joint );
    }`)
}

/* Granite pavers in running bond, honed and dry: a matte floor, so it mirrors nothing. */
const paving = (shader) => {
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <map_fragment>', `#include <map_fragment>
      {
        vec2 p = vNightWorld.xz;
        float row = floor( p.y / 0.6 );
        float x = p.x + mod( row, 2.0 ) * 0.6;
        float fx = fract( x / 1.2 );
        float fz = fract( p.y / 0.6 );
        float joint = max( nightLine( min( fx, 1.0 - fx ) * 1.2, 0.004 ), nightLine( min( fz, 1.0 - fz ) * 0.6, 0.004 ) );
        float tone = 0.78 + 0.44 * nightHash( vec2( floor( x / 1.2 ), row ) );
        diffuseColor.rgb *= tone * ( 1.0 - 0.65 * joint );
      }`)
}

/* ------------------------------------------------------------------ materials */
const linear = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace)

function exteriorMaterials(tex) {
  const cut = (set, span) => Object.fromEntries(Object.entries(set).map(([k, t]) => {
    const c = t.clone()
    c.repeat.set(1 / span, 1 / span)
    c.needsUpdate = true
    return [k, c]
  }))
  const stoneTex = cut(tex.travertine, 2.6)
  const pavingTex = cut(tex.plaster, 1.6)
  const stone = nightLit(new THREE.MeshStandardMaterial({
    map: stoneTex.map, roughnessMap: stoneTex.orm, normalMap: stoneTex.normal, color: linear(0.2, 0.18, 0.165), roughness: 1, envMapIntensity: 0,
  }), 'stone', stonePanels)
  stone.normalScale.set(0.9, 0.9)
  const bronze = nightLit(new THREE.MeshStandardMaterial({
    map: tex.bronze.map, roughnessMap: tex.bronze.orm, metalnessMap: tex.bronze.orm, normalMap: tex.bronze.normal,
    color: linear(0.3, 0.22, 0.15), metalness: 1, roughness: 0.9, envMapIntensity: 0,
  }), 'bronze')
  const pole = nightLit(new THREE.MeshStandardMaterial({ color: linear(0.02, 0.021, 0.024), metalness: 0.6, roughness: 0.5 }), 'pole')
  const pavers = new THREE.MeshStandardMaterial({
    map: pavingTex.map, normalMap: pavingTex.normal, color: linear(0.13, 0.13, 0.135), roughness: 0.46, envMapIntensity: 0,
  })
  pavers.normalScale.set(0.35, 0.35)
  nightLit(pavers, 'pavers', paving)
  const glass = new THREE.MeshBasicMaterial({ color: '#7f97ab', transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide })
  const lens = new THREE.MeshBasicMaterial({ color: linear(9, 6.6, 4.4) })
  const slot = new THREE.MeshBasicMaterial({ color: linear(5, 3.4, 2.1) })
  // opal glass, brightest where the lamp inside is nearest the surface
  const opal = new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = max(dot(normalize(vN), normalize(vV)), 0.0);
        vec3 c = mix(vec3(1.0, 0.62, 0.34) * 0.9, vec3(1.0, 0.92, 0.8) * 2.2, pow(f, 1.6));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    toneMapped: true,
  })
  const glow = new THREE.SpriteMaterial({ map: glowTexture(), color: linear(1, 0.74, 0.5), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
  return { stone, bronze, pole, pavers, glass, lens, slot, opal, glow, textures: [...Object.values(stoneTex), ...Object.values(pavingTex)] }
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,0.9)')
  r.addColorStop(0.18, 'rgba(255,255,255,0.32)')
  r.addColorStop(0.5, 'rgba(255,255,255,0.06)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ------------------------------------------------------------------ geometry */
const at = (g, x, y, z) => { g.translate(x, y, z); return g }

function buildGeometry() {
  const H = FRONT.top - FLOOR_Y
  const sideW = FRONT.half - REVEAL.w / 2
  const headH = FRONT.top - (FLOOR_Y + REVEAL.h)
  const midZ = WALL_BACK + DEPTH / 2
  // the stone: either side of the reveal, over it, and the building's flanks
  const stone = mergeGeometries([
    at(metricBox(sideW, H, DEPTH), -(REVEAL.w / 2 + sideW / 2), FLOOR_Y + H / 2, midZ),
    at(metricBox(sideW, H, DEPTH), REVEAL.w / 2 + sideW / 2, FLOOR_Y + H / 2, midZ),
    at(metricBox(REVEAL.w + 0.02, headH, DEPTH), 0, FLOOR_Y + REVEAL.h + headH / 2, midZ),
    at(metricPlane(FACADE_Z - BACK_Z, H).rotateY(-Math.PI / 2), -FRONT.half, FLOOR_Y + H / 2, (FACADE_Z + BACK_Z) / 2),
    at(metricPlane(FACADE_Z - BACK_Z, H).rotateY(Math.PI / 2), FRONT.half, FLOOR_Y + H / 2, (FACADE_Z + BACK_Z) / 2),
  ])
  // bronze: the reveal's lining and its back round the door, the fins, the coping
  const lining = 0.03
  const backY0 = FLOOR_Y + ENTRANCE_OPENING.height
  const bronzeParts = [
    at(new THREE.BoxGeometry(lining, REVEAL.h, DEPTH), -(REVEAL.w / 2 - lining / 2), FLOOR_Y + REVEAL.h / 2, midZ),
    at(new THREE.BoxGeometry(lining, REVEAL.h, DEPTH), REVEAL.w / 2 - lining / 2, FLOOR_Y + REVEAL.h / 2, midZ),
    at(new THREE.BoxGeometry(REVEAL.w, lining, DEPTH), 0, FLOOR_Y + REVEAL.h - lining / 2, midZ),
    at(new THREE.BoxGeometry((REVEAL.w - ENTRANCE_OPENING.width) / 2, REVEAL.h, 0.02), -(ENTRANCE_OPENING.width / 2 + (REVEAL.w - ENTRANCE_OPENING.width) / 4), FLOOR_Y + REVEAL.h / 2, WALL_BACK + 0.01),
    at(new THREE.BoxGeometry((REVEAL.w - ENTRANCE_OPENING.width) / 2, REVEAL.h, 0.02), ENTRANCE_OPENING.width / 2 + (REVEAL.w - ENTRANCE_OPENING.width) / 4, FLOOR_Y + REVEAL.h / 2, WALL_BACK + 0.01),
    at(new THREE.BoxGeometry(ENTRANCE_OPENING.width + 0.02, REVEAL.h - ENTRANCE_OPENING.height, 0.02), 0, (backY0 + FLOOR_Y + REVEAL.h) / 2, WALL_BACK + 0.01),
    // a slim frame round the reveal's mouth, standing just proud of the stone
    at(new THREE.BoxGeometry(0.06, REVEAL.h + 0.06, 0.03), -(REVEAL.w / 2 + 0.03), FLOOR_Y + (REVEAL.h + 0.06) / 2, FACADE_Z + 0.015),
    at(new THREE.BoxGeometry(0.06, REVEAL.h + 0.06, 0.03), REVEAL.w / 2 + 0.03, FLOOR_Y + (REVEAL.h + 0.06) / 2, FACADE_Z + 0.015),
    at(new THREE.BoxGeometry(REVEAL.w + 0.12, 0.06, 0.03), 0, FLOOR_Y + REVEAL.h + 0.03, FACADE_Z + 0.015),
    at(new THREE.BoxGeometry(FRONT.half * 2 + 0.2, 0.42, DEPTH + 0.4), 0, FRONT.top - 0.21 + 0.001, midZ + 0.2),
  ]
  for (let x = FIRST_FIN; x < FRONT.half - 0.4; x += BAY) {
    for (const s of [-1, 1]) bronzeParts.push(at(new THREE.BoxGeometry(FIN.w, H - 0.42, FIN.d), s * x, FLOOR_Y + (H - 0.42) / 2, FACADE_Z + FIN.d / 2))
  }
  const bronze = mergeGeometries(bronzeParts)
  // the terrace, from the door out to its railing (never under the corridor)
  const plaza = at(metricPlane(TERRACE.half * 2, TERRACE.edgeZ - (START_Z + 0.3)).rotateX(-Math.PI / 2), 0, FLOOR_Y, (TERRACE.edgeZ + START_Z + 0.3) / 2)
  // the railing: frameless glass in a bronze shoe, a bronze handrail with a line of light under it
  const rx = TERRACE.half - RAIL.inset
  const rz = TERRACE.edgeZ - RAIL.inset
  const runs = [
    [0, rz, rx * 2, 0],
    [-rx, (FACADE_Z + rz) / 2, rz - FACADE_Z, Math.PI / 2],
    [rx, (FACADE_Z + rz) / 2, rz - FACADE_Z, Math.PI / 2],
  ]
  const along = (len, w, h, y, rot, x, z) => at(new THREE.BoxGeometry(len, h, w).rotateY(rot), x, y, z)
  const railGlass = mergeGeometries(runs.map(([x, z, len, rot]) => at(new THREE.PlaneGeometry(len, RAIL.h - 0.14).rotateY(rot), x, FLOOR_Y + 0.12 + (RAIL.h - 0.14) / 2, z)))
  const railMetal = mergeGeometries(runs.flatMap(([x, z, len, rot]) => [
    along(len + 0.06, 0.07, 0.05, FLOOR_Y + RAIL.h, rot, x, z),
    along(len + 0.04, 0.09, 0.12, FLOOR_Y + 0.06, rot, x, z),
  ]))
  const railLight = mergeGeometries(runs.map(([x, z, len, rot]) => along(len, 0.02, 0.008, FLOOR_Y + RAIL.h - 0.03, rot, x, z)))
  // lamp posts: a slim pole with a flat head; the lens faces down
  const poles = []
  const lenses = []
  for (const [x, z] of LAMPS) {
    poles.push(at(new THREE.CylinderGeometry(0.055, 0.075, 4.5, 16), x, FLOOR_Y + 2.25, FACADE_Z + z))
    poles.push(at(new THREE.BoxGeometry(0.62, 0.09, 0.24), x, FLOOR_Y + 4.55, FACADE_Z + z))
    lenses.push(at(new THREE.PlaneGeometry(0.54, 0.17).rotateX(Math.PI / 2), x, FLOOR_Y + 4.5 - 0.001, FACADE_Z + z))
  }
  // the wall-washers: a low bronze housing at the foot of each bay, its lens a slot on top
  const washers = mergeGeometries(WASHERS.map((x) => at(new THREE.BoxGeometry(WASHER.w, WASHER.h, WASHER.d), x, FLOOR_Y + WASHER.h / 2, WASHER.z)))
  const slots = mergeGeometries(WASHERS.map((x) => at(new THREE.PlaneGeometry(WASHER.w - 0.04, WASHER.d - 0.05).rotateX(-Math.PI / 2), x, FLOOR_Y + WASHER.h + 0.001, WASHER.z)))
  // the pendant: a bronze canopy in the soffit, a slim rod, an opal globe; the downlights' trims
  const pendant = mergeGeometries([
    at(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 32), 0, SOFFIT_Y - 0.0125, GLOBE.z),
    at(new THREE.CylinderGeometry(0.007, 0.007, SOFFIT_Y - 0.025 - (GLOBE.y + GLOBE.r * 0.92), 12), 0, (SOFFIT_Y - 0.025 + GLOBE.y + GLOBE.r * 0.92) / 2, GLOBE.z),
    at(new THREE.CylinderGeometry(0.035, 0.05, 0.05, 24), 0, GLOBE.y + GLOBE.r * 0.95, GLOBE.z),
    ...DOWNLIGHTS.map((x) => at(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 32), x, SOFFIT_Y - 0.006, GLOBE.z)),
  ])
  const downlightLenses = mergeGeometries(DOWNLIGHTS.map((x) => at(new THREE.CircleGeometry(0.055, 32).rotateX(Math.PI / 2), x, SOFFIT_Y - 0.0125, GLOBE.z)))
  return {
    stone, bronze, plaza, railGlass, railMetal, railLight,
    poles: mergeGeometries(poles), lenses: mergeGeometries(lenses),
    washers, slots, pendant, downlightLenses,
  }
}

const none = () => null

/* The UKD mark: the logo's own outlines, extruded into letters, with the halo behind them. */
function LogoMark({ material }) {
  const svg = useLoader(THREE.FileLoader, '/assets/ukd-logo.svg')
  const mark = useMemo(() => {
    const data = new SVGLoader().parse(svg)
    const view = data.xml?.viewBox?.baseVal
    const vw = view?.width || 1362
    const vh = view?.height || 564
    const k = LOGO.width / vw
    const outlines = []
    const shapes = []
    for (const path of data.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        const { shape: outer, holes } = shape.extractPoints(16)
        const flip = (pts) => pts.map((p) => new THREE.Vector2((p.x - vw / 2) * k, (vh / 2 - p.y) * k))
        const s2 = new THREE.Shape(flip(outer))
        s2.holes = holes.map((h) => new THREE.Path(flip(h)))
        shapes.push(s2)
        outlines.push([outer, ...holes])
      }
    }
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: LOGO.depth - 0.006, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.002, bevelSegments: 2, curveSegments: 1 })
    // the halo: the mark's coverage, blurred wide, as the light it throws on the stone
    const pad = 120
    const scale = 0.5
    const c = document.createElement('canvas')
    c.width = Math.round(vw * scale) + pad * 2
    c.height = Math.round(vh * scale) + pad * 2
    const g = c.getContext('2d')
    g.filter = 'blur(26px)'
    g.fillStyle = '#fff'
    g.beginPath()
    for (const loops of outlines) {
      for (const loop of loops) {
        loop.forEach((p, i) => (i ? g.lineTo(pad + p.x * scale, pad + p.y * scale) : g.moveTo(pad + p.x * scale, pad + p.y * scale)))
        g.closePath()
      }
    }
    g.fill('evenodd')
    const halo = new THREE.CanvasTexture(c)
    const haloSize = [(c.width / scale) * k, (c.height / scale) * k]
    return { geometry, halo, haloSize }
  }, [svg])
  const haloMat = useMemo(() => new THREE.MeshBasicMaterial({ map: mark.halo, color: new THREE.Color(1.0, 0.68, 0.4).multiplyScalar(1.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [mark])
  useEffect(() => () => { mark.geometry.dispose(); mark.halo.dispose(); haloMat.dispose() }, [mark, haloMat])
  return <group position={[0, LOGO.y, LOGO.z]}>
    <mesh material={haloMat} position={[0, 0, -LOGO.z + FACADE_Z + 0.004]} raycast={none} renderOrder={1}>
      <planeGeometry args={mark.haloSize} />
    </mesh>
    <mesh geometry={mark.geometry} material={material} position={[0, 0, 0.012]} raycast={none} />
  </group>
}

/* The Web Experience sign: a bronze pylon with a lit panel of smoked glass. */
function WebSign({ bronze }) {
  const ready = useFontsReady()
  const panelMap = useMemo(() => (!ready ? null : paintGraphic(SIGN.panel.w, SIGN.panel.h, (pen, { width, height }) => {
    const g = pen.g
    const grd = g.createLinearGradient(0, 0, 0, height * pen.s)
    grd.addColorStop(0, '#141a24')
    grd.addColorStop(1, '#0a0d13')
    g.fillStyle = grd
    g.fillRect(0, 0, width * pen.s, height * pen.s)
    pen.text('THE PORTFOLIO', 0.06, 0.08, { size: 0.034, weight: 500, family: 'mono', color: '#d9b878', tracking: 0.18 })
    pen.text('Web', 0.06, 0.2, { size: 0.15, weight: 800, color: '#f4eee4' })
    pen.text('Experience.', 0.06, 0.37, { size: 0.12, weight: 500, family: 'serif', italic: true, color: '#e9d3a8' })
    pen.rule(0.06, 0.58, width - 0.12, 'rgba(217,184,120,.55)', 0.003)
    pen.text('As a classic website', 0.06, 0.63, { size: 0.036, weight: 600, color: '#cfc6b6' })
    pen.text('VISIT  ↗', 0.06, 0.76, { size: 0.034, weight: 500, family: 'mono', color: '#d9b878', tracking: 0.18 })
  }, { ppm: 900 })), [ready])
  const panel = useMemo(() => (panelMap ? new THREE.MeshBasicMaterial({ map: panelMap, toneMapped: false }) : null), [panelMap])
  useEffect(() => () => { panelMap?.dispose(); panel?.dispose() }, [panelMap, panel])
  useFrame(() => {
    if (!panel) return
    const target = 0.82 + exteriorSign.hover * 0.45
    const k = panel.color.r + (target - panel.color.r) * 0.15
    panel.color.setScalar(k)
  })
  const P = SIGN.panel
  return <group position={[SIGN.x, FLOOR_Y, SIGN.z]} rotation={[0, SIGN.rotY, 0]}>
    <mesh material={bronze} position={[0, SIGN.h / 2, 0]} raycast={none}><boxGeometry args={[SIGN.w, SIGN.h, SIGN.d]} /></mesh>
    <mesh material={bronze} position={[0, 0.03, 0]} raycast={none}><boxGeometry args={[SIGN.w + 0.08, 0.06, SIGN.d + 0.08]} /></mesh>
    {panel && <mesh material={panel} position={[0, P.y, SIGN.d / 2 + 0.002]} raycast={none}><planeGeometry args={[P.w, P.h]} /></mesh>}
  </group>
}

export default function CorridorExterior({ textures }) {
  const group = useRef()
  const plaza = useRef()
  const mats = useMemo(() => exteriorMaterials(textures), [textures])
  const geo = useMemo(buildGeometry, [])
  useEffect(() => () => {
    Object.values(geo).forEach((g) => g.dispose())
    ;[mats.stone, mats.bronze, mats.pole, mats.pavers, mats.glass, mats.lens, mats.slot, mats.opal, mats.glow].forEach((m) => m.dispose())
    mats.glow.map.dispose()
    mats.textures.forEach((t) => t.dispose())
  }, [geo, mats])
  // The paving lies in the floors' mirror plane, so it is left out of their reflection.
  useEffect(() => {
    const mesh = plaza.current
    floorReflection.hidden.add(mesh)
    return () => floorReflection.hidden.delete(mesh)
  }, [])
  // Nothing outside can be seen from deep inside the corridor or the rooms.
  useFrame(({ camera }) => {
    if (group.current) group.current.visible = camera.position.z > START_Z - 16
  })
  return <group ref={group}>
    <mesh geometry={geo.stone} material={mats.stone} raycast={none} />
    <mesh geometry={geo.bronze} material={mats.bronze} raycast={none} />
    <mesh ref={plaza} geometry={geo.plaza} material={mats.pavers} raycast={none} />
    <mesh geometry={geo.railMetal} material={mats.bronze} raycast={none} />
    <mesh geometry={geo.railLight} material={mats.slot} raycast={none} />
    <mesh geometry={geo.railGlass} material={mats.glass} raycast={none} renderOrder={2} />
    <mesh geometry={geo.poles} material={mats.pole} raycast={none} />
    <mesh geometry={geo.lenses} material={mats.lens} raycast={none} />
    {LAMPS.map(([x, z]) => <sprite key={`${x}:${z}`} material={mats.glow} position={[x, FLOOR_Y + 4.42, FACADE_Z + z]} scale={[1.6, 1.6, 1]} raycast={none} />)}
    <mesh geometry={geo.washers} material={mats.bronze} raycast={none} />
    <mesh geometry={geo.slots} material={mats.slot} raycast={none} />
    {WASHERS.map((x) => <sprite key={x} material={mats.glow} position={[x, FLOOR_Y + WASHER.h + 0.05, WASHER.z]} scale={[0.55, 0.3, 1]} raycast={none} />)}
    <mesh geometry={geo.pendant} material={mats.bronze} raycast={none} />
    <mesh geometry={geo.downlightLenses} material={mats.lens} raycast={none} />
    <mesh material={mats.opal} position={[0, GLOBE.y, GLOBE.z]} raycast={none}><sphereGeometry args={[GLOBE.r, 48, 32]} /></mesh>
    <sprite material={mats.glow} position={[0, GLOBE.y, GLOBE.z + 0.05]} scale={[1.1, 1.1, 1]} raycast={none} />
    <LogoMark material={mats.bronze} />
    <WebSign bronze={mats.bronze} />
  </group>
}
