import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSurface } from '../experience/surfaces.js'
import { PictureLight } from '../experience/GalleryFabrication.jsx'
import useReducedMotion from '../experience/useReducedMotion.js'
import {
  ROOM_SHELL_DEPTH,
  ROOM_SHELL_MID_X,
  ROOM_SKIRTING_DEPTH,
  ROOM_SKIRTING_MID_X,
  ROOM_STAGE_Z,
  roomPlacement,
} from './roomCoordinates.js'

// Ceiling pans and front fills. Their `distance` is deliberately short enough that the
// falloff reaches zero before the corridor wall at room-local x = 3.5: point lights are
// not occluded by geometry, so anything longer would spill into the corridor.
//
// The shell itself stops at ROOM_BACK_X, the room-side face of that corridor wall, so the
// corridor wall IS the room's fourth wall and no part of the room occupies or crosses it.
const ROOM_FIXTURE_INTENSITY = [2.30, 1.90, 4.6, 4.6]
const OFF = [0, 0, 0, 0]

// Services-derived physical room. Page content and right-side art are slots;
// no corridor door metadata or page identity can alter this environment.
//
// The room is authored once in its own frame and then placed behind the door the
// visitor selected, so the same physical room genuinely stands on the other side of
// every doorway. Doors on the left of the corridor receive the identical room rotated
// by PI, which mirrors the architecture without mirroring anything inside it.
//
// Every light in here is an interior fixture whose reach stops inside the room, so the
// room can be lit and unlit without the corridor outside it changing by a single shade.
// (It used to carry its own ambient/hemisphere/directional rig that was cross-faded
// against the corridor's. Because this group is rotated by PI for a left-hand door, that
// handed the corridor a mirrored key light and swung its shading across on every click.)
export default function SharedRoomEnvironment({ spec, active, content, visual, showPictureLight = true }) {
  const placement = roomPlacement(spec)
  const reducedMotion = useReducedMotion()

  const wall = useSurface('plaster', 3.2, 3.2, 65)
  const floor = useSurface('wood', 3.4, 2.5, 75)
  const rug = useSurface('carpet', 2, 3, 85)
  const ceiling = useSurface('plaster', 3, 3, 95)
  const ceilingLightA = useRef()
  const ceilingLightB = useRef()
  const frontFillA = useRef()
  const frontFillB = useRef()

  useFrame((_, dt) => {
    const duration = reducedMotion ? 1000 : (active ? 3.8 : 5.2)
    const targets = active ? ROOM_FIXTURE_INTENSITY : OFF
    ;[ceilingLightA.current, ceilingLightB.current, frontFillA.current, frontFillB.current].forEach((light, i) => {
      if (!light) return
      light.intensity = reducedMotion ? targets[i] : THREE.MathUtils.damp(light.intensity, targets[i], duration, Math.min(dt, .05))
    })
  })

  return <group position={placement.position} rotation={placement.rotation}>
    <group position={[0, 0, ROOM_STAGE_Z]}>
    <mesh position={[ROOM_SHELL_MID_X, -.075, 0]}>
      <boxGeometry args={[ROOM_SHELL_DEPTH, .15, 8.4]} />
      <meshStandardMaterial map={floor} color="#8c725b" roughness={.70} bumpMap={floor} bumpScale={.010} />
    </mesh>
    <mesh position={[7.4, .012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.8, 2.95]} />
      <meshStandardMaterial map={rug} color="#8d8175" roughness={1} />
    </mesh>
    <mesh position={[ROOM_SHELL_MID_X, 3.62, 0]}>
      <boxGeometry args={[ROOM_SHELL_DEPTH, .16, 8.4]} />
      <meshStandardMaterial map={ceiling} color="#f3ece0" roughness={.94} bumpMap={ceiling} bumpScale={.004} />
    </mesh>

    <mesh position={[11.38, 1.8, 0]}>
      <boxGeometry args={[.18, 3.6, 8.4]} />
      <meshStandardMaterial map={wall} color="#f6efe4" roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>
    <mesh position={[ROOM_SHELL_MID_X, 1.8, -4.12]}>
      <boxGeometry args={[ROOM_SHELL_DEPTH, 3.6, .18]} />
      <meshStandardMaterial map={wall} color="#eee6d9" roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>
    <mesh position={[ROOM_SHELL_MID_X, 1.8, 4.12]}>
      <boxGeometry args={[ROOM_SHELL_DEPTH, 3.6, .18]} />
      <meshStandardMaterial map={wall} color="#eee6d9" roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>

    <mesh position={[11.27, .39, 0]}><boxGeometry args={[.10, .12, 8.18]} /><meshStandardMaterial color="#c9bdae" roughness={.68} /></mesh>
    <mesh position={[11.27, 3.22, 0]}><boxGeometry args={[.08, .09, 8.18]} /><meshStandardMaterial color="#c9bdae" roughness={.68} /></mesh>
    {[-4.02, 4.02].map((z) => <mesh key={z} position={[ROOM_SKIRTING_MID_X, .39, z]}><boxGeometry args={[ROOM_SKIRTING_DEPTH, .12, .10]} /><meshStandardMaterial color="#c9bdae" roughness={.68} /></mesh>)}

    {[-1.65, 1.65].map((z, i) => <group key={z}>
      <mesh position={[8.15, 3.505, z]}>
        <boxGeometry args={[1.65, .035, .34]} />
        <meshStandardMaterial color="#f0e6d4" emissive="#ffe8bf" emissiveIntensity={1.15} roughness={.52} />
      </mesh>
      <pointLight ref={i === 0 ? ceilingLightA : ceilingLightB} position={[8.15, 3.18, z]} intensity={0} distance={4.4} decay={2} color="#ffe8c7" />
    </group>)}

    {showPictureLight && <group position={[11.26, 2.05, 2.85]} rotation={[0, -Math.PI / 2, 0]} scale={.72}>
      <PictureLight power={1.5} />
    </group>}

    <pointLight ref={frontFillA} position={[9.18, 1.78, -2.25]} intensity={0} distance={5.4} decay={2} color="#fff0d6" />
    <pointLight ref={frontFillB} position={[9.18, 1.78, 2.25]} intensity={0} distance={5.4} decay={2} color="#fff0d6" />
    </group>

    {visual}
    {content}
  </group>
}
