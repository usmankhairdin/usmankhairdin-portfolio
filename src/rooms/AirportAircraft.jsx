import { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AIRPORT_PLANES } from './airportPlan.js'
import { airportPhysicalMaterial } from './airportMaterials.js'

const noRaycast = () => null
function aircraftMaterial(source) {
  const material = airportPhysicalMaterial(source)
  const name = source.name.toLowerCase()
  material.emissive?.set('#000000')
  // Preserve the source colour maps, UV transforms, metalness, roughness,
  // authored normals and interior. Parked aircraft have no lit landing lamps.
  if ('transmission' in material) material.transmission = 0
  if (name === 'glass' || name.includes('glazing')) {
    material.color.set('#86a5b5')
    material.roughness = .11
    material.transparent = true
    material.opacity = .38
    material.depthWrite = false
    material.forceSinglePass = true
    material.clearcoat = 1
    material.clearcoatRoughness = .09
  } else if (name.startsWith('fuselage')) {
    // Keep the authored white/red civil livery and rivet normal maps. Painted
    // aluminium has a dielectric coating rather than a bare-metal response.
    material.metalness = .025
    material.roughness = .32
    material.specularColor?.set('#ffffff')
    material.clearcoat = .65
    material.clearcoatRoughness = .23
  } else if (name === 'rubber') {
    material.color.set('#17191b')
    material.roughness = .82
  } else if (name === 'nosecone') {
    material.metalness = .85
    material.roughness = .27
  }
  return material
}

/** Actual high-wing Cessna 172 with its full authored civil cabin and livery. */
export default function AirportAircraft() {
  const source = useLoader(GLTFLoader,'/assets/city/airport/cessna172-runtime.glb')
  const root = useRef()
  useEffect(() => {
    const parent = root.current
    const materials = new Map()
    const bounds = new THREE.Box3().setFromObject(source.scene,true)
    const planes = AIRPORT_PLANES.map(plane => {
      const scene = source.scene.clone(true)
      scene.name = 'Parked civilian Cessna 172'
      scene.traverse(mesh => {
        if (!mesh.isMesh) return
        const cloneMaterial = original => {
          if (!materials.has(original)) materials.set(original,aircraftMaterial(original))
          return materials.get(original)
        }
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(cloneMaterial) : cloneMaterial(mesh.material)
        mesh.raycast = noRaycast
      })
      scene.position.set(plane.x,.20 - bounds.min.y,plane.z)
      scene.rotation.y = plane.yaw
      parent.add(scene)
      return scene
    })
    // Own only the cloned materials. Loader geometry/textures are cached and
    // remain intact across route changes and React StrictMode effect replay.
    return () => {
      planes.forEach(plane => parent.remove(plane))
      materials.forEach(material => material.dispose())
    }
  },[source])
  return <group ref={root} name="airport-aircraft" dispose={null} />
}
