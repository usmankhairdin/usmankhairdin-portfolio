import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CITY_Y } from './cityPlan.js'
import { ARCHITECTURE_FAMILIES, neighborhoodInstanceCapacity } from './realCityBuildingPlan.js'
import { assembleArchitecture, architectureRetentionDistance, createDistantArchitecture, createArchitectureVisibility } from './realCityFacade.js'

export { realBuildingEligible, realRoundEligible } from './realCityBuildingPlan.js'

const MODEL_ROOT = '/assets/city/apartments/'
const noRaycast = () => null
const nearLight = /* glsl */ `
  vec3 geometryNormal = normal;
  vec3 geometryViewDir = normalize(vViewPosition);
  vec3 exteriorNormal = inverseTransformDirection(normal, viewMatrix);
  float moon = max(dot(exteriorNormal, normalize(vec3(-.35,.78,.42))), 0.);
  float street = exp(-max(vArchitectureHeight,0.) / 21.);
  vec3 nightIrradiance = vec3(.045,.060,.085) + vec3(.075,.105,.15)*moon;
  nightIrradiance += vec3(.045,.035,.025)*street;
  reflectedLight.directDiffuse = material.diffuseColor * nightIrradiance;
  float grazing = pow(1. - max(dot(normal, normalize(vViewPosition)),0.), 4.);
  reflectedLight.directSpecular = material.specularColor * (.012 + .065*grazing) * (1.-.65*material.roughness);
`

function nightMaterial(source) {
  const material = source.clone()
  const glass = source.name.includes('_glass')
  const body = source.name.includes('_plaster')
  const role = glass ? 'glass' : body ? 'palette' : 'trim'
  const colors = ARCHITECTURE_FAMILIES.map((family, index) =>
    `${index ? 'else ' : ''}if (family < ${index + .5}) return vec3(${family[role].map(v => v.toFixed(3)).join(',')});`).join('\n')
  const paletteFunction = `vec3 architecturePalette(float family) { ${colors} return vec3(1.); }`
  material.transparent = false
  material.opacity = 1
  material.depthWrite = true
  material.fog = false
  if (glass) {
    material.emissive.set('#ffffff')
    material.emissiveMap = material.map
    material.emissiveIntensity = .72
    // The scanned kit shares a detailed normal atlas with its opaque frames.
    // On distant flat glazing it creates subpixel specular flashes while walking.
    material.normalMap = null
    material.roughness = .42
  }
  material.onBeforeCompile = shader => {
    shader.vertexShader = `attribute vec3 instanceArchitecture; varying vec2 vArchitectureStyle; varying float vArchitectureHeight; varying float vArchitectureGlow;\n${shader.vertexShader}`
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 architectureOrigin = vec3(0.);
        #ifdef USE_INSTANCING
          architectureOrigin = instanceMatrix[3].xyz;
        #endif
        vArchitectureStyle = instanceArchitecture.xy;
        vArchitectureHeight = architectureOrigin.y + position.y;
        vArchitectureGlow = instanceArchitecture.z;`)
    shader.fragmentShader = `varying vec2 vArchitectureStyle; varying float vArchitectureHeight; varying float vArchitectureGlow;\n${paletteFunction}\n${shader.fragmentShader}`
      .replace('#include <map_fragment>', `#include <map_fragment>
        float scannedLuminance = dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
        vec3 scannedNeutral = mix(vec3(scannedLuminance),diffuseColor.rgb,.08);
        diffuseColor.rgb = scannedNeutral * architecturePalette(vArchitectureStyle.x) * mix(.88,1.12,vArchitectureStyle.y);`)
      .replace('#include <lights_fragment_begin>', nearLight)
      .replace('#include <lights_fragment_maps>', '')
      .replace('#include <lights_fragment_end>', '')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        ${glass ? `vec3 interiorTemperature = mix(vec3(.63,.78,1.),vec3(1.,.79,.50),step(.46,vArchitectureStyle.y));
        totalEmissiveRadiance *= mix(.012,.63,vArchitectureGlow)*interiorTemperature;` : ''}`)
      .replace('#include <opaque_fragment>', `
        float architectureDistance = length(vViewPosition);
        float architectureHaze = min((1.-exp(-architectureDistance*.00016))*.5,.5);
        outgoingLight = mix(outgoingLight,vec3(.012,.019,.029),architectureHaze);
        #include <opaque_fragment>`)
  }
  material.customProgramCacheKey = () => `city-architecture-night-${role}-stable-v3`
  return material
}

function createInstances(plan, scene, nearDistance) {
  const privateMaterials = new Map()
  const materialFor = source => {
    if (!privateMaterials.has(source.name)) privateMaterials.set(source.name, nightMaterial(source))
    return privateMaterials.get(source.name)
  }
  const roof = new THREE.PlaneGeometry(1, 1)
  roof.rotateX(-Math.PI / 2)
  const roofRound = new THREE.CircleGeometry(.5, 48)
  roofRound.rotateX(-Math.PI / 2)
  const plaster = scene.getObjectByName('wall_window_centered_large_02').material
  const coreGeometries = new Map([['core', new THREE.BoxGeometry(1, 1, 1)]])
  const group = new THREE.Group()
  const sets = []
  const triangleCosts = new Float64Array(plan.buildings.length)
  plan.modules.forEach(module => {
    const roofModule = module.name === 'roof' || module.name === 'roofRound'
    const coreModule = module.name === 'core' || module.name.startsWith('coreRound-')
    const source = roofModule || coreModule ? null : scene.getObjectByName(module.name)
    if (!source && !roofModule && !coreModule) throw new Error(`Architectural source module missing: ${module.name}`)
    const pieces = []
    if (source) source.traverse(child => { if (child.isMesh) pieces.push([child.geometry, materialFor(child.material)]) })
    else if (coreModule) {
      if (!coreGeometries.has(module.name)) {
        const segments = Number(module.name.slice('coreRound-'.length))
        const geometry = new THREE.CylinderGeometry(.5, .5, 1, segments)
        geometry.rotateY(Math.PI / 2)
        coreGeometries.set(module.name, geometry)
      }
      pieces.push([coreGeometries.get(module.name), materialFor(plaster)])
    } else pieces.push([module.name === 'roofRound' ? roofRound : roof, materialFor(plaster)])
    const triangles = pieces.reduce((sum, [geometry]) => sum + (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3, 0)
    for (const entry of module.entries) triangleCosts[entry.buildingIndex] += triangles * entry.count
    const limit = neighborhoodInstanceCapacity(module.entries, plan.buildings, architectureRetentionDistance(nearDistance))
    const set = { module, lod: 0, chunks: [], capacity: 0, limit }
    set.addChunk = needed => {
      const capacity = Math.min(limit - set.capacity, Math.max(256, Math.ceil(needed * 1.12 / 256) * 256))
      if (capacity <= 0) throw new Error(`Architectural instance capacity exceeded for ${module.name}`)
      const matrixAttribute = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 16), 16)
      const styleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3)
      matrixAttribute.setUsage(THREE.DynamicDrawUsage)
      styleAttribute.setUsage(THREE.DynamicDrawUsage)
      const meshes = pieces.map(([geometry, material]) => {
        const privateGeometry = geometry.clone()
        privateGeometry.setAttribute('instanceArchitecture', styleAttribute)
        const mesh = new THREE.InstancedMesh(privateGeometry, material, 0)
        mesh.instanceMatrix = matrixAttribute
        mesh.count = 0
        // Lot bounds are frustum-tested before packing these shared buffers.
        mesh.frustumCulled = false
        mesh.raycast = noRaycast
        mesh.name = `real-city-${module.name}-near-${set.chunks.length}`
        group.add(mesh)
        return mesh
      })
      set.chunks.push({ capacity, used: 0, matrixAttribute, styleAttribute, meshes })
      set.capacity += capacity
    }
    // Allocate resident buffers once, never while moving or turning the camera.
    set.addChunk(limit)
    sets.push(set)
  })
  const distant = createDistantArchitecture(plan.buildings)
  group.add(distant.mesh)
  return { group, sets, triangleCosts, distant, materials: [...privateMaterials.values()], roofs: [roof, roofRound, ...coreGeometries.values()] }
}

function packVisibleInstances(set, state) {
  let required = 0
  for (const entry of set.module.entries) if (state[entry.buildingIndex] === set.lod + 1) required += entry.count
  if (required > set.capacity) throw new Error(`Architectural neighborhood capacity exceeded for ${set.module.name}`)
  set.chunks.forEach(chunk => { chunk.used = 0 })
  let chunkIndex = 0, offset = 0
  for (const entry of set.module.entries) {
    if (state[entry.buildingIndex] !== set.lod + 1) continue
    let sourceOffset = 0
    while (sourceOffset < entry.values.length) {
      const chunk = set.chunks[chunkIndex]
      const amount = Math.min(entry.values.length - sourceOffset, chunk.capacity * 16 - offset)
      chunk.matrixAttribute.array.set(entry.values.subarray(sourceOffset, sourceOffset + amount), offset)
      const end = (offset + amount) / 16 * 3
      let glowOffset = sourceOffset / 16
      for (let i = offset / 16 * 3; i < end; i += 3) {
        chunk.styleAttribute.array[i] = entry.style[0]
        chunk.styleAttribute.array[i + 1] = entry.style[1]
        chunk.styleAttribute.array[i + 2] = entry.glow[glowOffset++]
      }
      chunk.used += amount / 16
      sourceOffset += amount
      offset += amount
      if (offset === chunk.capacity * 16) { chunkIndex++; offset = 0 }
    }
  }
  for (const chunk of set.chunks) {
    chunk.meshes.forEach(mesh => { mesh.count = chunk.used })
    chunk.matrixAttribute.clearUpdateRanges()
    chunk.styleAttribute.clearUpdateRanges()
    if (chunk.used) {
      chunk.matrixAttribute.addUpdateRange(0, chunk.used * 16)
      chunk.styleAttribute.addUpdateRange(0, chunk.used * 3)
      chunk.matrixAttribute.needsUpdate = chunk.styleAttribute.needsUpdate = true
    }
  }
}

export default function RealCityBuildings({ layout, groundY = CITY_Y, nearDistance = 260 }) {
  const model = useLoader(GLTFLoader, `${MODEL_ROOT}apartments-near.gltf?v=solid-3`)
  const plan = useMemo(() => assembleArchitecture(layout), [layout])
  const instances = useMemo(() => createInstances(plan, model.scene, nearDistance), [plan, model, nearDistance])
  const root = useRef()
  const visibility = useMemo(() => createArchitectureVisibility(plan.buildings, instances.triangleCosts), [plan, instances])
  useFrame(({ camera }) => {
    if (!root.current?.parent?.visible) return
    root.current.updateWorldMatrix(true, false)
    camera.updateWorldMatrix(true, false)
    if (!visibility.update(camera, root.current.matrixWorld, nearDistance)) return
    for (const set of instances.sets) {
      if (!set.module.entries.some(entry => visibility.changed[entry.buildingIndex])) continue
      packVisibleInstances(set, visibility.state)
    }
    instances.distant.pack(visibility.state)
  })
  useEffect(() => () => {
    instances.sets.forEach(set => set.chunks.forEach(chunk => chunk.meshes.forEach(mesh => { mesh.dispose(); mesh.geometry.dispose() })))
    instances.materials.forEach(material => material.dispose())
    instances.roofs.forEach(roof => roof.dispose())
    instances.distant.dispose()
  }, [instances])
  return <group ref={root} position={[0, groundY, 0]} dispose={null}>
    <primitive object={instances.group} />
  </group>
}
