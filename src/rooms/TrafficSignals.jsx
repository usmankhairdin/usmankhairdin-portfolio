import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mountTrafficSignalMeshes, originalSignalState } from './trafficSignals.js'

/** Custom definitions and phase callbacks let both immersive city surfaces share the heads. */
export default function TrafficSignals({traffic,signals=traffic.signals,ground=-96,stateAt=originalSignalState}) {
  const root=useRef(),visual=useRef()
  useFrame(()=>{if(root.current?.parent?.visible)visual.current?.update(traffic.time)})
  useEffect(()=>{
    const mounted=mountTrafficSignalMeshes(root.current,signals,ground,stateAt)
    visual.current=mounted
    return ()=>{
      if(visual.current===mounted) visual.current=null
      mounted.dispose()
    }
  },[signals,ground,stateAt])
  return <group ref={root} dispose={null}/>
}
