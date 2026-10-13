import * as THREE from 'three'

/*
 * Every reflection probe in the building (the corridor's and each room's) is a 128 px cube
 * filtered to the same size, so all of them compile to the same shader. Materials that will
 * take a probe get this black stand-in of exactly that size from the start: their shaders are
 * compiled once, with reflections, and the real probe later swaps in without a recompile -
 * the difference between a smooth arrival and the screen freezing while every material in
 * the building is rebuilt.
 */
export const PROBE_SIZE = 128

// Per renderer: a stand-in lives on the GPU of the context that made it, and every visit to the
// Home page makes a new context, so each keeps its own - and its own promise that its scene is
// compiled (HomeExperience compiles every shader behind the loader; the probes capture after).
const perRenderer = new WeakMap()
const stateOf = (gl) => {
  let st = perRenderer.get(gl)
  if (!st) {
    st = { standIn: null }
    st.compiled = new Promise((resolve) => { st.markCompiled = resolve })
    perRenderer.set(gl, st)
  }
  return st
}
/** Resolves once every shader of this renderer's scene is compiled. */
export const sceneCompiled = (gl) => stateOf(gl).compiled
export const markSceneCompiled = (gl) => stateOf(gl).markCompiled()

export function probeStandIn(gl) {
  const st = stateOf(gl)
  if (st.standIn) return st.standIn
  const pmrem = new THREE.PMREMGenerator(gl)
  const target = new THREE.WebGLCubeRenderTarget(PROBE_SIZE, { type: THREE.HalfFloatType, generateMipmaps: false })
  const cube = new THREE.CubeCamera(0.05, 1, target)
  const previous = gl.getRenderTarget()
  cube.update(gl, new THREE.Scene())
  gl.setRenderTarget(previous)
  st.standIn = pmrem.fromCubemap(target.texture).texture
  target.dispose()
  pmrem.dispose()
  return st.standIn
}

/** Gives each material without a probe yet this renderer's stand-in. */
export function prepareForProbe(gl, materials) {
  const env = probeStandIn(gl)
  for (const m of materials) {
    if (m?.isMeshStandardMaterial && (!m.envMap || m.envMap.isRenderTargetTexture)) {
      m.envMap = env
      m.needsUpdate = true
    }
  }
}
