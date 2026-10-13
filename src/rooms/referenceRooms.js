import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { corridorTextureQuality, patchFloorChevron, patchFloorPavers, patchFloorPlanks, patchFloorTerrazzo, useCorridorTextures } from '../experience/corridorMaterials.js'
import { floorReflection } from '../experience/floorReflection.js'

/*
 * The big rooms, lifted from the Shahz Connect world (used with the owner's permission) by
 * scripts/extract-reference-rooms.mjs into public/assets/rooms/rooms.glb, in this portfolio's
 * room frame. Their materials and baked lighting follow the reference (world/materials.js,
 * world/lightmaps.json, layout.json): physically based surfaces on metric UVs, lit only by
 * their own baked lightmaps and a reflection probe, so the corridor's lights never land on
 * them twice. Each corridor door opens onto one of the four rooms.
 */
export const ROOMS_URL = '/assets/rooms/rooms.glb'
export const ROOM_KIND = Object.freeze({ about: 'about', services: 'services', work: 'process', contact: 'contact' })

// lightmap radiance scale per room (world/lightmaps.json); intensity = scale * PI
const LIGHTMAP_SCALE = { services: 8.095625877380371, process: 5.648055076599121, about: 12.9860258102417, contact: 10.617167472839355 }
const lightmapUrl = (kind, quality) => `/assets/rooms/lightmaps/lm_${kind}${quality === 'lo' ? '_lo' : ''}.webp`

const EXTRA_SETS = ['microcement', 'upholstery', 'wool_rug']
const EXTRA_SPAN = { microcement: 3.0, upholstery: 0.4, wool_rug: 3.2 }

/** The corridor's texture library plus the three sets only the rooms use. */
export function useRoomTextures() {
  const shared = useCorridorTextures()
  const quality = useMemo(corridorTextureQuality, [])
  const urls = EXTRA_SETS.flatMap((set) => ['albedo', 'orm', 'normal'].map((map) => `/assets/corridor/textures/${set}_${map}${quality === 'lo' ? '_lo' : ''}.webp`))
  const extra = useLoader(THREE.TextureLoader, urls)
  return useMemo(() => {
    const out = { ...shared }
    EXTRA_SETS.forEach((set, i) => {
      const [map, orm, normal] = extra.slice(i * 3, i * 3 + 3)
      ;[map, orm, normal].forEach((t, j) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1 / EXTRA_SPAN[set], 1 / EXTRA_SPAN[set])
        t.colorSpace = j === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace
        t.anisotropy = 4
        t.needsUpdate = true
      })
      out[set] = { map, orm, normal }
    })
    return out
  }, [shared, extra])
}

export function useRoomLightmap(kind) {
  const quality = useMemo(corridorTextureQuality, [])
  const texture = useLoader(THREE.TextureLoader, lightmapUrl(kind, quality))
  return useMemo(() => {
    texture.flipY = false
    texture.channel = 1
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return { texture, intensity: LIGHTMAP_SCALE[kind] * Math.PI }
  }, [texture, kind])
}

/*
 * Material names match the Blender materials in the reference world; the finishes are the
 * corridor's own, so a room reads as part of the same building: travertine, walnut, cobalt
 * felt, brass, ink plaster and dark marble. The baked lightmaps store the light arriving at
 * each surface, so they stay true whatever colour the surface is given.
 */
const DEFS = {
  stone_floor: { tex: 'stone_floor', floor: true, normalScale: 0.6, color: [0.82, 0.86, 1.0] },     // dark marble, a breath of navy
  stone_nero: { tex: 'stone_floor', normalScale: 0.4, envMapIntensity: 1.0 },
  walnut_fluted: { tex: 'walnut_fluted', normalScale: 1.0, color: [0.86, 0.8, 0.74], envMapIntensity: 0.5 },
  travertine: { tex: 'travertine', normalScale: 0.6, color: [1.06, 1.0, 0.92], envMapIntensity: 0.3 },
  microcement_dark: { tex: 'microcement', color: [0.04, 0.046, 0.08], envMapIntensity: 0.35 },          // ink
  microcement_light: { tex: 'microcement', color: [0.62, 0.56, 0.48], envMapIntensity: 0.3 },           // warm stone
  plaster_light: { tex: 'plaster', color: [0.02, 0.023, 0.038], envMapIntensity: 0.2 },                 // ink ceiling
  plaster_dark: { tex: 'plaster', color: [0.011, 0.013, 0.022], envMapIntensity: 0.2 },
  felt_teal: { tex: 'felt', color: [0.03, 0.065, 0.34], envMapIntensity: 0.04 },                        // cobalt felt
  bronze: { tex: 'bronze', metal: true, color: [1.35, 1.02, 0.58], envMapIntensity: 1.0 },              // brass
  black_metal: { tex: 'bronze', metal: true, color: [0.13, 0.13, 0.13], envMapIntensity: 0.9 },
  oak: { tex: 'oak', envMapIntensity: 0.6 },
  oak_floor: { tex: 'stone_floor', floor: true },
  upholstery_sand: { tex: 'upholstery', color: [0.05, 0.08, 0.3], envMapIntensity: 0.05 },              // cobalt
  upholstery_charcoal: { tex: 'upholstery', color: [0.035, 0.04, 0.07], envMapIntensity: 0.05 },        // ink
  wool_rug: { tex: 'wool_rug', color: [0.5, 0.45, 0.38], envMapIntensity: 0.0 },
}
// Each room's own character on top of the shared finishes. Services is the deep one: cobalt
// ink walls and ceiling, cobalt felt behind the arc, the halo a warm gold rather than white, so
// the six lit monoliths and the brass lettering carry the room.
const ROOM_FINISH = {
  services: {
    microcement_dark: { color: [0.016, 0.022, 0.06], envMapIntensity: 0.3 },
    plaster_dark: { color: [0.008, 0.01, 0.022] },
    felt_teal: { color: [0.022, 0.05, 0.27] },
  },
}
const ROOM_EMISSIVE = {
  services: { emit_warm: { color: [1, 0.66, 0.36], gain: 0.075 } },
  contact: { emit_soft: { gain: 0.2 } },
}
// The ceiling of each room, in its own key: warm plaster over About's walnut and the gallery's
// travertine and the Contact hall, a deep slate over Services so its brass halo still glows.
const CEILING = {
  about: [0.66, 0.64, 0.6],
  process: [0.62, 0.61, 0.58],
  contact: [0.64, 0.63, 0.6],
  services: [0.11, 0.12, 0.16],
}
// half the width of each room's floor, for its border runner and brass line
const FLOOR_HALF = { about: 7.5, services: 7.5, process: 5, contact: 12 }

// visible emitter brightness relative to the radiance baked into the lightmaps (layout.json)
const EMISSIVE = {
  emit_warm: { color: [1, 0.78, 0.58], strength: 12, gain: 0.42 },
  emit_warm_hot: { color: [1, 0.8, 0.62], strength: 40, gain: 0.32 },
  emit_soft: { color: [1, 0.86, 0.72], strength: 8, gain: 0.42 },
  emit_soft_dim: { color: [1, 0.84, 0.68], strength: 0.9, gain: 1.0 },
  emit_teal: { color: [0.27, 0.36, 1.0], strength: 10, gain: 0.5 },      // the corridor's cobalt, not the reference teal
}

/*
 * Baked light only: the room takes its diffuse light from its lightmap and its reflections
 * from its probe, and ignores every punctual, ambient and hemisphere light in the scene.
 * It also opens the door wall where this portfolio's door portal stands - the reference's own
 * doorway is narrower than ours.
 */
const BAKED_LIGHTS = /* glsl */ `
  vec3 geometryPosition = - vViewPosition;
  vec3 geometryNormal = normal;
  vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
  vec3 geometryClearcoatNormal = vec3( 0.0 );
  IncidentLight directLight;
  vec3 iblIrradiance = vec3( 0.0 );
  vec3 irradiance = vec3( 0.0 );
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );`

/*
 * The walls take a designed light instead of the bake. The reference's bake splits every wall
 * into patches lit a shade apart and keeps the shadows of furniture that is no longer there,
 * which reads as stains on our finishes. A wall is lit as these rooms actually are: by the line
 * of light in the cove along its top, strongest just under the ceiling and falling softly down
 * it, a touch darker into the corners and at the skirting, a little floor bounce at its foot.
 * Recesses behind a wall (the About niches) keep their baked glow. The ceiling is lit the same
 * way: brightest along its edges, where the cove light grazes it, settling to an even glow over
 * the middle of the room.
 * Per room: the door wall's x, the far wall's x, the side walls' |z|, and the ceiling's height.
 */
const ROOM_BOX = {
  about: [3.61, 18.61, 7.5, 5.93],
  services: [3.61, 18.61, 7.5, 5.93],
  process: [3.61, 27.61, 5.0, 4.93],
  contact: [3.61, 21.31, 12.0, 5.93],
}
const WALL_LIGHT = { about: 2.3, services: 2.1, process: 2.2, contact: 2.3 }
const WALL_WASH = /* glsl */ `
  #include <lights_fragment_maps>
  {
    vec3 nRoom = normalize( cross( dFdx( vRoomLocal ), dFdy( vRoomLocal ) ) );
    float toDoor = vRoomLocal.x - uRoomBox.x;
    float toFar = uRoomBox.y - vRoomLocal.x;
    float toSide = uRoomBox.z - abs( vRoomLocal.z );
    float nearest = min( min( toDoor, toFar ), toSide );
    if ( abs( nRoom.y ) < 0.3 && nearest < 0.05 && nearest > -0.03 ) {
      float h = uRoomBox.w - vRoomLocal.y;
      float y = vRoomLocal.y + 0.075;
      float along = toSide < min( toDoor, toFar ) ? min( toDoor, toFar ) : toSide;
      float wash = 0.34 + 0.9 / ( 1.0 + pow( max( h, 0.0 ) / 1.15, 2.0 ) );
      wash *= 0.8 + 0.2 * smoothstep( 0.0, 0.4, y );
      wash *= 0.78 + 0.22 * smoothstep( 0.0, 1.2, along );
      wash += 0.08 * exp( - y / 0.7 );
      irradiance = uWallLight * wash;
    }
    // the ceiling
    if ( nRoom.y < -0.7 && vRoomLocal.y > uRoomBox.w - 0.08 ) {
      float edge = max( nearest, 0.0 );
      float wash = 0.42 + 0.55 * exp( - edge / 0.9 ) + 0.12 * exp( - edge / 3.5 );
      irradiance = uWallLight * wash * 0.82;
    }
  }`

function bake(material, kind) {
  const before = material.onBeforeCompile
  const box = ROOM_BOX[kind] || ROOM_BOX.about
  const light = ((WALL_LIGHT[kind] || 2.2) * Math.PI) / 3.0
  material.onBeforeCompile = (shader, renderer) => {
    before?.(shader, renderer)
    shader.uniforms.uRoomBox = { value: new THREE.Vector4(...box) }
    shader.uniforms.uWallLight = { value: new THREE.Color(1.0, 0.9, 0.78).multiplyScalar(light) }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRoomLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRoomLocal = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRoomLocal;\nuniform vec4 uRoomBox;\nuniform vec3 uWallLight;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if ( vRoomLocal.x < 3.7 && abs( vRoomLocal.z ) < 0.9 && vRoomLocal.y < 2.86 ) discard;`)
      .replace('#include <lights_fragment_begin>', BAKED_LIGHTS)
      .replace('#include <lights_fragment_maps>', WALL_WASH)
  }
  const key = material.customProgramCacheKey()
  material.customProgramCacheKey = () => `room-baked|${key}`
  return material
}

/*
 * Our own pieces inside a baked room (boards, lettering, screens, monoliths) are lit the same
 * way the room is: a soft, even light of the room's own level plus the room's reflections,
 * never the corridor's lamps, so they sit in the room instead of glowing out of it.
 */
export function roomLit(material, level = 1, { key = 0.6, keyDir = null } = {}) {
  const before = material.onBeforeCompile
  // the key's direction in the world; a piece may aim it from its own wall (see Lettering)
  const dir = keyDir || new THREE.Vector3(0.25, 0.85, 0.45).normalize()
  material.onBeforeCompile = (shader, renderer) => {
    before?.(shader, renderer)
    shader.uniforms.uRoomLight = { value: level * Math.PI }
    shader.uniforms.uKey = { value: key }
    shader.uniforms.uKeyDir = { value: dir }
    // a soft key from above and in front gives carved and raised work its relief
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uRoomLight;\nuniform float uKey;\nuniform vec3 uKeyDir;')
      .replace('#include <lights_fragment_begin>', `${BAKED_LIGHTS}
  vec3 keyDir = normalize( ( viewMatrix * vec4( uKeyDir, 0.0 ) ).xyz );
  irradiance = vec3( uRoomLight ) * ( 1.0 - uKey + uKey * 1.7 * max( dot( geometryNormal, keyDir ), 0.0 ) );`)
  }
  const cacheKey = material.customProgramCacheKey()
  material.customProgramCacheKey = () => `room-lit|${cacheKey}`
  return material
}

/** One room's materials, keyed by reference material name. */
export function createRoomMaterials(tex, lightmap, kind) {
  const out = {}
  for (const [name, base] of Object.entries(DEFS)) {
    const def = { ...base, ...(ROOM_FINISH[kind]?.[name] || {}) }
    const set = tex[def.tex]
    const m = new THREE.MeshStandardMaterial({
      name,
      map: set.map,
      roughnessMap: def.floor ? null : set.orm,
      metalnessMap: def.metal ? set.orm : null,
      normalMap: def.floor ? null : set.normal,
      roughness: def.floor ? 0.08 : 1,
      metalness: def.metal ? 1 : 0,
      envMapIntensity: def.envMapIntensity ?? 0.5,
    })
    if (def.color) m.color.setRGB(def.color[0], def.color[1], def.color[2], THREE.LinearSRGBColorSpace)
    if ((name === 'plaster_light' || name === 'plaster_dark') && CEILING[kind]) m.color.setRGB(...CEILING[kind], THREE.LinearSRGBColorSpace)
    m.normalScale.set(def.normalScale ?? 1, def.normalScale ?? 1)
    // metals have no diffuse response, so they take no lightmap
    if (!def.metal) {
      m.lightMap = lightmap.texture
      m.lightMapIntensity = lightmap.intensity
    }
    if (def.floor) {
      // the corridor's own floor, laid along the room's centre line and pointing into it
      m.color.setRGB(1, 1, 1)
      m.envMapIntensity = 0.25
      floorReflection.attach(m)
      // each room its own floor; the Contact hall keeps the corridor's chevron
      if (kind === 'services') patchFloorPavers(m)
      else if (kind === 'about') { m.map = tex.oak.map; patchFloorPlanks(m) }
      else if (kind === 'process') patchFloorTerrazzo(m)
      else {
        const half = FLOOR_HALF[kind] ?? 7.5
        patchFloorChevron(m, { borderX: half - 0.46, inlayX: half - 0.51, space: 'room' })
      }
    }
    m.userData.floor = !!def.floor
    out[name] = bake(m, kind)
  }
  for (const [name, base] of Object.entries(EMISSIVE)) {
    const e = { ...base, ...(ROOM_EMISSIVE[kind]?.[name] || {}) }
    const s = e.strength * e.gain
    const m = new THREE.MeshBasicMaterial({ name })
    m.color.setRGB(e.color[0] * s, e.color[1] * s, e.color[2] * s, THREE.LinearSRGBColorSpace)
    out[name] = m
  }
  return out
}
