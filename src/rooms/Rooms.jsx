import { useRef } from 'react'
import { useJourney } from '../experience/JourneyContext.jsx'
import { doors } from '../data/projects.js'
import RoomShell from './RoomShell.jsx'
import RoomApertureClip from './RoomApertureClip.jsx'

// One physical room instance: every door supplies its content to the same stage, and
// the stage itself stands behind whichever door is active.
//
// The placement holds after a room is left, until another door is actually chosen. The
// visitor is still in front of the doorway they just came out of while its leaf closes,
// so moving the room away at that moment would empty the opening in plain sight; by the
// time a new door becomes active the camera is at that new door and the old leaf is shut.
export default function Rooms() {
  const { activeDoor } = useJourney()
  const placed = useRef('services')
  if (activeDoor) placed.current = activeDoor
  const spec = doors.find((door) => door.id === (activeDoor || placed.current))
  return <>
    <RoomShell spec={spec} />
    <RoomApertureClip />
  </>
}
