import CanvasLabel from './CanvasLabel.jsx'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useJourney } from './JourneyContext.jsx'
import { useSurface } from './surfaces.js'
import useReducedMotion from './useReducedMotion.js'
import { doorMotionEase, doorSystem } from './doorSystem.js'
import { registerDoorParts } from './doorRegistry.js'

// A door on the left of the corridor is the right-hand door turned through PI about the
// corridor's centre line - the same mirroring the room behind it uses. That makes the leaf
// swing the same way in its own frame on both sides, so every door opens INTO its room.
export default function DoorPortal({ spec, index }) {
  const side = spec.side === 'right' ? 1 : -1
  const root = useRef()
  const pivot = useRef()
  const handle = useRef()
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotion()
  const { activeDoor, setActiveDoor, phase, setPhase, setNavigationTarget } = useJourney()
  const navigate = useNavigate()
  const active = activeDoor === spec.id
  const wood = useSurface('wood', 1.15, 2.8, 20)
  const jamb = useSurface('wood', 1, 3.4, 30)


  // The room containment system reads the opening and the leaf's real swing from the
  // door itself, so it can never fall out of step with the geometry on screen.
  useLayoutEffect(() => registerDoorParts(spec.id, { root, pivot }), [spec.id])

  useLayoutEffect(() => {
    document.body.style.cursor = hovered && phase === 'corridor' ? 'pointer' : ''
    return () => { document.body.style.cursor = '' }
  }, [hovered, phase])

  useEffect(() => {
    if (!active) return
    if (reducedMotion) {
      if (handle.current) handle.current.rotation.z = 0
      if (pivot.current) pivot.current.rotation.y = phase === 'entering' || phase === 'room' ? doorSystem.openAngle : 0
      return
    }
    if (phase === 'entering') {
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
      if (handle.current) {
        tl.to(handle.current.rotation, { z: -.46, duration: doorSystem.motion.handlePressDuration, ease: 'power2.out' }, doorSystem.motion.handlePressAt)
          .to(handle.current.rotation, { z: 0, duration: doorSystem.motion.handleRecoverDuration, ease: doorMotionEase }, doorSystem.motion.handleRecoverAt)
      }
      if (pivot.current) tl.to(pivot.current.rotation, { y: doorSystem.openAngle, duration: doorSystem.motion.leafOpenDuration, ease: doorMotionEase }, doorSystem.motion.leafOpenAt)
      return () => tl.kill()
    }
    if (phase === 'exiting') {
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
      if (pivot.current) tl.to(pivot.current.rotation, { y: 0, duration: doorSystem.motion.leafCloseDuration, ease: doorMotionEase }, doorSystem.motion.leafCloseAt)
      return () => tl.kill()
    }
  }, [active, phase, reducedMotion])

  const click = () => {
    if (phase !== 'corridor') return
    if (window.matchMedia?.('(max-width: 650px), (pointer: coarse)').matches) {
      navigate(spec.route)
      return
    }
    setNavigationTarget(null)
    setActiveDoor(spec.id)
    setPhase('entering')
  }

  const doorColor = hovered ? '#8a684d' : doorSystem.colors.leaf
  const panelColor = hovered ? '#7c5d46' : doorSystem.colors.panel

  // The hit area is the whole physical door - frame, jambs, head, threshold and leaf -
  // because that is what a visitor reads as "the door". It used to be the leaf group
  // alone, so approaching at an angle (where the leaf is foreshortened and the frame
  // fills most of the opening) meant a perfectly aimed click landed on dead geometry.
  return <group
    ref={root}
    position={[side * 3.5, 0, spec.z]}
    rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}
    onClick={click}
    onPointerEnter={() => setHovered(true)}
    onPointerLeave={() => setHovered(false)}
  >
    <group position={[0, 1.45, 0]}>
      {/* Deep wall reveal / chaukhat. The opening above remains genuinely open like the approved doors. */}
      <mesh position={[-.98, 0, -.07]}>
        <boxGeometry args={[doorSystem.frame.jamb, doorSystem.frame.height, doorSystem.frame.depth]} />
        <meshStandardMaterial map={jamb} color={doorSystem.colors.jamb} roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[.98, 0, -.07]}>
        <boxGeometry args={[doorSystem.frame.jamb, doorSystem.frame.height, doorSystem.frame.depth]} />
        <meshStandardMaterial map={jamb} color={doorSystem.colors.jamb} roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[0, 1.52, -.07]}>
        <boxGeometry args={[doorSystem.frame.width, doorSystem.frame.head, doorSystem.frame.depth]} />
        <meshStandardMaterial map={jamb} color={doorSystem.colors.jamb} roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[0, -1.53, -.04]}>
        <boxGeometry args={[2.20, .11, .72]} />
        <meshPhysicalMaterial color="#9b8870" roughness={.42} metalness={.06} clearcoat={.20} />
      </mesh>

      {/* No solid black backing plane. This preserves the open/transparent-through-the-door feel. */}
      <group ref={pivot} position={[-.86, -1.42, .08]}>
        <mesh position={[.86, 1.42, 0]}>
          <boxGeometry args={[doorSystem.leaf.width, doorSystem.leaf.height, doorSystem.leaf.depth]} />
          <meshPhysicalMaterial
            map={wood}
            color={doorColor}
            roughness={.36}
            metalness={.015}
            clearcoat={.38}
            clearcoatRoughness={.30}
            bumpMap={wood}
            bumpScale={.018}
          />
        </mesh>

        {/* Two proportioned recessed panels match the entrance leaf exactly, eliminating visual-language drift. */}
        {[.75, 2.08].map((y) => <group key={y} position={[.86, y, .083]}>
          <mesh>
            <boxGeometry args={[doorSystem.panel.width, doorSystem.panel.height, .032]} />
            <meshStandardMaterial map={wood} color={panelColor} roughness={.44} />
          </mesh>
          <mesh position={[0,0,.019]}>
            <boxGeometry args={[doorSystem.panel.insetWidth, doorSystem.panel.insetHeight, .018]} />
            <meshStandardMaterial map={wood} color={hovered ? '#836249' : doorSystem.colors.panelInset} roughness={.40} />
          </mesh>
        </group>)}

        {/* Recessed/debossed door label: same wood family, no white text layer. */}
        <CanvasLabel
          text={spec.label}
          position={[.86, 2.455, .126]}
          width={1.18}
          height={.23}
          fontSize={67}
          tracking={9}
          color={doorSystem.colors.label}
          strokeColor="#8a6a50"
          strokeWidth={1.25}
          opacity={.96}
        />

        <group ref={handle} position={[1.43, 1.38, .16]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[doorSystem.handle.roseRadius, doorSystem.handle.roseRadius, .14, 24]} /><meshStandardMaterial color={doorSystem.colors.brass} metalness={.92} roughness={.16} /></mesh>
          <mesh position={[.18, 0, .01]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[doorSystem.handle.leverRadius, doorSystem.handle.leverRadius, doorSystem.handle.leverLength, 20]} /><meshStandardMaterial color={doorSystem.colors.brass} metalness={.92} roughness={.16} /></mesh>
          <mesh position={[-.04, 0, -.01]}><cylinderGeometry args={[.075, .075, .028, 24]} /><meshStandardMaterial color={doorSystem.colors.brassDark} metalness={.88} roughness={.2} /></mesh>
        </group>
      </group>

      <pointLight position={[0, 1.05, .82]} intensity={hovered ? 1.05 : .50} distance={3.8} decay={2.0} color="#e5cda9" />
    </group>
  </group>
}
