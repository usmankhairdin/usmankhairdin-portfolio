import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const JourneyContext = createContext(null)

export function JourneyProvider({children,initialPhase='gated'}){
  const [activeDoor,setActiveDoor] = useState(null)
  const [phase,setPhase] = useState('corridor') // corridor | room (where the visitor stands)
  const [navigationTarget,setNavigationTarget] = useState(null)
  const [autoMoving,setAutoMoving] = useState(false)
  const [corridorFacing,setCorridorFacing] = useState('forward') // forward | return
  const [experiencePhase,setExperiencePhase] = useState(initialPhase) // gated (out on the roof terrace) | entering (walked in from a click on the door) | inside
  const [navigationOpen,setNavigationOpen] = useState(false)

  // The menu asks to go to a room; the walker walks there (see useCorridorCamera).
  const requestDoor = useCallback((doorId)=>{
    if(!doorId || experiencePhase!=='inside') return
    if(phase==='room' && activeDoor===doorId) return
    setNavigationTarget(doorId)
  },[phase,activeDoor,experiencePhase])

  const value = useMemo(()=>({
    activeDoor,setActiveDoor,phase,setPhase,
    navigationTarget,setNavigationTarget,requestDoor,
    autoMoving,setAutoMoving,corridorFacing,setCorridorFacing,
    experiencePhase,setExperiencePhase,navigationOpen,setNavigationOpen
  }),[activeDoor,phase,navigationTarget,requestDoor,autoMoving,corridorFacing,experiencePhase,navigationOpen])

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export const useJourney = ()=>useContext(JourneyContext)
