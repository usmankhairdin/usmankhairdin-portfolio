import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { floorReflection } from './floorReflection.js'
import { PROBE_SIZE, prepareForProbe, sceneCompiled } from './probeEnv.js'

/*
 * Corridor atmosphere adapted from the Shahz Connect corridor (Experience.jsx ReflectionPass and
 * world/envProbes.js), used with the owner's permission.
 */

/** Renders the shared floor reflection once per frame, after the camera has moved. */
export function ReflectionPass({ scale = 0.5 }) {
  const { gl, scene, camera } = useThree()
  const size = useMemo(() => new THREE.Vector2(), [])
  useFrame(() => {
    floorReflection.scale = scale
    gl.getDrawingBufferSize(size)
    floorReflection.setSize(size.x, size.y)
    camera.updateMatrixWorld()
    floorReflection.update(gl, scene, camera)
  }, -1)
  return null
}

/**
 * Captures the corridor once into a cube map so bronze, stone and walnut reflect the real
 * surrounding architecture instead of nothing. Runs after the corridor has mounted.
 */
export function CorridorProbe({ materials, position = [0, 1.8, -30] }) {
  const { gl, scene } = useThree()
  // compiled with reflections from the first frame; the capture then swaps in without a rebuild
  useLayoutEffect(() => { prepareForProbe(gl, materials) }, [gl, materials])
  useEffect(() => {
    let env = null
    let cancelled = false
    sceneCompiled(gl).then(() => {
      if (cancelled) return
      const pmrem = new THREE.PMREMGenerator(gl)
      const target = new THREE.WebGLCubeRenderTarget(PROBE_SIZE, { type: THREE.HalfFloatType, generateMipmaps: false })
      const cube = new THREE.CubeCamera(0.05, 220, target)
      cube.position.set(position[0], position[1], position[2])
      cube.updateMatrixWorld(true)
      const previous = gl.getRenderTarget()
      cube.update(gl, scene)
      gl.setRenderTarget(previous)
      env = pmrem.fromCubemap(target.texture).texture
      target.dispose()
      pmrem.dispose()
      materials.forEach((m) => { m.envMap = env })
    })
    return () => {
      cancelled = true
      env?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, materials])
  return null
}
