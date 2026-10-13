import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { doors } from '../data/projects.js'
import RoomShell from './RoomShell.jsx'

// Every room stands behind its own door, all the time - one building, walked into through
// glass. A room is only drawn while the visitor is inside it or near enough to its door to
// see in, so four rooms cost about what one does.
const SEE_IN = 24          // metres along the corridor from which a room shows through its door

function PlacedRoom({ spec }) {
  const group = useRef()
  // the widest room reaches 12 m either side of its door, so this also covers being inside
  useFrame(({ camera }) => {
    if (group.current) group.current.visible = Math.abs(camera.position.z - spec.z) < SEE_IN
  })
  return <group ref={group}>
    <RoomShell spec={spec} />
  </group>
}

export default function Rooms() {
  return <>{doors.map((spec) => <PlacedRoom key={spec.id} spec={spec} />)}</>
}
