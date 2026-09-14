import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const JourneyContext = createContext(null)

export function JourneyProvider({children}){
  const [activeDoor,setActiveDoor] = useState(null)
  const [phase,setPhase] = useState('corridor') // corridor | entering | room | exiting
  const [navigationTarget,setNavigationTarget] = useState(null)
  const [autoMoving,setAutoMoving] = useState(false)
  const [corridorFacing,setCorridorFacing] = useState('forward') // forward | return
  const [experiencePhase,setExperiencePhase] = useState('gated') // gated | entering | inside | exiting | intro-return

  const requestDoor = useCallback((doorId)=>{
    if(!doorId || experiencePhase!=='inside') return
    if(phase==='room' && activeDoor===doorId) return
    setNavigationTarget(doorId)
    if(phase==='room' && activeDoor && activeDoor!==doorId) setPhase('exiting')
  },[phase,activeDoor,experiencePhase])

  const value = useMemo(()=>({
    activeDoor,setActiveDoor,phase,setPhase,
    navigationTarget,setNavigationTarget,requestDoor,
    autoMoving,setAutoMoving,corridorFacing,setCorridorFacing,
    experiencePhase,setExperiencePhase
  }),[activeDoor,phase,navigationTarget,requestDoor,autoMoving,corridorFacing,experiencePhase])

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export const useJourney = ()=>useContext(JourneyContext)
