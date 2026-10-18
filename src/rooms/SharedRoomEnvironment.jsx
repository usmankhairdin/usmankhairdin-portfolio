import { Suspense } from 'react'
import { roomPlacement } from './roomCoordinates.js'
import ReferenceRoom from './ReferenceRoom.jsx'
import { ROOM_KIND } from './referenceRooms.js'

// The room behind each door is one of the big rooms of the Shahz Connect world (used with the
// owner's permission; see referenceRooms.js), lit by its own baked light and finished in the
// corridor's palette. Its exhibits (children) ride inside it.
//
// The room is authored once in its own frame and then placed behind the door the visitor
// selected, so it genuinely stands on the other side of every doorway. Doors on the left of
// the corridor receive the identical room rotated by PI, which mirrors the architecture
// without mirroring anything inside it. Its door wall stands 1 cm inside ROOM_BACK_X, the
// room-side face of the corridor wall, so no part of the room occupies or crosses that wall.
export default function SharedRoomEnvironment({ spec, children }) {
  const placement = roomPlacement(spec)
  return <group position={placement.position} rotation={placement.rotation} userData={{websiteOcclusionScope:true}}>
    <Suspense fallback={null}><ReferenceRoom kind={ROOM_KIND[spec.id] || 'services'} placementKey={spec.id} /></Suspense>
    {children}
  </group>
}
