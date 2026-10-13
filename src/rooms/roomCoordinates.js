// Each room is authored in a ROOM-LOCAL frame: the origin sits on the corridor centre line at
// its door's z, with +x running into the room. Left-hand doors receive the same frame rotated
// by PI, which mirrors it without mirroring its content.

// The corridor's own side wall, stated once here so the corridor and the room cannot
// drift apart. The wall is a slab centred on |x| = CORRIDOR_WALL_X; its room-side face is at
// ROOM_BACK_X, the room's hard limit: no part of the room shell may reach past it, or the
// room's floor and walls would show through the corridor's own plaster.
export const CORRIDOR_WALL_X = 3.5
export const CORRIDOR_WALL_THICKNESS = .18
export const ROOM_BACK_X = CORRIDOR_WALL_X + CORRIDOR_WALL_THICKNESS / 2

// Where a door's room stands: right-hand rooms as authored, left-hand rooms turned by PI, and
// the end wall's room (the Contact hall) turned by PI/2 so it lies straight ahead.
export const roomPlacement = (spec) => (spec?.side === 'end'
  ? { position: [0, 0, (spec?.z ?? 0) + 3.5], rotation: [0, Math.PI / 2, 0] }
  : { position: [0, 0, spec?.z ?? 0], rotation: [0, spec?.side === 'right' ? 0 : Math.PI, 0] })
