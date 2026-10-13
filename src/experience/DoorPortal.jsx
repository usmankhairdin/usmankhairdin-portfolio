import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DoorAssembly from './DoorAssembly.jsx'
import { doorOpen } from './doorStates.js'

// A door on the left of the corridor is the right-hand door turned through PI about the
// corridor's centre line - the same turn the room behind it uses. The end wall's door faces
// straight back down the corridor.
//
// The door is automatic: it parts as the visitor walks up to it (see doorStates.js), so
// there is nothing to click. On a phone, where the building is not walked, tapping the door
// opens its page instead.
export default function DoorPortal({ spec, mats }) {
  const end = spec.side === 'end'
  const side = spec.side === 'right' ? 1 : -1
  const navigate = useNavigate()
  const open = useCallback(() => doorOpen(spec.id), [spec.id])

  const tap = () => {
    if (window.matchMedia?.('(max-width: 650px), (pointer: coarse)').matches) navigate(spec.route)
  }

  return <group
    position={end ? [0, 0, spec.z] : [side * 3.5, 0, spec.z]}
    rotation={[0, end ? 0 : side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}
    onClick={tap}
  >
    <DoorAssembly mats={mats} open={open} label={spec.label} backLabel="CORRIDOR" />
    <pointLight position={[0, 2.5, 0.82]} intensity={0.6} distance={3.8} decay={2.0} color="#e5cda9" />
  </group>
}
