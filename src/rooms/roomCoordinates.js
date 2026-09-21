// The approved Services room is the single physical room, but it is authored in a
// ROOM-LOCAL frame instead of one fixed world location. The frame origin sits on the
// corridor centre line at the active door's z, with +x running into the room, so the
// same room can be placed behind whichever door the visitor selected. Left-hand doors
// receive the same frame rotated by PI, which mirrors it without mirroring its content.
export const ROOM_STAGE_Z = 0
export const ROOM_CAMERA_X = 7.02   // where the camera settles inside the room
export const ROOM_FRONT_X = 11.17   // the wall the room's content is installed on

// The corridor's own side wall, stated once here so the corridor and the room cannot
// drift apart. The wall is a slab centred on |x| = CORRIDOR_WALL_X, so its corridor face
// is at CORRIDOR_FACE_X and its room-side face at ROOM_BACK_X.
//
// ROOM_BACK_X is the room's hard limit: no part of the room shell may reach past it.
// The shell used to be modelled from x = 3.4, which put its floor, ceiling and both side
// walls INSIDE the corridor wall slab and 0.01 beyond its corridor face - so the room's
// dark floor showed as a sliver along the base of the corridor wall, and each side wall
// left a full-height band of z-fighting on the corridor's own plaster. Because the room
// keeps its placement after it is left, that band stayed at whichever door was used last.
export const CORRIDOR_WALL_X = 3.5
export const CORRIDOR_WALL_THICKNESS = .18
export const CORRIDOR_FACE_X = CORRIDOR_WALL_X - CORRIDOR_WALL_THICKNESS / 2
export const ROOM_BACK_X = CORRIDOR_WALL_X + CORRIDOR_WALL_THICKNESS / 2

// The room shell's own extent, derived rather than written twice.
export const ROOM_SHELL_FRONT_X = 11.4
export const ROOM_SHELL_DEPTH = ROOM_SHELL_FRONT_X - ROOM_BACK_X
export const ROOM_SHELL_MID_X = (ROOM_BACK_X + ROOM_SHELL_FRONT_X) / 2
export const ROOM_SKIRTING_FRONT_X = 11.3
export const ROOM_SKIRTING_DEPTH = ROOM_SKIRTING_FRONT_X - ROOM_BACK_X
export const ROOM_SKIRTING_MID_X = (ROOM_BACK_X + ROOM_SKIRTING_FRONT_X) / 2

// Where the shared room stands for a given corridor door.
export const roomPlacement = (spec) => ({
  position: [0, 0, spec?.z ?? 0],
  rotation: [0, spec?.side === 'right' ? 0 : Math.PI, 0],
})

// The clear doorway opening, expressed in the door's own local frame (the frame
// DoorPortal builds its jambs, head and threshold in). These are the numbers the
// door geometry itself is made from, so the opening can never drift from the model:
//   jambs     at x = +-0.98, 0.24 wide  -> clear width 1.72
//   head      at y = 1.45 + 1.52, 0.24  -> soffit at 2.85
//   threshold at y = 1.45 - 1.53, 0.11  -> sill at -0.025
//   reveal    centred on z = -0.07, 0.58 deep -> faces at +0.22 and -0.36
// Local +z points back into the corridor for both sides of the corridor.
export const doorOpening = Object.freeze({
  halfWidth: 0.86,
  sillY: -0.025,
  soffitY: 2.85,
  corridorZ: 0.22,
  roomZ: -0.36,
})

// The room's content wall, expressed in the same door-local frame as doorOpening
// (room-local X = 3.5 - doorLocalZ). It is the reference point the containment system
// tests the door leaf against, and because it is door-local it mirrors with the door.
export const contentWallZ = CORRIDOR_WALL_X - ROOM_FRONT_X

// The visible door is a solid box. The containment system consumes the same dimensions
// as DoorPortal so its opaque silhouette cannot drift from the mesh it is masking.
export const doorLeafBox = Object.freeze({
  width: doorSystem.leaf.width,
  height: doorSystem.leaf.height,
  depth: doorSystem.leaf.depth,
})
import { doorSystem } from '../experience/doorSystem.js'
