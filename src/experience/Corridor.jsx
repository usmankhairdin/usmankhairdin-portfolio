import { useTexture } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { doors, projects } from '../data/projects.js'
import DoorPortal from './DoorPortal.jsx'
import { useSurface } from './surfaces.js'
import { useJourney } from './JourneyContext.jsx'

const WALL_X = 3.5
const H = 3.6
const END_Z = -94
const START_Z = 14.2

function WallRuns({ side, wallMap }) {
  const sign = side === 'right' ? 1 : -1
  const gaps = doors
    .filter((d) => d.side === side)
    .map((d) => [d.z + 1.2, d.z - 1.2])
    .sort((a, b) => b[0] - a[0])

  const runs = []
  let cursor = 14
  gaps.forEach(([front, back]) => {
    if (cursor > front) runs.push([cursor, front])
    cursor = back
  })
  if (cursor > END_Z) runs.push([cursor, END_Z])

  return <>{runs.map(([a, b], i) => {
    const len = a - b
    const z = (a + b) / 2
    return <group key={`${side}-${i}`}>
      {/* One continuous wall surface all the way to the floor. */}
      <mesh position={[sign * WALL_X, 1.7625, z]} receiveShadow={false} castShadow={false}>
        <boxGeometry args={[.18, 3.675, len]} />
        <meshStandardMaterial
          map={wallMap}
          color="#fffaf1"
          roughness={.94}
          metalness={0}
          bumpMap={wallMap}
          bumpScale={.005}
        />
      </mesh>

      {/* Keep the approved shallow 3D wall rail, but without black/grey/white seams. */}
      <mesh position={[sign * (WALL_X - .105), .43, z]} receiveShadow={false} castShadow={false}>
        <boxGeometry args={[.085, .12, len]} />
        <meshStandardMaterial color="#d7cabb" roughness={.72} />
      </mesh>
      <mesh position={[sign * (WALL_X - .108), 3.22, z]} receiveShadow={false} castShadow={false}>
        <boxGeometry args={[.065, .085, len]} />
        <meshStandardMaterial color="#ded4c6" roughness={.76} />
      </mesh>
    </group>
  })}</>
}

function EndFrame({ src, x, y = 1.82, w = 1.35, h = 1.55 }) {
  const tex = useTexture(src)
  return <group position={[x, y, END_Z + .115]}>
    {/* Deep frame/chaukhat-like treatment instead of a flat black border. */}
    <mesh position={[0, 0, -.045]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[w + .22, h + .22, .11]} />
      <meshStandardMaterial color="#836e58" roughness={.46} metalness={.025} />
    </mesh>
    <mesh position={[0, 0, .018]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[w + .09, h + .09, .045]} />
      <meshStandardMaterial color="#b4976a" roughness={.38} metalness={.16} />
    </mesh>
    <mesh position={[0, 0, .052]} receiveShadow={false}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={.72} />
    </mesh>
    <mesh position={[0, 0, .068]}>
      <planeGeometry args={[w - .025, h - .025]} />
      <meshPhysicalMaterial color="#ffffff" transparent opacity={.055} roughness={.08} clearcoat={.8} clearcoatRoughness={.16} />
    </mesh>
  </group>
}

function EndWall({ wallMap }) {
  return <group>
    {/* Slight overlap with both side walls removes the exposed white/black corner gaps. */}
    <mesh position={[0, 1.7625, END_Z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[7.04, 3.675, .20]} />
      <meshStandardMaterial
        map={wallMap}
        color="#fffaf1"
        roughness={.94}
        metalness={0}
        bumpMap={wallMap}
        bumpScale={.005}
      />
    </mesh>
    <mesh position={[0, .43, END_Z + .108]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[6.96, .12, .07]} />
      <meshStandardMaterial color="#d7cabb" roughness={.72} />
    </mesh>
    <mesh position={[0, 3.22, END_Z + .108]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[6.96, .085, .065]} />
      <meshStandardMaterial color="#ded4c6" roughness={.76} />
    </mesh>

    {/* The end wall is intentionally designed, not left as a blank white panel. */}
    <EndFrame src={projects[0].poster} x={-1.75} w={1.18} h={1.42} />
    <EndFrame src={projects[2].poster} x={0} w={1.42} h={1.65} />
    <EndFrame src={projects[4].poster} x={1.75} w={1.18} h={1.42} />
  </group>
}


function EntranceDoor() {
  const pivot = useRef()
  const { experiencePhase } = useJourney()
  const wood = useSurface('wood', 1.15, 2.8, 20)
  const jamb = useSurface('wood', 1, 3.4, 30)
  const open = experiencePhase === 'entering' || experiencePhase === 'exiting'

  useEffect(() => {
    if (!pivot.current) return
    gsap.to(pivot.current.rotation, {
      y: open ? -1.46 : 0,
      duration: open ? .82 : .72,
      ease: 'power3.inOut'
    })
  }, [open])

  return <group position={[0, 1.45, START_Z - .12]}>
    {/* This is the inside face of the same entrance door used on the intro screen:
        same warm jamb, same two recessed panels, same proportions and material family. */}
    <mesh position={[-.98, 0, 0]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[.24, 3.24, .60]} />
      <meshStandardMaterial map={jamb} color="#806a55" roughness={.46} bumpMap={jamb} bumpScale={.014} />
    </mesh>
    <mesh position={[.98, 0, 0]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[.24, 3.24, .60]} />
      <meshStandardMaterial map={jamb} color="#806a55" roughness={.46} bumpMap={jamb} bumpScale={.014} />
    </mesh>
    <mesh position={[0, 1.54, 0]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[2.20, .24, .60]} />
      <meshStandardMaterial map={jamb} color="#806a55" roughness={.46} bumpMap={jamb} bumpScale={.014} />
    </mesh>
    {/* Thin warm outline mirrors the outer intro portal frame. */}
    <mesh position={[-1.105, 0, -.02]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[.035, 3.34, .63]} />
      <meshStandardMaterial color="#b39870" metalness={.18} roughness={.34} />
    </mesh>
    <mesh position={[1.105, 0, -.02]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[.035, 3.34, .63]} />
      <meshStandardMaterial color="#b39870" metalness={.18} roughness={.34} />
    </mesh>
    <mesh position={[0, 1.665, -.02]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[2.24, .035, .63]} />
      <meshStandardMaterial color="#b39870" metalness={.18} roughness={.34} />
    </mesh>
    <mesh position={[0, -1.55, .02]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[2.18, .10, .72]} />
      <meshPhysicalMaterial color="#9b8870" roughness={.42} metalness={.06} clearcoat={.20} />
    </mesh>

    <group ref={pivot} position={[-.86, -1.43, -.08]}>
      <mesh position={[.86, 1.43, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1.72, 2.86, .16]} />
        <meshPhysicalMaterial
          map={wood}
          color="#74543e"
          roughness={.36}
          metalness={.015}
          clearcoat={.36}
          clearcoatRoughness={.30}
          bumpMap={wood}
          bumpScale={.018}
        />
      </mesh>

      {/* Two large recessed panels — the defining visual of the outer intro door. */}
      {[.75, 2.08].map((y) => <group key={y} position={[.86, y, -.092]}>
        <mesh castShadow={false} receiveShadow={false}>
          <boxGeometry args={[1.30, .86, .030]} />
          <meshStandardMaterial map={wood} color="#614633" roughness={.45} />
        </mesh>
        <mesh position={[0, 0, -.018]} castShadow={false} receiveShadow={false}>
          <boxGeometry args={[1.18, .72, .022]} />
          <meshStandardMaterial map={wood} color="#775840" roughness={.40} />
        </mesh>
      </group>)}

      <group position={[1.43, 1.43, -.17]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={false}><cylinderGeometry args={[.052, .052, .14, 24]} /><meshStandardMaterial color="#c6aa78" metalness={.92} roughness={.16} /></mesh>
        <mesh position={[.17, 0, -.01]} rotation={[0, 0, Math.PI / 2]} castShadow={false}><cylinderGeometry args={[.030, .030, .34, 20]} /><meshStandardMaterial color="#c6aa78" metalness={.92} roughness={.16} /></mesh>
      </group>
    </group>
  </group>
}

function StartWall({ wallMap }) {
  const opening = 2.18
  const sideW = (7.04 - opening) / 2
  const sideX = opening / 2 + sideW / 2

  return <group>
    {/* Same proportions/corner logic as the approved end wall, with only a centred entrance door. */}
    {[-sideX, sideX].map((x) => <mesh key={x} position={[x, 1.7625, START_Z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[sideW + .035, 3.675, .20]} />
      <meshStandardMaterial map={wallMap} color="#fffaf1" roughness={.94} metalness={0} bumpMap={wallMap} bumpScale={.005} />
    </mesh>)}
    <mesh position={[0, 3.405, START_Z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[opening + .04, .39, .20]} />
      <meshStandardMaterial map={wallMap} color="#fffaf1" roughness={.94} metalness={0} bumpMap={wallMap} bumpScale={.005} />
    </mesh>

    {/* Rails terminate cleanly at the doorway instead of drawing across it. */}
    {[-sideX, sideX].map((x) => <mesh key={`low-${x}`} position={[x, .43, START_Z - .108]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[sideW, .12, .07]} />
      <meshStandardMaterial color="#d7cabb" roughness={.72} />
    </mesh>)}
    <mesh position={[0, 3.22, START_Z - .108]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[6.96, .085, .065]} />
      <meshStandardMaterial color="#ded4c6" roughness={.76} />
    </mesh>

    <EntranceDoor />
  </group>
}

function ArtFrame({ side, z, projectIndex = 0, size = 'portrait' }) {
  const tex = useTexture(projects[projectIndex % projects.length].poster)
  const sign = side === 'right' ? 1 : -1
  const w = size === 'wide' ? 1.48 : 1.0
  const h = size === 'wide' ? .92 : 1.36
  const y = size === 'wide' ? 1.9 : 1.83

  return <group position={[sign * 3.385, y, z]} rotation={[0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}>
    {/* Door-jamb-inspired frame: warm timber depth + thin metal inner lip. */}
    <mesh position={[0, 0, -.052]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[w + .24, h + .24, .14]} />
      <meshStandardMaterial color="#836e58" roughness={.46} metalness={.025} />
    </mesh>
    <mesh position={[0, 0, .005]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[w + .10, h + .10, .05]} />
      <meshStandardMaterial color="#b4976a" metalness={.18} roughness={.34} />
    </mesh>
    <mesh position={[0, 0, .044]} receiveShadow={false}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={.7} />
    </mesh>
    <mesh position={[0, 0, .061]}>
      <planeGeometry args={[w - .03, h - .03]} />
      <meshPhysicalMaterial color="#ffffff" transparent opacity={.055} roughness={.07} clearcoat={.85} clearcoatRoughness={.15} />
    </mesh>
    {/* The small support/rod stays, but with no ripple/reflection beneath it. */}
    <mesh position={[0, -h / 2 - .16, -.025]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[w * .55, .055, .09]} />
      <meshStandardMaterial color="#9a8768" metalness={.42} roughness={.36} />
    </mesh>
  </group>
}

function Plant({ side, z, accent = '#708067' }) {
  const sign = side === 'right' ? 1 : -1
  return <group position={[sign * 2.75, 0, z]}>
    <mesh position={[0, .28, 0]} castShadow receiveShadow={false}><cylinderGeometry args={[.28, .34, .56, 28]} /><meshStandardMaterial color="#6a5b4d" roughness={.88} /></mesh>
    <mesh position={[0, .66, 0]} castShadow={false}><sphereGeometry args={[.34, 24, 20]} /><meshStandardMaterial color={accent} roughness={.86} /></mesh>
    <mesh position={[-.18, .88, .03]} rotation={[0, 0, -.38]} castShadow={false}><sphereGeometry args={[.22, 20, 16]} /><meshStandardMaterial color={accent} roughness={.86} /></mesh>
    <mesh position={[.19, .91, -.06]} rotation={[0, 0, .4]} castShadow={false}><sphereGeometry args={[.24, 20, 16]} /><meshStandardMaterial color="#66765e" roughness={.86} /></mesh>
  </group>
}

function Console({ side, z }) {
  const sign = side === 'right' ? 1 : -1
  return <group position={[sign * 2.94, 0, z]}>
    <mesh position={[0, .78, 0]} castShadow receiveShadow={false}><boxGeometry args={[.56, .07, 1.45]} /><meshStandardMaterial color="#4b4036" roughness={.48} /></mesh>
    {[-.58, .58].map((d) => <mesh key={d} position={[0, .39, d]} castShadow><boxGeometry args={[.10, .78, .10]} /><meshStandardMaterial color="#4b4036" roughness={.5} /></mesh>)}
    <mesh position={[0, 1.02, .28]} castShadow={false}><cylinderGeometry args={[.12, .15, .38, 22]} /><meshStandardMaterial color="#b49362" metalness={.65} roughness={.28} /></mesh>
    <mesh position={[0, 1.25, .28]} castShadow={false}><sphereGeometry args={[.16, 22, 18]} /><meshStandardMaterial color="#efe3cf" roughness={.55} /></mesh>
  </group>
}

function CorridorDecor() {
  const zs = Array.from({ length: 18 }, (_, i) => 8 - i * 5.5)
  return <>
    {zs.map((z, i) => <group key={z}>
      <mesh position={[0, 3.53, z]} castShadow={false} receiveShadow={false}><boxGeometry args={[2.15, .05, .42]} /><meshStandardMaterial color="#ece3d1" emissive="#ffe9bd" emissiveIntensity={1.35} roughness={.45} /></mesh>
      <mesh position={[0, 3.485, z]}><boxGeometry args={[1.78, .018, .29]} /><meshBasicMaterial color="#fff7e9" /></mesh>
      {i % 3 === 0 && <pointLight position={[0, 3.2, z]} intensity={5.2} distance={12} decay={2.15} color="#ffdca8" />}
    </group>)}

    <ArtFrame side="left" z={-7.5} projectIndex={0} />
    <ArtFrame side="right" z={-11.5} projectIndex={1} size="wide" />
    <ArtFrame side="right" z={-25} projectIndex={2} />
    <ArtFrame side="left" z={-39} projectIndex={3} size="wide" />
    <ArtFrame side="right" z={-56} projectIndex={4} />
    <ArtFrame side="left" z={-72} projectIndex={5} />

    <Plant side="right" z={-8.4} />
    <Plant side="left" z={-28.2} accent="#79856d" />
    <Plant side="right" z={-74.5} accent="#5f745f" />
    <Console side="left" z={-12.2} />
    <Console side="right" z={-44.0} />

    {[-23, -61].map((z, i) => <group key={z} position={[i ? 2.45 : -2.45, 0, z]}>
      <mesh position={[0, .42, 0]} castShadow={false} receiveShadow={false}><cylinderGeometry args={[.36, .42, .84, 32]} /><meshStandardMaterial color="#b4a591" roughness={.68} /></mesh>
      <mesh position={[0, 1.13, 0]} castShadow={false}><sphereGeometry args={[.34, 28, 28]} /><meshPhysicalMaterial color={i ? '#5567d8' : '#d77764'} roughness={.34} clearcoat={.45} clearcoatRoughness={.24} /></mesh>
    </group>)}
  </>
}

export default function Corridor() {
  const wallMap = useSurface('plaster', 2.4, 22, 11)
  const stone = useSurface('stone', 2.0, 28, 12)
  const carpet = useSurface('carpet', 1, 30, 13)
  const ceiling = useSurface('plaster', 2.0, 22, 14)

  return <group>
    {/* Standard non-reflective floor removes the grey travelling shadow/ripple artifacts. */}
    <mesh position={[0, -.075, -39]} receiveShadow={false} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, 116]} />
      <meshStandardMaterial map={stone} color="#d7cdbd" roughness={.93} metalness={0} />
    </mesh>
    <mesh position={[0, .006, -39]} receiveShadow={false} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.52, 116]} />
      <meshStandardMaterial map={carpet} color="#827970" roughness={1} />
    </mesh>
    <mesh position={[0, 3.62, -39]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[7, .18, 116]} />
      <meshStandardMaterial map={ceiling} color="#f2ece0" roughness={.94} bumpMap={ceiling} bumpScale={.003} />
    </mesh>

    <WallRuns side="left" wallMap={wallMap} />
    <WallRuns side="right" wallMap={wallMap} />
    <StartWall wallMap={wallMap} />
    <EndWall wallMap={wallMap} />
    <CorridorDecor />
    {doors.map((d, i) => <DoorPortal key={d.id} spec={d} index={i} />)}
  </group>
}
