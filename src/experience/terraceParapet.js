import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TERRACE, TERRACE_PARAPET as P, terraceParapetRuns } from './corridorLayout.js'

/** A continuous masonry base with coping and a short, physically supported bronze handrail. */
export function createTerraceParapetGeometry(floorY, box = (w, h, d) => new THREE.BoxGeometry(w, h, d)) {
  const along = (run, width, height, y) => box(run.length, height, width)
    .rotateY(run.rotation).translate(run.x, y, run.z)
  const wall = mergeGeometries(terraceParapetRuns(P.thickness)
    .map(run => along(run, P.thickness, P.wallHeight, floorY + P.wallHeight / 2)))
  const copingTop = P.wallHeight + P.copingHeight
  const coping = mergeGeometries(terraceParapetRuns(P.copingWidth)
    .map(run => along(run, P.copingWidth, P.copingHeight, floorY + P.wallHeight + P.copingHeight / 2)))
  const railCentre = P.height - P.railHeight / 2
  const metalParts = terraceParapetRuns(P.railDepth)
    .map(run => along(run, P.railDepth, P.railHeight, floorY + railCentre))
  // Each upright is seated into the coping and reaches the underside of the handrail.
  const postBottom = copingTop - .02
  const postHeight = railCentre - postBottom
  const x = TERRACE.half - P.inset
  const front = TERRACE.edgeZ - P.inset, back = TERRACE.backZ + P.inset
  const post = (px, pz) => metalParts.push(box(P.postWidth, postHeight, P.postWidth)
    .translate(px, floorY + postBottom + postHeight / 2, pz))
  const across = Math.ceil(2 * x / P.postSpacing)
  const depth = Math.ceil((front - back) / P.postSpacing)
  for (let i = 0; i <= across; i++) {
    const px = -x + 2 * x * i / across
    post(px, front); post(px, back)
  }
  // Corner posts were included above; side interiors complete the supported loop.
  for (let i = 1; i < depth; i++) {
    const pz = back + (front - back) * i / depth
    post(-x, pz); post(x, pz)
  }
  return { wall, coping, metal: mergeGeometries(metalParts) }
}
