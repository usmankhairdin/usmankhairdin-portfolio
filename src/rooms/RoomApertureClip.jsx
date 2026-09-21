import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourney } from '../experience/JourneyContext.jsx'
import { getDoorParts } from '../experience/doorRegistry.js'
import { contentWallZ, doorLeafBox, doorOpening } from './roomCoordinates.js'
import { APERTURE_LAYER_CLASS } from './RoomContentSurface.jsx'
import { getContentSurfaces, HIDDEN_CLIP } from './roomContentRegistry.js'

/* Room content is real DOM. Drei's <Html transform> projects it with the scene camera,
   but DOM never takes part in the WebGL depth buffer, so a solid corridor wall cannot
   occlude it: a heading installed on the room's far wall reads as if it were painted onto
   the plaster, and onto the door leaf, sliding along them as the camera moves.

   So the room's content wall is clipped to the part of it that the solid things in front
   actually leave visible. The whole calculation happens in 3D, on the content wall's own
   plane, against half spaces that all pass through the eye:

     - the four edges of the doorway, while the visitor is still on the corridor side of
       the wall - this is the sightline down the opening;
     - the door leaf's free edge, for as long as the leaf stands between eye and content,
       which outlasts the doorway by the width of its own swing.

   Clipping a convex polygon by half spaces keeps it convex and planar, so the result
   projects to one simple screen polygon. That matters: the earlier version composed an
   aperture ring and a leaf ring with the even-odd fill rule, which fails silently once the
   camera is close enough to the doorway that a projected corner crosses the eye plane. The
   ring stops being convex, the leaf ring is no longer strictly inside it, and even-odd
   then turns the overlap back ON - painting the heading across the door leaf at exactly
   the moment the visitor is closest to it.

   The result is one shared calculation per frame, applied to every room DOM layer there
   is. Clipping the wrapper clips hit testing with it, so pointer interaction survives
   exactly where the room is genuinely exposed. */

/* The clip is written straight onto the wrapper elements drei creates for the room's DOM
   layers, not published as a custom property for a stylesheet rule to pick up. One shared
   calculation still serves every layer - there are only ever one or two - but the result
   no longer depends on a rule living in the global stylesheet, which this project edits
   from more than one place. Drei only ever writes width/height/zIndex/perspective/transform
   on this element, so an inline clip-path here is safe and cannot be clobbered. */
const LAYER_CLASS = APERTURE_LAYER_CLASS
const NONE = 'none'
let layers = null
const HIDDEN = HIDDEN_CLIP
const EPS = 1e-4
// Below this, the plane through the eye and an edge is degenerate - the eye is sitting on
// the edge itself, where that edge cannot divide the view into a covered and a clear side.
const PLANE_EPS = 1e-9

const v4 = new THREE.Vector4()
const localCam = new THREE.Vector3()
const eye = new THREE.Vector3()
const edgeA = new THREE.Vector3()
const edgeB = new THREE.Vector3()
const marker = new THREE.Vector3()
const normal = new THREE.Vector3()
const arm = new THREE.Vector3()
const cornerPoint = new THREE.Vector3()

/* Room content is DOM, projected by CSS 3D. CSS 3D has no near plane: the browser maps a
   plane's corners straight through the perspective divide, so the instant ONE corner
   reaches the eye plane the whole quad's projection inverts and runs away to infinity -
   the element's box grows from its true 820px to over a million, and what it paints is
   nonsense. If anything of the aperture is open at that moment the nonsense is what fills
   it, which is the single pale frame with the ragged edge seen on the way out of a room.
   In between, on the approach and the retreat, it is a plane that stretches against the
   wall it is painted on instead of sitting still on it.

   A plane with a corner at or behind the eye cannot be drawn, so the honest answer is
   that none of it is visible - and geometrically that is also the true answer, because a
   corner only reaches the eye once the visitor has turned away from that wall and the
   doorway has closed to nothing. This is a validity test on the projection, evaluated
   from the live geometry every frame; it is not a timed or phase-based hide. */
function contentProjectable(surface, camera) {
  const { object, corners } = surface
  if (!object || corners.length !== 4) return false
  object.updateWorldMatrix(true, false)
  for (let c = 0; c < corners.length; c++) {
    cornerPoint
      .set(corners[c].x, corners[c].y, 0)
      .applyMatrix4(object.matrixWorld)
      .applyMatrix4(camera.matrixWorldInverse)
    if (-cornerPoint.z <= camera.near) return false
  }
  return true
}

const openingQuad = (z) => [
  [-doorOpening.halfWidth, doorOpening.sillY, z],
  [doorOpening.halfWidth, doorOpening.sillY, z],
  [doorOpening.halfWidth, doorOpening.soffitY, z],
  [-doorOpening.halfWidth, doorOpening.soffitY, z],
]

const ROOM_FACE = openingQuad(doorOpening.roomZ)
const CORRIDOR_FACE = openingQuad(doorOpening.corridorZ)
const OPENING_CENTRE = [0, doorOpening.soffitY / 2, doorOpening.roomZ]

/* The room's content wall, deliberately larger than anything installed on it: it is the
   surface being clipped, so its own edges must never become the visible boundary. */
const CONTENT_QUAD = [
  [-8, -2, contentWallZ],
  [8, -2, contentWallZ],
  [8, 6, contentWallZ],
  [-8, 6, contentWallZ],
]

// All eight vertices of the actual opaque leaf box, in the pivot's local frame.
const LEAF_CORNERS = [0, doorLeafBox.width].flatMap((x) =>
  [0, doorLeafBox.height].flatMap((y) =>
    [-doorLeafBox.depth / 2, doorLeafBox.depth / 2].map((z) => [x, y, z])))

const toWorld = (object, p, target) => target.set(p[0], p[1], p[2]).applyMatrix4(object.matrixWorld)

function convexHull(points) {
  if (points.length < 3) return []
  const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const half = (values) => {
    const out = []
    for (const point of values) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], point) <= 0) out.pop()
      out.push(point)
    }
    return out
  }
  const lower = half(sorted)
  const upper = half(sorted.slice().reverse())
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

/* Cast the complete solid leaf onto the content wall from the live eye position. A
   zero-thickness mid-plane misses the visible side faces at grazing angles; projecting
   the box vertices and taking their convex hull is the exact silhouette of this convex
   solid. Vertices only contribute when the leaf lies between eye and wall. */
function leafShadowOnWall(pivot, door, camera) {
  const eyeLocal = door.worldToLocal(camera.position.clone())
  const projected = []
  for (const source of LEAF_CORNERS) {
    const point = toWorld(pivot, source, new THREE.Vector3())
    door.worldToLocal(point)
    const dz = point.z - eyeLocal.z
    if (Math.abs(dz) < PLANE_EPS) continue
    const t = (contentWallZ - eyeLocal.z) / dz
    if (t < 1) continue
    projected.push(new THREE.Vector3(
      eyeLocal.x + (point.x - eyeLocal.x) * t,
      eyeLocal.y + (point.y - eyeLocal.y) * t,
      contentWallZ,
    ))
  }
  return convexHull(projected).map((point) => door.localToWorld(point))
}

/* Clip a convex polygon by the plane through the eye and the edge a-b. `marker` names a
   point on one side of that plane; `keepMarkerSide` says whether to keep that side or
   drop it. Half-space clipping keeps the polygon convex and planar. */
function clipByEyePlane(poly, a, b, markerPoint, keepMarkerSide) {
  edgeA.copy(a).sub(eye)
  edgeB.copy(b).sub(eye)
  normal.copy(edgeA).cross(edgeB)
  if (normal.lengthSq() < PLANE_EPS) return poly
  const side = normal.dot(arm.copy(markerPoint).sub(eye))
  if (Math.abs(side) < PLANE_EPS) return poly
  if ((side < 0) === keepMarkerSide) normal.negate()

  const nx = normal.x, ny = normal.y, nz = normal.z
  const d = nx * eye.x + ny * eye.y + nz * eye.z
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const dp = nx * p.x + ny * p.y + nz * p.z - d
    const dq = nx * q.x + ny * q.y + nz * q.z - d
    if (dp >= 0) out.push(p)
    if ((dp < 0) !== (dq < 0)) {
      out.push(new THREE.Vector3().copy(p).lerp(q, dp / (dp - dq)))
    }
  }
  return out
}

/* Project a 3D convex polygon into canvas pixels, cut against the eye plane first so a
   vertex behind the camera cannot invert the shape. */
function project(poly, camera, width, height) {
  const clip = poly.map((p) => {
    v4.set(p.x, p.y, p.z, 1)
      .applyMatrix4(camera.matrixWorldInverse)
      .applyMatrix4(camera.projectionMatrix)
    return { x: v4.x, y: v4.y, w: v4.w }
  })

  const front = []
  for (let i = 0; i < clip.length; i++) {
    const a = clip[i]
    const b = clip[(i + 1) % clip.length]
    if (a.w > EPS) front.push(a)
    if ((a.w > EPS) !== (b.w > EPS)) {
      const t = (EPS - a.w) / (b.w - a.w)
      front.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: EPS })
    }
  }

  const halfW = width / 2
  const halfH = height / 2
  return front.map((p) => ({ x: (p.x / p.w) * halfW + halfW, y: -(p.y / p.w) * halfH + halfH }))
}

/* Keep the emitted path finite when the clipped wall projects past the viewport. The box
   is a generous frame around the canvas, so it never trims anything that could be seen. */
function clampToView(poly, w, h) {
  const tests = [
    (p) => p.x + w, (p) => 2 * w - p.x, (p) => p.y + h, (p) => 2 * h - p.y,
  ]
  let current = poly
  for (const inside of tests) {
    const next = []
    for (let i = 0; i < current.length; i++) {
      const p = current[i]
      const q = current[(i + 1) % current.length]
      const dp = inside(p)
      const dq = inside(q)
      if (dp >= 0) next.push(p)
      if ((dp < 0) !== (dq < 0)) {
        const t = dp / (dp - dq)
        next.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
      }
    }
    current = next
    if (!current.length) return current
  }
  return current
}

const toPath = (poly) => poly.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') + 'Z'

export default function RoomApertureClip() {
  const { camera, size } = useThree()
  const { activeDoor } = useJourney()

  useEffect(() => () => {
    const nodes = document.getElementsByClassName(LAYER_CLASS)
    for (let i = 0; i < nodes.length; i++) nodes[i].style.clipPath = NONE
  }, [])

  useFrame(() => {
    // A live HTMLCollection, so layers mounting and unmounting need no bookkeeping.
    if (!layers) layers = document.getElementsByClassName(LAYER_CLASS)
    const applyAll = (value) => {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].style.clipPath !== value) layers[i].style.clipPath = value
      }
    }
    const apply = (value) => {
      const surfaces = getContentSurfaces()
      const assigned = new Set()
      for (const surface of surfaces) {
        const layer = surface.layer
        if (!layer) continue
        assigned.add(layer)
        const next = contentProjectable(surface, camera) ? value : HIDDEN
        if (layer.style.clipPath !== next) layer.style.clipPath = next
      }
      // A newly mounted wrapper remains closed until its own measured surface registers.
      for (let i = 0; i < layers.length; i++) {
        if (!assigned.has(layers[i]) && layers[i].style.clipPath !== HIDDEN) layers[i].style.clipPath = HIDDEN
      }
    }

    // A door is active from the moment it is chosen until the visitor is back in the
    // corridor, which is exactly the span in which room content can be on screen.
    // Everything below reads the camera's own matrices, so make them current first
    // rather than inheriting whatever the last render left behind.
    camera.updateMatrixWorld()

    const parts = getDoorParts(activeDoor)
    const door = parts?.root?.current
    if (!door) { applyAll(NONE); return }

    door.updateWorldMatrix(true, false)
    localCam.copy(camera.position)
    door.worldToLocal(localCam)

    // The wall hides everything outside the doorway, but only until the threshold is
    // crossed; after that the wall is behind the eye and cannot occlude the far wall.
    const wallOccludes = localCam.z > doorOpening.roomZ

    const pivot = parts?.pivot?.current
    if (pivot) pivot.updateWorldMatrix(true, false)
    const leafShadow = pivot ? leafShadowOnWall(pivot, door, camera) : []
    const leafOccludes = leafShadow.length >= 3

    if (!wallOccludes && !leafOccludes) { apply(NONE); return }

    eye.copy(camera.position)
    let poly = CONTENT_QUAD.map((p) => toWorld(door, p, new THREE.Vector3()))

    if (wallOccludes) {
      // The sightline down the opening: both faces of the reveal narrow it, and what they
      // leave in common is the tunnel the room can actually be seen through.
      toWorld(door, OPENING_CENTRE, marker)
      const centre = marker.clone()
      for (const face of [ROOM_FACE, CORRIDOR_FACE]) {
        for (let i = 0; i < face.length && poly.length; i++) {
          const a = toWorld(door, face[i], new THREE.Vector3())
          const b = toWorld(door, face[(i + 1) % face.length], new THREE.Vector3())
          poly = clipByEyePlane(poly, a, b, centre, true)
        }
      }
    }

    // What the leaf hides is the shadow its solid box throws from the eye - the intersection of
    // the four half spaces through the eye and its edges. What stays visible is therefore
    // the content MINUS that intersection, which is the union of the four pieces that each
    // fall outside one edge. Each piece is a convex clip of the same polygon, so they all
    // keep its winding and can be drawn as one non-zero path: a union, never a hole. One
    // free edge alone is not enough - it bounds the leaf on a single side, and on the way
    // out the camera sees past it, which is what let the heading paint over the door.
    let pieces = poly.length ? [poly] : []
    if (leafOccludes && poly.length) {
      const body = leafShadow.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / leafShadow.length)
      pieces = []
      for (let i = 0; i < leafShadow.length; i++) {
        const piece = clipByEyePlane(poly, leafShadow[i], leafShadow[(i + 1) % leafShadow.length], body, false)
        if (piece.length >= 3) pieces.push(piece)
      }
    }

    if (!pieces.length) { apply(HIDDEN); return }

    const { width, height } = size
    const rings = []
    for (const piece of pieces) {
      const screen = clampToView(project(piece, camera, width, height), width, height)
      if (screen.length >= 3) rings.push(toPath(screen))
    }
    if (!rings.length) { apply(HIDDEN); return }
    apply(`path("${rings.join('')}")`)
  })

  return null
}
