import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { floorReflection } from '../experience/floorReflection.js'
import { PROBE_SIZE, prepareForProbe, sceneCompiled } from '../experience/probeEnv.js'
import { ROOMS_URL, createRoomMaterials, useRoomLightmap, useRoomTextures } from './referenceRooms.js'

// Where each room's reflection probe stands, room-local: in front of the content wall, at eye level.
const PROBE = [8.2, 1.9, 0]

// Each room's node in the loaded file, found once by the room tag the extractor writes (the
// loader may rename duplicate names). Mounting a room moves its node out of the file's scene, and
// the loaded file is kept for the next visit, so a later mount - after Back from a page - must
// not look for it there again.
function roomNode(gltf, kind) {
  const keep = gltf.userData || (gltf.userData = {})
  if (!keep.roomNodes) {
    keep.roomNodes = {}
    gltf.scene.traverse((o) => { const k = o.userData?.room; if (k && !keep.roomNodes[k]) keep.roomNodes[k] = o })
  }
  return keep.roomNodes[kind] || null
}

/*
 * One of the four reference rooms, in room-local coordinates (it rides inside the room's
 * placement group, so it stands behind whichever door is active). Its architecture carries
 * its own baked light; a probe captured from inside gives its bronze, stone and glass their
 * reflections, and is captured again whenever the room moves to another door.
 */
export default function ReferenceRoom({ kind, placementKey }) {
  const { gl, scene } = useThree()
  const gltf = useLoader(GLTFLoader, ROOMS_URL)
  const tex = useRoomTextures()
  const lightmap = useRoomLightmap(kind)
  const materials = useMemo(() => createRoomMaterials(tex, lightmap, kind), [tex, lightmap, kind])
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  // Dress the room's meshes in its materials; floors are left out of their own reflection.
  const node = useMemo(() => roomNode(gltf, kind), [gltf, kind])
  const floors = useRef([])
  useLayoutEffect(() => {
    floors.current = []
    node?.traverse((o) => {
      if (!o.isMesh) return
      o.material = materials[o.material.name] || o.material
      if (o.material.userData?.floor) floors.current.push(o)
    })
    floors.current.forEach((o) => floorReflection.hidden.add(o))
    return () => floors.current.forEach((o) => floorReflection.hidden.delete(o))
  }, [node, materials])

  const group = useRef()
  const env = useRef(null)
  // compiled with reflections from the first frame; the capture then swaps in without a rebuild
  useLayoutEffect(() => { prepareForProbe(gl, Object.values(materials)) }, [gl, materials])
  useEffect(() => () => {
    env.current?.dispose()
    env.current = null
  }, [materials])
  useEffect(() => {
    let frame = 0
    let cancelled = false
    // once every shader is compiled, and a frame later
    sceneCompiled(gl).then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        if (!group.current) return
        group.current.updateWorldMatrix(true, true)
        const at = new THREE.Vector3(...PROBE).applyMatrix4(group.current.matrixWorld)
        const pmrem = new THREE.PMREMGenerator(gl)
        const target = new THREE.WebGLCubeRenderTarget(PROBE_SIZE, { type: THREE.HalfFloatType, generateMipmaps: false })
        const cube = new THREE.CubeCamera(0.05, 120, target)
        cube.position.copy(at)
        cube.updateMatrixWorld(true)
        // a room far from the visitor is hidden; show it (and only the way to it) for its capture
        const hidden = []
        for (let o = group.current; o; o = o.parent) if (!o.visible) { hidden.push(o); o.visible = true }
        const previous = gl.getRenderTarget()
        cube.update(gl, scene)
        gl.setRenderTarget(previous)
        hidden.forEach((o) => { o.visible = false })
        const next = pmrem.fromCubemap(target.texture).texture
        target.dispose()
        pmrem.dispose()
        // Same-sized probes share a shader, so swapping one for the next never recompiles.
        Object.values(materials).forEach((m) => {
          if (!m.isMeshStandardMaterial) return
          const first = !m.envMap
          m.envMap = next
          if (first) m.needsUpdate = true
        })
        env.current?.dispose()
        env.current = next
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [gl, scene, materials, placementKey])

  return <group ref={group}>{node && <primitive object={node} />}</group>
}

useLoader.preload(GLTFLoader, ROOMS_URL)
