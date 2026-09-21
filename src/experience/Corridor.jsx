import { doors } from '../data/projects.js'
import DoorPortal from './DoorPortal.jsx'
import { useSurface } from './surfaces.js'
import { EndWallArtwork, FloorSculpture, GalleryArtwork } from './GalleryArtwork.jsx'
import { BotanicalLeaf } from './OrganicObjects.jsx'
import { CORRIDOR_WALL_THICKNESS, CORRIDOR_WALL_X, ROOM_BACK_X } from '../rooms/roomCoordinates.js'

// The corridor's wall line is stated once, in roomCoordinates, because the room shell is
// built up to the room-side face of this same wall. Keeping one definition is what stops
// the two from overlapping and fighting for the same pixels.
const WALL_X = CORRIDOR_WALL_X
const H = 3.6

/* Permanent corridor wall architecture. The horizontal base remains part of the corridor
   shell in exactly the same way the doors are: it is built once from the corridor's own
   dimensions, and no room or transition state can reach it. */
const BASE_TOP = 0.09                    // the base strip runs from the floor to here
const BASE_PROUD = 0.024                 // how far it stands off the wall face
const FLOOR_Y = -0.075
const FACE_X = CORRIDOR_WALL_X - CORRIDOR_WALL_THICKNESS / 2
const END_Z = -94
const START_Z = 14.2

function WallRuns({ side, wallMap }) {
  const sign = side === 'right' ? 1 : -1
  const gaps = doors
    .filter((d) => d.side === side)
    .map((d) => [d.z + 1.10, d.z - 1.10])
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
      <mesh position={[sign * WALL_X, 1.7625, z]}>
        <boxGeometry args={[CORRIDOR_WALL_THICKNESS, 3.675, len]} />
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
      <mesh position={[sign * (WALL_X - .105), .43, z]}>
        <boxGeometry args={[.085, .12, len]} />
        <meshStandardMaterial color="#d7cabb" roughness={.72} />
      </mesh>
      <mesh position={[sign * (WALL_X - .108), 3.22, z]}>
        <boxGeometry args={[.065, .085, len]} />
        <meshStandardMaterial color="#ded4c6" roughness={.76} />
      </mesh>

      {/* Permanent base strip along the foot of the wall. */}
      <mesh position={[sign * (FACE_X - BASE_PROUD / 2), (FLOOR_Y + BASE_TOP) / 2, z]}>
        <boxGeometry args={[BASE_PROUD, BASE_TOP - FLOOR_Y, len]} />
        <meshStandardMaterial color="#5f5346" roughness={.74} metalness={.02} />
      </mesh>
    </group>
  })}

      {/* Solid wall header above every doorway: the wall must continue between the      */}
      {/* lintel top and the ceiling, otherwise the corridor void shows through as a     */}
      {/* flat cream layer above the opening. Same wall material, both sides, all doors. */}
      {/* The existing top wall rail continues across the same span with the same        */}
      {/* profile, offset and material, so the band reads uninterrupted over each door.  */}
      {gaps.map(([front, back], i) => (
        <group key={`header-${side}-${i}`}>
          <mesh position={[sign * WALL_X, 3.335, (front + back) / 2]}>
            <boxGeometry args={[CORRIDOR_WALL_THICKNESS, .53, front - back]} />
            <meshStandardMaterial
              map={wallMap}
              color="#fffaf1"
              roughness={.94}
              metalness={0}
              bumpMap={wallMap}
              bumpScale={.005}
            />
          </mesh>
          <mesh position={[sign * (WALL_X - .108), 3.22, (front + back) / 2]}>
            <boxGeometry args={[.065, .085, front - back]} />
            <meshStandardMaterial color="#ded4c6" roughness={.76} />
          </mesh>
        </group>
      ))}
    </>
}

function EndWall({ wallMap, animate = true }) {
  return <group>
    {/* Slight overlap with both side walls removes the exposed white/black corner gaps. */}
    <mesh position={[0, 1.7625, END_Z]}>
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
    <mesh position={[0, .43, END_Z + .108]}>
      <boxGeometry args={[6.96, .12, .07]} />
      <meshStandardMaterial color="#d7cabb" roughness={.72} />
    </mesh>
    <mesh position={[0, 3.22, END_Z + .108]}>
      <boxGeometry args={[6.96, .085, .065]} />
      <meshStandardMaterial color="#ded4c6" roughness={.76} />
    </mesh>
    <mesh position={[0, (FLOOR_Y + BASE_TOP) / 2, END_Z + .10 + BASE_PROUD / 2]}>
      <boxGeometry args={[6.96, BASE_TOP - FLOOR_Y, BASE_PROUD]} />
      <meshStandardMaterial color="#5f5346" roughness={.74} metalness={.02} />
    </mesh>

    {/* A single site-specific kinetic work gives the corridor a real gallery destination. */}
    <EndWallArtwork z={END_Z + .115} animate={animate} />
  </group>
}


function StartWall({ wallMap }) {
  const opening = 2.18
  const sideW = (7.04 - opening) / 2
  const sideX = opening / 2 + sideW / 2

  return <group>
    {/* The entry stays open; the interactive doors belong to the rooms. */}
    {[-sideX, sideX].map((x) => <mesh key={x} position={[x, 1.7625, START_Z]}>
      <boxGeometry args={[sideW + .035, 3.675, .20]} />
      <meshStandardMaterial map={wallMap} color="#fffaf1" roughness={.94} metalness={0} bumpMap={wallMap} bumpScale={.005} />
    </mesh>)}
    <mesh position={[0, 3.405, START_Z]}>
      <boxGeometry args={[opening + .04, .39, .20]} />
      <meshStandardMaterial map={wallMap} color="#fffaf1" roughness={.94} metalness={0} bumpMap={wallMap} bumpScale={.005} />
    </mesh>

    {/* Rails terminate cleanly at the doorway instead of drawing across it. */}
    {[-sideX, sideX].map((x) => <mesh key={`low-${x}`} position={[x, .43, START_Z - .108]}>
      <boxGeometry args={[sideW, .12, .07]} />
      <meshStandardMaterial color="#d7cabb" roughness={.72} />
    </mesh>)}
    <mesh position={[0, 3.22, START_Z - .108]}>
      <boxGeometry args={[6.96, .085, .065]} />
      <meshStandardMaterial color="#ded4c6" roughness={.76} />
    </mesh>

  </group>
}

/* Shared corridor plant structure: pot -> soil -> trunk -> branches -> leaves.        */
/* Every branch is a cylinder solved between two structural points and rooted inside   */
/* the trunk; every leaf is seated on its branch tip and aligned with the branch axis, */
/* so nothing floats and the plant reads as one connected object.                      */
function BranchWithLeaf({ from, to, leafLength = .42, leafWidth = .16, color = '#708067' }) {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2]
  const len = Math.max(.001, Math.hypot(dx, dy, dz))
  const ux = dx / len, uy = dy / len, uz = dz / len
  const yaw = Math.atan2(-ux, uy)
  const pitch = Math.asin(Math.max(-1, Math.min(1, uz / Math.max(.25, Math.cos(yaw)))))
  const rot = [pitch, 0, yaw]
  const seat = leafLength * .5 - .05
  return <group>
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]} rotation={rot}>
      <cylinderGeometry args={[.009, .015, len, 10]} />
      <meshStandardMaterial color="#53694d" roughness={.9} />
    </mesh>
    <BotanicalLeaf
      position={[to[0] + ux * seat, to[1] + uy * seat, to[2] + uz * seat]}
      rotation={rot}
      length={leafLength}
      width={leafWidth}
      color={color}
    />
  </group>
}

function Plant({ side, z, accent = '#708067' }) {
  const sign = side === 'right' ? 1 : -1
  return <group position={[sign * 2.75, 0, z]}>
    <mesh position={[0, .28, 0]}><cylinderGeometry args={[.27, .34, .56, 28]} /><meshStandardMaterial color="#6a5b4d" roughness={.88} /></mesh>
    <mesh position={[0, .545, 0]}><cylinderGeometry args={[.245, .245, .05, 24]} /><meshStandardMaterial color="#4a3a2c" roughness={.95} /></mesh>
    {/* The trunk rises from inside the pot through the soil; every branch roots into it. */}
    <mesh position={[0, .74, 0]}><cylinderGeometry args={[.020, .034, .68, 10]} /><meshStandardMaterial color="#53694d" roughness={.88} /></mesh>
    <BranchWithLeaf from={[0, .58, 0]} to={[-.26, .88, .03]} leafLength={.42} leafWidth={.16} color={accent} />
    <BranchWithLeaf from={[0, .76, 0]} to={[.27, 1.00, -.04]} leafLength={.42} leafWidth={.17} color="#66765e" />
    <BranchWithLeaf from={[0, .94, 0]} to={[-.22, 1.16, .06]} leafLength={.38} leafWidth={.13} color="#728267" />
    <BranchWithLeaf from={[0, 1.02, 0]} to={[.05, 1.18, .02]} leafLength={.38} leafWidth={.15} color={accent} />
  </group>
}

function CorridorDecor({ animate = true }) {
  const zs = Array.from({ length: 18 }, (_, i) => 8 - i * 5.5)
  return <>
    {zs.map((z, i) => <group key={z}>
      <mesh position={[0, 3.53, z]}><boxGeometry args={[2.15, .05, .42]} /><meshStandardMaterial color="#ece3d1" emissive="#ffe9bd" emissiveIntensity={1.35} roughness={.45} /></mesh>
      <mesh position={[0, 3.485, z]}><boxGeometry args={[1.78, .018, .29]} /><meshBasicMaterial color="#fff7e9" /></mesh>
      {i % 3 === 0 && <pointLight position={[0, 3.2, z]} intensity={2.35} distance={9.5} decay={2.0} color="#ffdca8" />}
    </group>)}

    <GalleryArtwork side="left" z={-7.4} kind="brief" animate={animate} />
    <GalleryArtwork side="right" z={-11.7} kind="hierarchy" animate={animate} />
    <GalleryArtwork side="right" z={-25.2} kind="responsive" animate={animate} />
    <GalleryArtwork side="left" z={-39.1} kind="states" animate={animate} />
    <GalleryArtwork side="right" z={-56.2} kind="handoff" animate={animate} />
    <GalleryArtwork side="left" z={-72.0} kind="surface" animate={animate} />

    <Plant side="right" z={-8.4} />
    <Plant side="left" z={-28.2} accent="#79856d" />
    <Plant side="right" z={-74.5} accent="#5f745f" />
    <FloorSculpture position={[-2.46,-.075,-23]} kind="gauge" />
    <FloorSculpture position={[2.46,-.075,-61]} kind="joint" />
  </>
}

export default function Corridor({ animate = true }) {
  const wallMap = useSurface('plaster', 2.4, 22, 11)
  const stone = useSurface('stone', 1, 16.5, 12)
  const carpet = useSurface('carpet', 1, 18, 13)
  const ceiling = useSurface('plaster', 2.0, 22, 14)

  return <group>
    {/* Standard non-reflective floor removes the grey travelling shadow/ripple artifacts. */}
    <mesh position={[0, -.075, -39]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_BACK_X * 2, 116]} />
      <meshStandardMaterial map={stone} color="#d7cdbd" roughness={.93} metalness={0} />
    </mesh>
    <mesh position={[0, .006, -39]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.52, 116]} />
      <meshStandardMaterial map={carpet} color="#827970" roughness={1} />
    </mesh>
    <mesh position={[0, 3.62, -39]}>
      <boxGeometry args={[ROOM_BACK_X * 2, .18, 116]} />
      <meshStandardMaterial map={ceiling} color="#f2ece0" roughness={.94} bumpMap={ceiling} bumpScale={.003} />
    </mesh>

    <WallRuns side="left" wallMap={wallMap} />
    <WallRuns side="right" wallMap={wallMap} />
    <StartWall wallMap={wallMap} />
    <EndWall wallMap={wallMap} animate={animate} />
    <CorridorDecor animate={animate} />
    {doors.map((d, i) => <DoorPortal key={d.id} spec={d} index={i} />)}
  </group>
}
