import { Suspense } from 'react'
import SharedRoomEnvironment from './SharedRoomEnvironment.jsx'
import RoomExhibits from './RoomExhibits.jsx'
import { ROOM_KIND } from './referenceRooms.js'

/* The room behind the active door, with this portfolio's content set into its architecture. */
export default function RoomShell({ spec }) {
  return <SharedRoomEnvironment spec={spec}>
    <Suspense fallback={null}><RoomExhibits key={spec.id} kind={ROOM_KIND[spec.id]} /></Suspense>
  </SharedRoomEnvironment>
}
