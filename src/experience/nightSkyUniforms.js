import * as THREE from 'three'

// The supplied photograph sits at 35.7 degrees elevation in front of the
// corridor entrance's outward (+z) face, at a slight side angle. Celestial distance keeps it
// fixed while the visitor walks; turn toward it and look up from any roof side.
const galaxyDirection = new THREE.Vector3(-.24, .74, 1).normalize()
const horizontal = new THREE.Vector3().crossVectors(galaxyDirection, new THREE.Vector3(0, 1, 0)).normalize()
const vertical = new THREE.Vector3().crossVectors(horizontal, galaxyDirection).normalize()
// Rotate the source frame so the photograph's diagonal coloured band reads
// almost horizontally across the side sky, retaining its original proportions.
const roll = 35 * Math.PI / 180
const galaxyAxis = horizontal.multiplyScalar(Math.cos(roll)).addScaledVector(vertical, Math.sin(roll))
const galaxyUp = new THREE.Vector3().crossVectors(galaxyAxis, galaxyDirection).normalize()
// Equal tangent-plane scale preserves the full 6000 x 4000 photograph's 3:2
// proportions. Both tangent-plane dimensions are doubled from the preceding
// experiment, then enlarged another 20%: 105.3 by 82.3 degrees including
// the softly masked borders.
const halfHeight = Math.tan(20 * Math.PI / 180)
const galaxyHalfSize = new THREE.Vector2(3.6 * halfHeight, 2.4 * halfHeight)

// Shared by the Moon disc and the exterior's reflected moonlight.
export const MOON_DIRECTION = Object.freeze([.7, .4, -1])
export const MOON_RADIUS = .035

// One resource identity for every view of the sky, including after a shader hot reload.
// Cloned materials share these holders instead of retaining an obsolete texture binding.
export const nightSkyUniforms = {
  uTime: { value: 0 },
  uGalaxyMap: { value: null },
  uMoonMap: { value: null },
  uSkyView: { value: new THREE.Matrix3() },
  uSkyProjection: { value: new THREE.Matrix4() },
  uMoonDisc: { value: new THREE.Vector4() },
  uMoonVisible: { value: false },
  uPixelRatio: { value: 1 },
  uSkyColor: { value: new THREE.Vector3(.00012, .00014, .0003) },
  uGalaxyDirection: { value: galaxyDirection },
  uGalaxyAxis: { value: galaxyAxis },
  uGalaxyUp: { value: galaxyUp },
  uGalaxyHalfSize: { value: galaxyHalfSize },
  uGalaxyEdge: { value: new THREE.Vector2(.30, .28) },
  uGalaxyBlack: { value: new THREE.Vector3(.0003, .0003, .0018) },
  uGalaxyGain: { value: .72 },
  uGalaxyOpacity: { value: .4 },
  uMoonDirection: { value: new THREE.Vector3(...MOON_DIRECTION) },
  uMoonRadius: { value: MOON_RADIUS },
}

const moonView = new THREE.Vector3()
const moonClip = new THREE.Vector4()
export function updateNightSkyView(camera, pixelRatio) {
  camera.updateMatrixWorld()
  nightSkyUniforms.uSkyView.value.setFromMatrix4(camera.matrixWorldInverse)
  nightSkyUniforms.uPixelRatio.value = pixelRatio
  nightSkyUniforms.uSkyProjection.value.copy(camera.projectionMatrix)
  moonView.copy(nightSkyUniforms.uMoonDirection.value).applyMatrix3(nightSkyUniforms.uSkyView.value)
  const visible = moonView.z < -.00001
  nightSkyUniforms.uMoonVisible.value = visible
  if (visible) {
    moonClip.set(moonView.x, moonView.y, moonView.z, 1).applyMatrix4(camera.projectionMatrix)
    // A circle of constant pixel radius, anchored to its celestial direction.
    // Off-axis perspective would otherwise stretch a distant spherical disc.
    const radius = nightSkyUniforms.uMoonRadius.value
    nightSkyUniforms.uMoonDisc.value.set(moonClip.x / moonClip.w, moonClip.y / moonClip.w,
      radius * camera.projectionMatrix.elements[0], radius * camera.projectionMatrix.elements[5])
  }
}

// Reflection probes render six cameras inside one frame. Prepare both sky
// passes at draw time so every face, then the main view, has its own rotation.
export function prepareNightSkyPass(renderer, _scene, camera, _geometry, material) {
  updateNightSkyView(camera, renderer.getPixelRatio())
  material.uniformsNeedUpdate = true
}

export function galaxyCoordinates(direction) {
  const d = new THREE.Vector3(...direction).normalize()
  const facing = d.dot(galaxyDirection)
  if (facing <= 0) return { u: 0, v: 0, weight: 0 }
  const u = .5 + d.dot(galaxyAxis) / (2 * facing * galaxyHalfSize.x)
  const v = .5 + d.dot(galaxyUp) / (2 * facing * galaxyHalfSize.y)
  const edge = nightSkyUniforms.uGalaxyEdge.value
  return {
    u, v,
    weight: THREE.MathUtils.smoothstep(Math.min(u, 1 - u), 0, edge.x)
      * THREE.MathUtils.smoothstep(Math.min(v, 1 - v), 0, edge.y)
      * (1 - THREE.MathUtils.smoothstep(Math.hypot((2 * u - 1) * .90, 2 * v - 1), .62, 1.10)),
  }
}

export function createStarPopulation() {
  let seed = 20261021
  const random = () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed)
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
  const count = 5200
  const moon = nightSkyUniforms.uMoonDirection.value.clone().normalize()
  const moonEdge = Math.cos(Math.atan(nightSkyUniforms.uMoonRadius.value) + .003)
  const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count), brightness = new Float32Array(count), twinkle = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    let x, y, z
    do {
      y = .012 + random() * .988
      const angle = random() * Math.PI * 2, radius = Math.sqrt(1 - y * y)
      x = radius * Math.cos(angle); z = radius * Math.sin(angle)
    } while (x * moon.x + y * moon.y + z * moon.z > moonEdge)
    positions.set([x, y, z], i * 3)
    const luminous = Math.pow(random(), 4)
    sizes[i] = .8 + 2.55 * luminous
    brightness[i] = .045 + 1.15 * luminous
    const spectral = random()
    colors.set(spectral < .6 ? [1, .98, .95] : spectral < .85 ? [.83, .91, 1] : [1, .89, .76], i * 3)
    // Only a minority scintillates, slowly and by a few percent. No star turns
    // off, changes hue or moves; the remaining population is entirely steady.
    twinkle.set([random() < .24 ? (.025 + random() * .045) * (1 - y * .4) : 0,
      .45 + random() * .6, random() * Math.PI * 2], i * 3)
  }
  return { positions, colors, sizes, brightness, twinkle }
}
