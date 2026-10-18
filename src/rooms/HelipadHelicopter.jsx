import { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { nightSkyUniforms } from '../experience/nightSkyUniforms.js'
import { BUILDING } from '../experience/corridorLayout.js'
import { HELICOPTER_MODEL_URL, HELICOPTER_PLACEMENT, HELIPAD_FLOODS } from './helicopterPlacement.js'
import { createHelicopterCabin } from './helicopterCabin.js'

const noRaycast = () => null
const physicalSetup = THREE.ShaderChunk.lights_fragment_begin.split('IncidentLight directLight;')[0]

// The roof uses private night lighting rather than the gallery's indoor lights.
// Keep the helicopter's authored PBR response under that same open night sky.
const roofLighting = /* glsl */ `
  ${physicalSetup}
  IncidentLight helicopterMoon;
  helicopterMoon.visible = true;
  helicopterMoon.direction = normalize(mat3(viewMatrix) * normalize(uMoonDirection));
  helicopterMoon.color = vec3(.42, .49, .61);
  RE_Direct_Physical(helicopterMoon, geometryPosition, geometryNormal, geometryViewDir,
    geometryClearcoatNormal, material, reflectedLight);
  for (int i=0; i<2; i++) {
    vec3 toLamp = (viewMatrix*vec4(uHelipadFloodPosition[i],1.)).xyz-geometryPosition;
    float distanceToLamp = length(toLamp);
    vec3 lampDirection = normalize(mat3(viewMatrix)*uHelipadFloodDirection[i]);
    float cone = smoothstep(uHelipadFloodCone[i].x,uHelipadFloodCone[i].y,dot(-normalize(toLamp),lampDirection));
    helicopterMoon.direction = normalize(toLamp);
    helicopterMoon.color = uHelipadFloodColor[i]*cone*getDistanceAttenuation(distanceToLamp,uHelipadFloodCone[i].z,2.);
    RE_Direct_Physical(helicopterMoon, geometryPosition, geometryNormal, geometryViewDir,
      geometryClearcoatNormal, material, reflectedLight);
  }
  vec3 roofNormal = inverseTransformDirection(geometryNormal, viewMatrix);
  vec3 irradiance = mix(vec3(.052, .057, .066), vec3(.23, .28, .36), clamp(roofNormal.y*.5+.5, 0., 1.));
  RE_IndirectDiffuse_Physical(irradiance, geometryPosition, geometryNormal, geometryViewDir,
    geometryClearcoatNormal, material, reflectedLight);
  vec3 reflection = inverseTransformDirection(reflect(-geometryViewDir, geometryNormal), viewMatrix);
  vec3 radiance = mix(vec3(.025, .03, .04), vec3(.12, .18, .28), smoothstep(-.12, .6, reflection.y));
  RE_IndirectSpecular_Physical(radiance, irradiance, radiance, geometryPosition, geometryNormal,
    geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
`

function roofAircraftMaterial(source) {
  const material = new THREE.MeshPhysicalMaterial()
  THREE.MeshStandardMaterial.prototype.copy.call(material,source)
  const name = source.name.toLowerCase()
  material.fog = false
  material.envMap = null
  material.emissive?.set('#000000')
  // A parked aircraft has no active lamps. Conventional alpha glazing keeps
  // the full cabin visible without an expensive screen-space transmission pass.
  if ('transmission' in material) material.transmission = 0
  if (name.includes('glazing')) {
    material.color.set(name.includes('glazing') ? '#8ea9b6' : '#ffffff')
    material.transparent = true
    material.opacity = .20
    material.depthWrite = false
    material.roughness = .09
    material.forceSinglePass = true
    if ('clearcoat' in material) {
      material.clearcoat = 1
      material.clearcoatRoughness = .08
    }
  } else if (name.includes('paint')) {
    material.roughness = .42
    material.metalness = .025
    if ('clearcoat' in material) {
      material.clearcoat = .65
      material.clearcoatRoughness = .2
    }
  }
  material.onBeforeCompile = shader => {
    shader.uniforms.uMoonDirection = nightSkyUniforms.uMoonDirection
    shader.uniforms.uHelipadFloodPosition = {value:HELIPAD_FLOODS.map(f => new THREE.Vector3(...f.position))}
    shader.uniforms.uHelipadFloodDirection = {value:HELIPAD_FLOODS.map(f => new THREE.Vector3(...f.direction))}
    shader.uniforms.uHelipadFloodColor = {value:HELIPAD_FLOODS.map(f => new THREE.Vector3(...f.color).multiplyScalar(f.intensity))}
    shader.uniforms.uHelipadFloodCone = {value:HELIPAD_FLOODS.map(f => new THREE.Vector3(Math.cos(THREE.MathUtils.degToRad(f.outer)),Math.cos(THREE.MathUtils.degToRad(f.inner)),f.range))}
    shader.fragmentShader = `uniform vec3 uMoonDirection;
      uniform vec3 uHelipadFloodPosition[2];uniform vec3 uHelipadFloodDirection[2];
      uniform vec3 uHelipadFloodColor[2];uniform vec3 uHelipadFloodCone[2];\n${shader.fragmentShader}`
      .replace('#include <lights_fragment_begin>', roofLighting)
      .replace('#include <lights_fragment_maps>', '')
      .replace('#include <lights_fragment_end>', '')
    if (name.includes('paint')) {
      // Recolour the authored maroon livery in material space. Swapping red
      // and blue preserves its white markings, texture detail and highlights.
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        diffuseColor.rgb=diffuseColor.bgr;`)
    }
  }
  material.customProgramCacheKey = () => `helipad-aircraft-night-blue-3-${name.includes('paint')}`
  return material
}

function contactShadowMap() {
  const size = 128, pixels = new Uint8Array(size*size*4)
  for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
    const radius = Math.hypot((x/(size-1)-.5)*2, (y/(size-1)-.5)*2)
    const alpha = Math.pow(Math.max(0, 1-radius*radius), 2)
    const i = (y*size+x)*4
    pixels[i] = pixels[i+1] = pixels[i+2] = 255
    pixels[i+3] = Math.round(alpha*255)
  }
  const texture = new THREE.DataTexture(pixels,size,size)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

/** Detailed civilian aircraft, shut down with its authored rotor blades stopped. */
export default function HelipadHelicopter() {
  const source = useLoader(GLTFLoader, HELICOPTER_MODEL_URL)
  const root = useRef()
  useEffect(() => {
    const parent = root.current
    const scene = source.scene.clone(true)
    const materials = new Map()
    scene.name = 'Parked civilian helicopter'
    scene.traverse(mesh => {
      if (!mesh.isMesh) return
      const cloneMaterial = original => {
        if (!materials.has(original)) materials.set(original,roofAircraftMaterial(original))
        return materials.get(original)
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(cloneMaterial) : cloneMaterial(mesh.material)
      mesh.raycast = noRaycast
    })
    const cabin=createHelicopterCabin(roofAircraftMaterial)
    scene.add(cabin.root)

    // Soft ambient occlusion at the deck, with tight contact beneath each skid.
    // Source geometry/textures remain cached; only these local resources are owned.
    const shadowMap = contactShadowMap()
    const shadowGeometry = new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2)
    const shadowMaterials = []
    for (const [x,z,width,depth,opacity] of [[1,0,5.7,3.3,.25], [.65,-.97,3,.22,.58], [.65,.97,3,.22,.58]]) {
      const material = new THREE.MeshBasicMaterial({color:'#030507',map:shadowMap,transparent:true,opacity,depthWrite:false,toneMapped:false})
      const shadow = new THREE.Mesh(shadowGeometry,material)
      shadow.name = 'Helicopter deck contact shadow'
      shadow.position.set(x,.009,z)
      shadow.scale.set(width,1,depth)
      shadow.raycast = noRaycast
      scene.add(shadow)
      shadowMaterials.push(material)
    }
    const p = HELICOPTER_PLACEMENT
    scene.position.set(p.x,p.y,p.z)
    scene.rotation.y = p.yaw
    scene.scale.setScalar(p.scale)
    parent.add(scene)

    const fixtureGeometry = new THREE.BoxGeometry(1,1,1)
    const lensGeometry = new THREE.PlaneGeometry(.54,.18)
    const fixtureSource = new THREE.MeshStandardMaterial({color:'#283039',metalness:.7,roughness:.45})
    const fixtureMaterial = roofAircraftMaterial(fixtureSource)
    fixtureSource.dispose()
    const lensMaterial = new THREE.MeshBasicMaterial({color:'#fff0d5',toneMapped:false})
    const fixtures = HELIPAD_FLOODS.map(f => {
      const fixture = new THREE.Group()
      fixture.name = 'Roof helipad wall floodlight'
      const mount = new THREE.Vector3(f.position[0],f.position[1]-.14,BUILDING.backZ-.02)
      const anchor = new THREE.Vector3(f.position[0],f.position[1]-.1,f.position[2])
      const plate = new THREE.Mesh(fixtureGeometry,fixtureMaterial)
      plate.position.copy(mount)
      plate.scale.set(.22,.27,.04)
      plate.raycast = noRaycast
      fixture.add(plate)
      const bracket = new THREE.Mesh(fixtureGeometry,fixtureMaterial)
      bracket.position.copy(mount).add(anchor).multiplyScalar(.5)
      bracket.scale.set(.08,.08,mount.distanceTo(anchor))
      bracket.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),anchor.clone().sub(mount).normalize())
      bracket.raycast = noRaycast
      fixture.add(bracket)
      const head = new THREE.Group()
      head.position.set(...f.position)
      head.lookAt(...f.target)
      const casing = new THREE.Mesh(fixtureGeometry,fixtureMaterial)
      casing.scale.set(.65,.28,.22)
      casing.raycast = noRaycast
      head.add(casing)
      const lens = new THREE.Mesh(lensGeometry,lensMaterial)
      lens.position.z = .111
      lens.raycast = noRaycast
      head.add(lens)
      fixture.add(head)
      parent.add(fixture)
      return fixture
    })
    return () => {
      parent.remove(scene)
      cabin.dispose()
      fixtures.forEach(fixture => parent.remove(fixture))
      materials.forEach(material => material.dispose())
      shadowMaterials.forEach(material => material.dispose())
      shadowGeometry.dispose()
      shadowMap.dispose()
      fixtureGeometry.dispose()
      lensGeometry.dispose()
      fixtureMaterial.dispose()
      lensMaterial.dispose()
    }
  },[source])
  return <group ref={root} name="helipad-helicopter" dispose={null} />
}
