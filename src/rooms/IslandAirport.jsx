import { Suspense } from 'react'
import AirportAircraft from './AirportAircraft.jsx'
import AirportBuildings from './AirportBuildings.jsx'
import AirportGround from './AirportGround.jsx'
import { CITY_Y } from './cityPlan.js'
import { AIRPORT_OFFSET,AIRPORT_YAW } from './airportPlan.js'

export default function IslandAirport(){
  return <group name="island-airfield" position={[AIRPORT_OFFSET[0],CITY_Y,AIRPORT_OFFSET[2]]} rotation={[0,AIRPORT_YAW,0]}>
    <AirportGround/>
    <AirportBuildings/>
    <Suspense fallback={null}><AirportAircraft/></Suspense>
  </group>
}
