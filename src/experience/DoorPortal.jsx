import { Text } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useJourney } from './JourneyContext.jsx'
import { useSurface } from './surfaces.js'

export default function DoorPortal({ spec, index }) {
  const side = spec.side === 'right' ? 1 : -1
  const pivot = useRef()
  const handle = useRef()
  const [hovered, setHovered] = useState(false)
  const { activeDoor, setActiveDoor, phase, setPhase, setNavigationTarget } = useJourney()
  const active = activeDoor === spec.id
  const wood = useSurface('wood', 1.15, 2.8, 20)
  const jamb = useSurface('wood', 1, 3.4, 30)

  useEffect(() => {
    document.body.style.cursor = hovered && phase === 'corridor' ? 'pointer' : ''
    return () => { document.body.style.cursor = '' }
  }, [hovered, phase])

  useEffect(() => {
    if (!active) return
    if (phase === 'entering') {
      const tl = gsap.timeline()
      if (handle.current) {
        tl.to(handle.current.rotation, { z: -.52, duration: .2, ease: 'power2.out' }, .34)
          .to(handle.current.rotation, { z: 0, duration: .24, ease: 'power2.inOut' }, .57)
      }
      if (pivot.current) tl.to(pivot.current.rotation, { y: side * 1.48, duration: .92, ease: 'power3.inOut' }, .5)
      return () => tl.kill()
    }
    if (phase === 'exiting') {
      const tl = gsap.timeline()
      if (pivot.current) tl.to(pivot.current.rotation, { y: 0, duration: .78, ease: 'power3.inOut' }, 1.06)
      return () => tl.kill()
    }
  }, [active, phase, side])

  const click = () => {
    if (phase !== 'corridor') return
    setNavigationTarget(null)
    setActiveDoor(spec.id)
    setPhase('entering')
  }

  const doorColor = hovered ? '#8a684d' : '#74563f'
  const panelColor = hovered ? '#7c5d46' : '#694c39'

  return <group position={[side * 3.5, 0, spec.z]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
    <group position={[0, 1.45, 0]}>
      {/* Deep wall reveal / chaukhat. The opening above remains genuinely open like the approved doors. */}
      <mesh position={[-.93, 0, -.07]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[.20, 3.20, .58]} />
        <meshStandardMaterial map={jamb} color="#8c765f" roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[.93, 0, -.07]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[.20, 3.20, .58]} />
        <meshStandardMaterial map={jamb} color="#8c765f" roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[0, 1.52, -.07]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[2.06, .20, .58]} />
        <meshStandardMaterial map={jamb} color="#8c765f" roughness={.48} bumpMap={jamb} bumpScale={.014} />
      </mesh>
      <mesh position={[0, -1.53, -.04]} receiveShadow={false} castShadow={false}>
        <boxGeometry args={[2.08, .11, .72]} />
        <meshPhysicalMaterial color="#9b8870" roughness={.42} metalness={.06} clearcoat={.20} />
      </mesh>

      {/* No solid black backing plane. This preserves the open/transparent-through-the-door feel. */}
      <group ref={pivot} position={[-.82, -1.42, .08]}>
        <mesh
          position={[.82, 1.42, 0]}
          castShadow
          receiveShadow={false}
          onClick={click}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <boxGeometry args={[1.64, 2.84, .15]} />
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

        {[.67, 1.34, 2.04].map((y, i) => <mesh key={y} position={[.82, y, i === 1 ? .085 : .083]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[1.23, i === 1 ? .48 : .42, .032]} />
          <meshStandardMaterial map={wood} color={panelColor} roughness={.44} />
        </mesh>)}

        {/* Recessed/debossed door label: same wood family, no white text layer. */}
        <Text
          position={[.82, 2.455, .078]}
          fontSize={.158}
          color="#4d3729"
          anchorX="center"
          anchorY="middle"
          letterSpacing={.105}
          outlineWidth={.0035}
          outlineColor="#8a6a50"
        >
          {spec.label}
        </Text>

        <group ref={handle} position={[1.38, 1.38, .16]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.055, .055, .14, 24]} /><meshStandardMaterial color="#c6aa78" metalness={.92} roughness={.16} /></mesh>
          <mesh position={[.18, 0, .01]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.032, .032, .36, 20]} /><meshStandardMaterial color="#c6aa78" metalness={.92} roughness={.16} /></mesh>
          <mesh position={[-.04, 0, -.01]} castShadow><cylinderGeometry args={[.075, .075, .028, 24]} /><meshStandardMaterial color="#b89b6b" metalness={.88} roughness={.2} /></mesh>
        </group>
      </group>

      <pointLight position={[0, 1.05, .82]} intensity={hovered ? 4.2 : 1.25} distance={4.0} decay={2.1} color={hovered ? spec.accent : '#ff705d'} />
    </group>
  </group>
}
