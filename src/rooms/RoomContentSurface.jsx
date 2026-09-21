import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { ROOM_FRONT_X, ROOM_STAGE_Z } from './roomCoordinates.js'
import { HIDDEN_CLIP, registerContentSurface } from './roomContentRegistry.js'
import { useJourney } from '../experience/JourneyContext.jsx'

/* THE room content anchor. Every room - About, Services, Work, For agencies, Contact -
   mounts its content through this one component, so there is exactly one definition of
   where room content lives and how it is registered to the architecture.

   The anchor is a real object in the scene, standing on the room's own front wall in the
   room's local frame: x = ROOM_FRONT_X (the wall), z = ROOM_STAGE_Z (its centre line),
   turned to face back down the room. Because it is room-local it rides inside the room's
   placement group, so it mirrors with a left-hand door exactly as the wall does. Nothing
   here depends on which door is active, on the camera, or on the transition phase: the
   only per-room freedom is the height on the wall and the content itself.

   That is what makes the content and the wall one rigid assembly. The DOM is positioned
   from this anchor's world matrix alone, so the content's transform relative to the wall
   is constant by construction - the same matrix every frame of every journey - and only
   the camera half of the projection changes as the visitor moves. */
export const CONTENT_SURFACE_SCALE = 2.28
export const CONTENT_SURFACE_ROTATION = [0, -Math.PI / 2, 0]
export const CONTENT_ANCHOR_NAME = 'room-content-anchor'

/* drei writes the DOM at 1 world unit per (400 / distanceFactor) CSS pixels. Knowing that
   lets the surface state its real extent on the wall in metres, which is what the
   containment system needs to know whether the browser can project it at all. */
export const WORLD_UNIT_PX = 400 / CONTENT_SURFACE_SCALE

/* `room-aperture-layer` hands the wrapper to the shared containment system in
   RoomApertureClip, which is what stops DOM the depth buffer cannot reach from showing
   through solid corridor architecture. The class is a handle for that component alone -
   the clip is written onto these elements directly, never through a global stylesheet. */
export const APERTURE_LAYER_CLASS = 'room-aperture-layer'

export default function RoomContentSurface({ spec, y = 1.77, children, className = '', flat = false }) {
  const { activeDoor, phase } = useJourney()
  const anchor = useRef()
  const content = useRef()
  const surface = useRef({ object: null, layer: null, corners: [] })
  const installed = activeDoor === spec.id && phase !== 'corridor'

  useLayoutEffect(() => {
    if (!installed) return undefined
    return registerContentSurface(surface.current)
  }, [installed])

  /* A surface is born unpositioned. drei creates the wrapper and portals the content into
     it during the commit, but it only writes the CSS 3D matrix on the next animation
     frame - and the browser paints in between. For that one frame the content is drawn
     with no transform at all: at its own CSS size, in the top-left of a wrapper that
     covers the canvas. That is the full-screen pale frame with the ragged row of blocks
     along its edge, and it is a paint of something that has not been placed yet.

     This runs in the same commit, before that paint, and closes the surface until the
     containment system opens it again on the next frame from real geometry. */
  useLayoutEffect(() => {
    const nodes = document.getElementsByClassName(APERTURE_LAYER_CLASS)
    for (let i = 0; i < nodes.length; i++) {
      const placed = nodes[i].firstElementChild?.firstElementChild
      if (!placed || !placed.style.transform) nodes[i].style.clipPath = HIDDEN_CLIP
    }
  })

  // Report the four real painted corners, including the element's authored CSS transform.
  // offsetWidth/offsetHeight alone describe the pre-transform layout box; About and
  // Services deliberately translate that box, so centred half-extents clip the wrong
  // piece of wall precisely while the camera is grazing the doorway.
  useFrame(() => {
    const el = content.current
    const object = anchor.current
    if (!installed || !el || !object) {
      surface.current.object = null
      surface.current.layer = null
      surface.current.corners = []
      return
    }
    const width = el.offsetWidth
    const height = el.offsetHeight
    const style = getComputedStyle(el)
    const matrix = style.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(style.transform)
    const origin = style.transformOrigin.split(' ').map(Number.parseFloat)
    const originX = Number.isFinite(origin[0]) ? origin[0] : width / 2
    const originY = Number.isFinite(origin[1]) ? origin[1] : height / 2
    const corners = [[0, 0], [width, 0], [width, height], [0, height]].map(([x, y]) => {
      const point = new DOMPoint(x - originX, y - originY).matrixTransform(matrix)
      return {
        x: (point.x + originX - width / 2) / WORLD_UNIT_PX,
        y: -(point.y + originY - height / 2) / WORLD_UNIT_PX,
      }
    })
    surface.current.object = object
    surface.current.layer = el.closest(`.${APERTURE_LAYER_CLASS}`)
    surface.current.corners = corners
  })

  if (!installed) return null
  return <group
    ref={anchor}
    name={CONTENT_ANCHOR_NAME}
    position={[ROOM_FRONT_X, y, ROOM_STAGE_Z]}
    rotation={CONTENT_SURFACE_ROTATION}
  >
    <Html
      center
      transform={!flat}
      distanceFactor={CONTENT_SURFACE_SCALE}
      wrapperClass={APERTURE_LAYER_CLASS}
      style={{ pointerEvents: 'auto' }}
    >
      <div ref={content} className={`room-flat-html ${className}`}>{children}</div>
    </Html>
  </group>
}
