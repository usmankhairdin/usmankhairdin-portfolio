import { useMemo } from 'react'
import Corridor from './Corridor.jsx'
import CameraRig from './CameraRig.jsx'
import Rooms from '../rooms/Rooms.jsx'
import { FabricationProvider } from './GalleryFabrication.jsx'
import { ReflectionPass } from './CorridorAtmosphere.jsx'
import NightSky from './NightSky.jsx'
import CityView from '../rooms/CityView.jsx'

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

/* The far corridor falls away into deep navy, so the lit pieces along it read as a sequence
   of reveals; the fog only begins well beyond any room's depth, so the rooms read as before. */
export default function HomeScene({enabled=true}){
  const reflectionScale = useMemo(() => (window.matchMedia?.('(max-width: 760px), (pointer: coarse)').matches ? .35 : .5), [])
  return <>
    <color attach="background" args={['#05070c']}/>
    <NightSky/>
    <fog attach="fog" args={['#0b0e17',30,124]}/>
    <BuildingLights />
    <FabricationProvider><Corridor animate={enabled}/><Rooms/></FabricationProvider>
    <CityView/>
    <CameraRig enabled={enabled}/>
    <ReflectionPass scale={reflectionScale} />
  </>
}
