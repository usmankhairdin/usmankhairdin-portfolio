import Corridor from './Corridor.jsx'
import CameraRig from './CameraRig.jsx'
import Rooms from '../rooms/Rooms.jsx'
import { FabricationProvider } from './GalleryFabrication.jsx'

/* One global rig lights the whole building, and it never changes.
   It used to be cross-faded against a duplicate rig owned by the room, which meant the
   corridor re-lit itself every time a door was opened - and because the room's copy lives
   inside the room's placement group, a door on the left of the corridor delivered its key
   light mirrored, swinging the corridor's shading from one wall to the other. The room's
   own character now comes only from its interior fixtures, whose reach stops inside the
   room, so opening a door cannot alter the corridor at all. */
function BuildingLights() {
  return <>
    <ambientLight intensity={.30} />
    <hemisphereLight intensity={.56} color="#fff3df" groundColor="#3e3932" />
    <directionalLight position={[5.25, 11, 7]} intensity={1.82} color="#fff0d8" />
  </>
}

export default function HomeScene({enabled=true}){return <>
  <color attach="background" args={['#c9c1b4']}/>
  <fog attach="fog" args={['#c9c1b4',26,94]}/>
  <BuildingLights />
  <FabricationProvider><Corridor animate={enabled}/><Rooms/></FabricationProvider>
  <CameraRig enabled={enabled}/>
</>}
