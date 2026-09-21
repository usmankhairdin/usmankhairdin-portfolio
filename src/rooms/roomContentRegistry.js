/* The room content surfaces that are currently installed on the room wall, with the real
   world-space extent of each one. RoomContentSurface keeps these up to date; the shared
   containment system in RoomApertureClip reads them.

   It exists because the content is DOM projected by CSS 3D, and CSS 3D has no near plane:
   a plane is only projected correctly while every one of its corners is in front of the
   eye. The containment system already owns the question "what of this wall can be seen",
   so it is also the right place to answer "and can it be drawn at all". */
/* An empty path: the surface is there, but none of it can be seen. One definition, used
   both by the containment system and by a surface hiding itself before its first paint. */
export const HIDDEN_CLIP = 'path("M0 0Z")'

let surfaces = []

export function registerContentSurface(surface) {
  surfaces = surfaces.concat(surface)
  return () => { surfaces = surfaces.filter((s) => s !== surface) }
}

export const getContentSurfaces = () => surfaces
