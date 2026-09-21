import { projects } from '../data/projects.js'
import { Fastener, Frame, PALETTE as C, Plate, Profile, Registration } from '../experience/GalleryFabrication.jsx'
import { Inlay } from '../experience/AuthoredForms.jsx'
import { useSurface } from '../experience/surfaces.js'
import { ROOM_STAGE_Z } from './roomCoordinates.js'

function CraftArchive() {
  return <>
    {/* The same contour is read as a template, an inlay and a finished component. */}
    <Profile outline={[[-1.28,-.56],[-1.28,.68],[-.52,.68],[-.52,.47],[-1.06,.47],[-1.06,-.56]]} depth={.13} color={C.wood}/>
    <Inlay points={[[-.92,-.44],[-.92,.30],[-.60,.30],[-.28,.08],[.08,.08],[.08,.57]]} width={.08} depth={.09} position={[0,0,.05]}/>
    <Profile outline={[[.26,-.56],[1.22,-.56],[1.22,.15],[.80,.60],[.26,.60]]}
      holes={[[[.46,-.34],[1.0,-.34],[1.0,.07],[.70,.38],[.46,.38]]]}
      depth={.11} color={C.ivory}/>
    <Inlay points={[[.48,-.17],[.74,-.17],[.91,.03]]} width={.13} depth={.03} color={C.blue} position={[0,0,.08]}/>
    <Plate w={2.65} h={.11} depth={.19} position={[0,-.65,-.015]} color={C.wood}/>
  </>
}

function Delivery({animate}) {
  return <>
    {/* A fan of inputs settles onto the teeth of a single production spine. */}
    <Profile outline={[[-1.27,-.65],[1.25,-.65],[1.25,-.40],[.84,-.40],[.84,.35],[.67,.35],[.67,-.40],[.07,-.40],[.07,.55],[-.10,.55],[-.10,-.40],[-.70,-.40],[-.70,.73],[-.87,.73],[-.87,-.40],[-1.27,-.40]]}
      depth={.13} color={C.wood}/>
    {[[-.78,.24,.79],[-.01,.10,.70],[.76,-.04,.59]].map(([x,y,h],i)=><Registration key={x} position={[x,y,.15]} offset={[0,.10,0]} delay={i*.15} animate={animate}>
      <Profile outline={[[-.30,-h/2],[.30,-h/2],[.30,h/2-.18],[.12,h/2],[-.30,h/2]]}
        holes={[[[-.18,-h/2+.12],[.17,-h/2+.12],[.17,h/2-.25],[-.18,h/2-.25]]]}
        depth={.07} color={i===2?C.blue:C.ivory}/>
    </Registration>)}
    <Inlay points={[[-1.11,-.53],[-.45,-.53],[.36,-.53],[1.1,-.53]]} width={.027} position={[0,0,.145]}/>
  </>
}

function ProjectArchive() {
  return <>
    {/* Six material folios: the project interfaces remain the room's sole image wall. */}
    <Plate w={3.04} h={.085} depth={.30} position={[0,-.30,.025]} color={C.wood}/>
    {projects.map((project,i)=><group key={project.slug} name={`folio-${project.slug}`} position={[-1.25+i*.50,-.255,.10]}>
      <Profile outline={[[-.18,0],[.18,0],[.18,.48],[.07,.60],[-.18,.60]]} depth={.055} color={C.paper}/>
      <Profile outline={[[-.19,0],[-.12,0],[-.12,.61],[-.19,.61]]} depth={.062} color={i===0?C.blue:C.brass}/>
    </group>)}
    {[-1.38,1.38].map(x=><Fastener key={x} position={[x,-.30,-.02]} length={.34}/>)}
  </>
}

function AgencyBridge() {
  return <>
    {/* Two independently supported paths meet under an uninterrupted client surface. */}
    <Inlay points={[[-1.05,-.55],[-1.05,-.10],[-.85,.15],[-.43,.26],[0,.26]]} width={.23} depth={.17} color={C.wood}/>
    <Inlay points={[[1.05,-.55],[1.05,-.10],[.85,.15],[.43,.26],[0,.26]]} width={.23} depth={.17} color={C.blue}/>
    <Profile outline={[[-1.28,.44],[1.28,.44],[1.06,.72],[-1.06,.72]]} depth={.17} color={C.paper}/>
    <Plate w={2.32} h={.075} depth={.18} color={C.brass} position={[0,.41,0]}/>
    <Plate w={.30} h={.14} depth={.20} color={C.brass} position={[0,.30,-.01]}/>
    {[-1.05,1.05].map(x=><Fastener key={x} position={[x,-.47,-.025]} length={.21}/>)}
  </>
}

function Receiver() {
  return <>
    {/* A grounded envelope receiver: a single incoming trace is held at its seam. */}
    <Profile outline={[[-.84,-.58],[.84,-.58],[.84,.32],[.48,.68],[-.84,.68]]} depth={.06} color={C.wood}/>
    <Profile outline={[[-.61,-.29],[.55,-.29],[.55,.67],[.29,.92],[-.61,.92]]} depth={.035} color={C.paper} position={[0,0,.07]}/>
    <Inlay points={[[-.37,.63],[-.37,.41],[-.12,.22],[.15,.06],[.32,-.19]]} width={.04} color={C.blue} position={[0,0,.115]}/>
    <Profile outline={[[-.87,-.59],[.87,-.59],[.87,.20],[0,-.20],[-.87,.20]]} depth={.045} color={C.brass} metalness={.5} position={[0,0,.19]}/>
    <Plate w={1.73} h={.05} depth={.24} color={C.brass} position={[0,-.59,.015]}/>
    {[-.70,.70].map(x=><Fastener key={x} position={[x,-.40,-.025]} length={.29}/>)}
  </>
}

const roomArt={about:CraftArchive,services:Delivery,work:ProjectArchive,agencies:AgencyBridge,contact:Receiver}

function CraftTable({ position }) {
  const wood = useSurface('wood',2.0,1.0,145)
  return <group position={position}>
    <mesh position={[0,.79,0]}><boxGeometry args={[2,.10,.78]}/><meshStandardMaterial map={wood} color="#78604a" roughness={.56}/></mesh>
    {[-.78,.78].map(x=><Profile key={x} outline={[[-.24,0],[.24,0],[.13,.75],[-.13,.75]]} depth={.10} color={C.wood} position={[x,0,-.05]} rotation={[0,Math.PI/2,0]}/>)}
    <Plate w={.85} h={.53} depth={.01} bevel={.002} color={C.paper} rotation={[-Math.PI/2,0,.09]} position={[-.24,.848,0]}/>
    <Frame w={.51} h={.31} rim={.05} depth={.012} color={C.brass} rotation={[-Math.PI/2,0,.09]} position={[-.24,.87,0]}/>
    <Plate w={.28} h={.34} depth={.08} color={C.blue} rotation={[-Math.PI/2,0,0]} position={[.65,.85,0]}/>
  </group>
}

function DispatchCabinet({ position }) {
  return <group position={position}>
    <Profile outline={[[-.67,0],[.67,0],[.67,.90],[-.67,.90]]} holes={[[[-.51,.16],[.51,.16],[.51,.74],[-.51,.74]]]} depth={.55} color={C.wood} position={[0,0,-.28]}/>
    {[.26,.45,.64].map((y,i)=><group key={y}><Plate w={1.02} h={.055} depth={.51} position={[0,y,-.25]} color={C.ivory}/></group>)}
    <Plate w={1.05} h={.43} depth={.045} color={C.blue} rotation={[-Math.PI/2,0,0]} position={[0,.91,0]}/>
  </group>
}

function JointConsole({ position }) {
  return <group position={position}>
    {[-.80,.80].map((x,i)=><Profile key={x} outline={[[-.12,0],[.12,0],[.12,.78],[-.12,.78]]} depth={.50} color={i?C.blue:C.wood} position={[x,0,-.25]}/>)}
    <Plate w={2.03} h={.61} depth={.12} color={C.ivory} rotation={[-Math.PI/2,0,0]} position={[0,.79,0]}/>
    <Plate w={1.82} h={.027} depth={.018} color={C.brass} position={[0,.84,.315]}/>
  </group>
}

export default function RoomInstallations({ roomId, animate }) {
  const Art = roomArt[roomId]
  const frontChapter = ['about','services','agencies'].includes(roomId)
  // Only the page-specific visual changes. Its anchors are always in the one
  // Services-derived coordinate system, independent of the corridor door side.
  return <group name={`room-installation-${roomId}`}>
    {frontChapter ? <group position={[11.26,2.05,ROOM_STAGE_Z+2.85]} rotation={[0,-Math.PI/2,0]} scale={.72}>
      <Art animate={animate}/>
    </group> : <group position={[7.85,1.88,ROOM_STAGE_Z+4.005]} rotation={[0,Math.PI,0]}><Art animate={animate}/></group>}
    <group position={[10.68,0,ROOM_STAGE_Z+2.8]} rotation={[0,-Math.PI/2,0]} scale={.76}>
      {roomId==='about'&&<CraftTable position={[0,0,0]}/>}
      {roomId==='services'&&<DispatchCabinet position={[0,0,0]}/>}
      {roomId==='agencies'&&<JointConsole position={[0,0,0]}/>}
    </group>
    {roomId==='contact'&&<group position={[8.4,.89,ROOM_STAGE_Z+3.99]} rotation={[0,Math.PI,0]}>
      <Plate w={1.8} h={.075} depth={.50} color={C.wood}/>
      {[-.70,.70].map(x=><Profile key={x} outline={[[0,0],[.28,0],[0,-.28]]} depth={.05} color={C.brass} rotation={[0,-Math.PI/2,0]} position={[x,0,.015]}/>)}
    </group>}
  </group>
}
