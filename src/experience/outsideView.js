import * as THREE from 'three'
import { END_Z, START_Z } from './corridorLayout.js'
import { isOutside, locate } from './walkable.js'

/*
 * Can the visitor see out - the night sky and the city below? From the terrace, yes, and from
 * the Contact hall through its glass wall. From the corridor only through its two ends: the
 * entrance doorway and the Contact door. The side rooms have no window. Whatever cannot be
 * seen is not drawn at all.
 */
const PORTALS = [START_Z, END_Z].map((z) => new THREE.Box3(new THREE.Vector3(-1.2, -0.1, z - 0.4), new THREE.Vector3(1.2, 3.3, z + 0.4)))
const frustum = new THREE.Frustum()
const viewProjection = new THREE.Matrix4()

export function outsideSeen(camera) {
  const { x, z } = camera.position
  if (isOutside(z, x)) return true
  const room = locate(x, z)
  if (room) return room.id === 'contact'
  camera.updateMatrixWorld()
  frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))
  return PORTALS.some((box) => frustum.intersectsBox(box))
}
