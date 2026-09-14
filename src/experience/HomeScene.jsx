import Corridor from './Corridor.jsx'
import CameraRig from './CameraRig.jsx'
import Rooms from '../rooms/Rooms.jsx'

export default function HomeScene({enabled=true}){return <>
  <color attach="background" args={['#c9c1b4']}/>
  <fog attach="fog" args={['#c9c1b4',24,92]}/>
  <ambientLight intensity={.42}/>
  <hemisphereLight intensity={.72} color="#fff4df" groundColor="#403a32"/>
  <directionalLight position={[5,8,8]} intensity={2.15} color="#ffe9c7" castShadow shadow-bias={-.00025} shadow-normalBias={.025} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-near={.1} shadow-camera-far={120}/>
  <Corridor/>
  <Rooms/>
  <CameraRig enabled={enabled}/>
</>}
