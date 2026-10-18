import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import * as THREE from 'three'
import * as sky from '../src/experience/nightSkyUniforms.js'
import { headQuaternion, look, setLook } from '../src/experience/freeLook.js'

test('the rendered Moon remains circular and the same pixel size at both screen edges', () => {
  for (const [width, height] of [[1440, 900], [2560, 1080]]) {
    const camera = new THREE.PerspectiveCamera(62, width / height, .05, 2400)
    const moon = new THREE.Vector3(...sky.MOON_DIRECTION).normalize()
    const moonHeading = Math.atan2(-moon.x, -moon.z)
    let firstRadius
    for (const offset of [-.62, 0, .62]) {
      camera.rotation.set(Math.asin(moon.y), moonHeading + offset, 0, 'YXZ')
      sky.updateNightSkyView(camera, 1)
      const disc = sky.nightSkyUniforms.uMoonDisc?.value
      assert.ok(disc, 'the rendered shader receives a Moon disc in screen coordinates')
      assert.equal(sky.nightSkyUniforms.uMoonVisible.value, true)
      const radiusX = disc.z * width / 2, radiusY = disc.w * height / 2
      assert.ok(Math.abs(radiusX - radiusY) < 1e-10, 'the disc has equal pixel radii')
      if (firstRadius === undefined) firstRadius = radiusY
      assert.ok(Math.abs(radiusY - firstRadius) < 1e-10, 'looking sideways cannot enlarge the Moon')
      const expected = moon.clone().project(camera)
      assert.ok(Math.abs(disc.x - expected.x) < 1e-10 && Math.abs(disc.y - expected.y) < 1e-10,
        'the existing celestial direction is preserved')
    }
    camera.lookAt(moon.clone().negate())
    sky.updateNightSkyView(camera, 1)
    assert.equal(sky.nightSkyUniforms.uMoonVisible.value, false, 'no mirrored Moon behind the camera')
  }
})

test('the Moon is modestly larger, farther right and higher while walking produces no celestial parallax', () => {
  assert.equal(typeof sky.updateNightSkyView, 'function')
  const camera = new THREE.PerspectiveCamera(62, 1.5, .05, 2400)
  sky.updateNightSkyView(camera, 1.5)
  const before = sky.nightSkyUniforms.uSkyView.value.clone()
  const moon = sky.nightSkyUniforms.uMoonDirection.value.clone()
  assert.ok(Object.isFrozen(sky.MOON_DIRECTION), 'the ocean and sky share an immutable celestial direction')
  assert.deepEqual(moon.toArray(), sky.MOON_DIRECTION)
  assert.equal(sky.nightSkyUniforms.uMoonRadius.value, sky.MOON_RADIUS)
  assert.ok(sky.MOON_RADIUS > .029 && sky.MOON_RADIUS < .04, 'the Moon grows without dominating the sky')
  const projected = moon.applyMatrix3(before).project(camera)
  assert.ok(projected.x > .5 / (Math.tan(31 * Math.PI / 180) * 1.5))
  assert.ok(projected.y > .28 / Math.tan(31 * Math.PI / 180))
  camera.position.set(37, 1.58, -85)
  sky.updateNightSkyView(camera, 1.5)
  assert.deepEqual(sky.nightSkyUniforms.uSkyView.value.elements, before.elements, 'no celestial parallax while walking around the building')
  camera.rotation.y = Math.PI
  sky.updateNightSkyView(camera, 1.5)
  assert.notDeepEqual(sky.nightSkyUniforms.uSkyView.value.elements, before.elements)
})

test('each sky pass follows its actual render camera across cube faces and restores the main view without parallax', () => {
  assert.equal(typeof sky.prepareNightSkyPass, 'function')
  const renderer = { getPixelRatio: () => 1.5 }
  const main = new THREE.PerspectiveCamera(62, 1.5, .05, 2400)
  main.rotation.set(.12, .37, 0)
  const target = new THREE.WebGLCubeRenderTarget(16)
  const probe = new THREE.CubeCamera(.05, 2400, target)
  probe.coordinateSystem = THREE.WebGLCoordinateSystem
  probe.updateCoordinateSystem()
  probe.position.set(20, 2.4, -35)
  probe.updateMatrixWorld(true)
  const geometry = new THREE.BufferGeometry()
  const passes = [new THREE.Mesh(geometry, new THREE.ShaderMaterial({ uniforms: sky.nightSkyUniforms })),
    new THREE.Points(geometry, new THREE.ShaderMaterial({ uniforms: sky.nightSkyUniforms }))]
  passes.forEach(pass => { pass.onBeforeRender = sky.prepareNightSkyPass })
  const draw = (pass, camera) => {
    pass.material.uniformsNeedUpdate = false
    pass.onBeforeRender(renderer, null, camera, geometry, pass.material, null)
    const forward = camera.getWorldDirection(new THREE.Vector3()).applyMatrix3(pass.material.uniforms.uSkyView.value)
    assert.ok(forward.distanceTo(new THREE.Vector3(0, 0, -1)) < 1e-12, 'the rendered camera sees its own forward direction at the centre')
    assert.equal(pass.material.uniformsNeedUpdate, true, 'shared shader uniforms upload for every camera/pass')
  }
  draw(passes[0], main)
  const original = sky.nightSkyUniforms.uSkyView.value.clone()
  for (const camera of probe.children) for (const pass of passes) draw(pass, camera)
  main.position.set(-37, 1.58, -85)
  for (const pass of passes) {
    draw(pass, main)
    assert.deepEqual(sky.nightSkyUniforms.uSkyView.value.elements, original.elements, 'main orientation is restored after the capture; walking cannot shift the sky')
  }
  assert.equal(sky.nightSkyUniforms.uPixelRatio.value, 1.5)
  geometry.dispose(); target.dispose(); passes.forEach(pass => pass.material.dispose())
})

function photoDirection(u, v) {
  const half = sky.nightSkyUniforms.uGalaxyHalfSize?.value
  const centre = sky.nightSkyUniforms.uGalaxyDirection?.value
  assert.ok(half && centre, 'the photograph has one finite side-sky placement')
  return centre.clone().addScaledVector(sky.nightSkyUniforms.uGalaxyAxis.value, (u * 2 - 1) * half.x)
    .addScaledVector(sky.nightSkyUniforms.uGalaxyUp.value, (v * 2 - 1) * half.y).normalize().toArray()
}

test('the Milky Way keeps its entrance-front angle with the requested proportional enlargement and forty percent opacity', () => {
  const centre = sky.nightSkyUniforms.uGalaxyDirection?.value
  assert.ok(centre)
  const elevation = Math.asin(centre.y) * 180 / Math.PI
  const moon = sky.nightSkyUniforms.uMoonDirection.value.clone().normalize()
  const moonElevation = Math.asin(moon.y) * 180 / Math.PI
  assert.ok(elevation >= moonElevation + 12 && elevation <= moonElevation + 22,
    'the galaxy moves a little higher in the front sky')
  assert.ok(centre.z > .7 && Math.abs(centre.x) < .25, 'the galaxy faces the outward front of the corridor entrance with a slight angle')
  assert.equal(sky.nightSkyUniforms.uGalaxyOpacity.value, .4, 'the previous fifty percent opacity is reduced by another twenty percent')
  assert.ok(centre.angleTo(moon) * 180 / Math.PI > 55, 'the galaxy is in another part of the side sky')
  for (const direction of [[0, 1, 0], [0, .8, -1], [1, .25, 0], centre.clone().negate().toArray()]) {
    assert.equal(sky.galaxyCoordinates(direction).weight, 0, 'the zenith and opposite hemisphere stay dark')
  }
  const edge = new THREE.Vector3(...photoDirection(1, .5))
  const width = centre.angleTo(edge) * 2 * 180 / Math.PI
  assert.ok(width >= 102 && width <= 108, 'the doubled tangent source field is enlarged proportionally by another twenty percent')
  const top = new THREE.Vector3(...photoDirection(.5, 1))
  const height = centre.angleTo(top) * 2 * 180 / Math.PI
  assert.ok(height >= 80 && height <= 85, 'the 3:2 source retains its shape after the extra enlargement')
})

test('the angled Milky Way is visible by looking toward it from every side of the roof', () => {
  const camera = new THREE.PerspectiveCamera(62, 1.5, .05, 2400)
  const previousLook = { ...look }
  try {
    const direction = sky.nightSkyUniforms.uGalaxyDirection.value
    const yaw = Math.atan2(-direction.x, -direction.z)
    for (const [x,z] of [[0,31],[0,-90],[-40,-36],[40,-36]]) {
      camera.position.set(x,1.58,z)
      setLook(yaw, Math.asin(direction.y))
      headQuaternion(camera.quaternion)
      camera.updateMatrixWorld()
      sky.updateNightSkyView(camera,1.5)
      const core = new THREE.Vector3(...photoDirection(.5, .5)).applyMatrix3(sky.nightSkyUniforms.uSkyView.value).applyMatrix4(camera.projectionMatrix)
      assert.ok(Math.abs(core.x) < .8 && Math.abs(core.y) < .8 && core.z < 1,
        `${x},${z}: the fixed celestial photograph must be comfortably visible from the roof`)
    }
  } finally {
    Object.assign(look, previousLook)
  }
})

test('the supplied 3:2 Milky Way photograph keeps its proportions and maps each detail only once', () => {
  const centre = sky.nightSkyUniforms.uGalaxyDirection?.value
  assert.ok(centre)
  const ray = axis => centre.clone().addScaledVector(axis, Math.tan(.001)).normalize().toArray()
  const center = sky.galaxyCoordinates(centre.toArray())
  const across = sky.galaxyCoordinates(ray(sky.nightSkyUniforms.uGalaxyAxis.value))
  const vertical = sky.galaxyCoordinates(ray(sky.nightSkyUniforms.uGalaxyUp.value))
  const widthPixels = (across.u - center.u) * 6000
  const heightPixels = (vertical.v - center.v) * 4000
  assert.ok(widthPixels > 0, 'the mapping never stalls and stretches at the zenith')
  assert.ok(Math.abs(widthPixels - heightPixels) < 1e-9, 'source pixels have the same angular width and height')
  for (const u of [.2, .4, .6, .8]) assert.ok(Math.abs(sky.galaxyCoordinates(photoDirection(u, .5)).u - u) < 1e-12)
})

test('the sky projection preserves the supplied photograph orientation without mirroring', () => {
  const direction = sky.nightSkyUniforms.uGalaxyDirection.value
  const camera = new THREE.PerspectiveCamera()
  camera.lookAt(direction)
  camera.updateMatrixWorld()
  const view = new THREE.Matrix3().setFromMatrix4(camera.matrixWorldInverse)
  const right = sky.nightSkyUniforms.uGalaxyAxis.value.clone().applyMatrix3(view)
  const up = sky.nightSkyUniforms.uGalaxyUp.value.clone().applyMatrix3(view)
  assert.ok(right.x * up.y - right.y * up.x > .999,
    'photo right and up retain their handedness in the viewing camera')
})

test('the supplied photograph is delivered at its full original pixel dimensions',async()=>{
  const bytes=await readFile('public/assets/sky/milky-way-thilina-6000.jpg')
  let size
  for(let i=2;i<bytes.length;){
    assert.equal(bytes[i],0xff,'valid JPEG marker')
    const marker=bytes[i+1],length=bytes.readUInt16BE(i+2)
    if([0xc0,0xc1,0xc2].includes(marker)){size=[bytes.readUInt16BE(i+7),bytes.readUInt16BE(i+5)];break}
    i+=length+2
  }
  assert.deepEqual(size,[6000,4000],'the full source is retained without resizing or cropping')
})

test('all four finite photograph edges fade fully into black without a visible rectangular frame', () => {
  for (const [u, v] of [[0, .5], [1, .5], [.5, 0], [.5, 1]]) {
    assert.ok(sky.galaxyCoordinates(photoDirection(u, v)).weight < 1e-10, 'a hard image boundary never contributes light')
  }
  assert.equal(sky.galaxyCoordinates(photoDirection(.5, .5)).weight, 1)
  const feather = sky.galaxyCoordinates(photoDirection(.03, .5))
  assert.ok(feather.weight > 0 && feather.weight < 1, 'the boundary blends over an angular interval')
  assert.equal(sky.galaxyCoordinates(photoDirection(-.05, .5)).weight, 0)
  assert.equal(sky.galaxyCoordinates(sky.MOON_DIRECTION).weight, 0, 'the Moon stays in a separate dark area of the sky')
})

test('a deterministic stellar population varies size, brightness and gentle spectral tints with a steady majority', () => {
  assert.equal(typeof sky.createStarPopulation, 'function')
  const stars = sky.createStarPopulation(), repeat = sky.createStarPopulation()
  assert.deepEqual(stars.positions, repeat.positions)
  assert.deepEqual(stars.colors, repeat.colors)
  assert.ok(stars.sizes.length >= 3000 && stars.sizes.length < 9000)
  let steady = 0, twinkling = 0
  let minSize = Infinity, maxSize = 0, minBrightness = Infinity, maxBrightness = 0
  const tints = new Set()
  for (let i = 0; i < stars.sizes.length; i++) {
    const direction = new THREE.Vector3().fromArray(stars.positions, i * 3)
    assert.ok(Math.abs(direction.length() - 1) < 1e-6)
    assert.ok(direction.y > 0, 'stars remain in the visible celestial hemisphere')
    minSize = Math.min(minSize, stars.sizes[i]); maxSize = Math.max(maxSize, stars.sizes[i])
    minBrightness = Math.min(minBrightness, stars.brightness[i]); maxBrightness = Math.max(maxBrightness, stars.brightness[i])
    tints.add(stars.colors.slice(i * 3, i * 3 + 3).join(','))
    const amplitude = stars.twinkle[i * 3]
    if (amplitude === 0) steady++
    else {
      twinkling++
      assert.ok(amplitude > 0 && amplitude <= .075, 'atmospheric twinkle never becomes an on/off flash')
      assert.ok(stars.twinkle[i * 3 + 1] > 0 && stars.twinkle[i * 3 + 1] < 1.2)
    }
  }
  assert.ok(maxSize > minSize * 2 && maxSize < 4)
  assert.ok(maxBrightness > minBrightness * 8)
  assert.ok(tints.size >= 3)
  assert.ok(steady > stars.sizes.length * .65)
  assert.ok(twinkling > stars.sizes.length * .15 && twinkling < stars.sizes.length * .35)
})

test('the base night sky stays close to black without a warm horizon glow', () => {
  const color = sky.nightSkyUniforms.uSkyColor?.value
  assert.ok(color, 'one neutral sky color is shared by every exterior view')
  assert.ok(Math.max(...color.toArray()) < .002)
  assert.ok(color.z >= color.x && color.y >= color.x)
})

test('the separate stellar pass never draws a point through the repositioned Moon disc', () => {
  const stars = sky.createStarPopulation()
  const moon = new THREE.Vector3(...sky.nightSkyUniforms.uMoonDirection.value.toArray()).normalize()
  const limit = 1 / Math.sqrt(1 + sky.nightSkyUniforms.uMoonRadius.value ** 2)
  for (let i = 0; i < stars.sizes.length; i++) {
    const direction = new THREE.Vector3().fromArray(stars.positions,i * 3)
    assert.ok(direction.dot(moon) < limit, 'the Moon occults background stars')
  }
})
