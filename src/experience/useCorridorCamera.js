import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { doors } from '../data/projects.js'
import { useJourney } from './JourneyContext.jsx'

const MIN_Z=-88
const MAX_Z=12.15
const OUTSIDE_Z=17.25
const INSIDE_START_Z=10.1
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const ease=t=>t*t*(3-2*t)

export default function useCorridorCamera(enabled=true){
  const {camera} = useThree()
  const {
    activeDoor,phase,setPhase,setActiveDoor,
    navigationTarget,setNavigationTarget,
    autoMoving,setAutoMoving,
    corridorFacing,setCorridorFacing,
    experiencePhase,setExperiencePhase
  } = useJourney()

  const targetZ = useRef(INSIDE_START_Z)
  const currentZ = useRef(INSIDE_START_Z)
  const parallax = useRef({x:0,y:0})
  const targetParallax = useRef({x:0,y:0})
  const glance = useRef(0)
  const roomReadyAt = useRef(0)
  const tween = useRef(null)
  const facingRef = useRef('forward')
  const turningRef = useRef(false)
  const turnState = useRef({yaw:0})
  const autoTargetRef = useRef(null)
  const roomEntryState = useRef({z:INSIDE_START_Z,facing:'forward'})
  const roomDoor = doors.find(d=>d.id===activeDoor)

  useEffect(()=>{ facingRef.current=corridorFacing },[corridorFacing])
  useEffect(()=>{ if(phase==='room') roomReadyAt.current=performance.now()+420 },[phase])

  useEffect(()=>{
    if(phase!=='room'||!navigationTarget) return
    if(navigationTarget===activeDoor){ setNavigationTarget(null); return }
    setPhase('exiting')
  },[phase,navigationTarget,activeDoor,setNavigationTarget,setPhase])

  const finishFacing = useCallback((next)=>{
    facingRef.current=next
    setCorridorFacing(next)
    turningRef.current=false
    setAutoMoving(Boolean(autoTargetRef.current))
  },[setCorridorFacing,setAutoMoving])

  const turnTo = useCallback((next,onDone)=>{
    if(turningRef.current || facingRef.current===next){ onDone?.(); return }
    turningRef.current=true
    setAutoMoving(true)
    tween.current?.kill()
    const targetYaw=next==='return'?Math.PI:0
    let startYaw=camera.rotation.y
    if(next==='return' && startYaw<0) startYaw+=Math.PI*2
    if(next==='forward' && startYaw>Math.PI) startYaw-=Math.PI*2
    turnState.current.yaw=startYaw
    const tw=gsap.to(turnState.current,{yaw:targetYaw,duration:1.12,ease:'power3.inOut',onUpdate:()=>{
      camera.position.set(parallax.current.x,1.58+parallax.current.y,currentZ.current)
      camera.rotation.set(-parallax.current.y*.035,turnState.current.yaw,0)
    },onComplete:()=>{
      finishFacing(next)
      onDone?.()
    }})
    tween.current=tw
  },[camera,finishFacing,setAutoMoving])

  /* Smooth intro-door -> corridor camera move. The CSS intro and this physical move overlap,
     so the visitor never jumps from the front screen straight into the hall. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='entering') return
    tween.current?.kill()
    turningRef.current=false
    autoTargetRef.current=null
    setNavigationTarget(null)
    setActiveDoor(null)
    setPhase('corridor')
    setAutoMoving(true)
    facingRef.current='forward'
    setCorridorFacing('forward')
    glance.current=0
    parallax.current={x:0,y:0}
    targetParallax.current={x:0,y:0}
    currentZ.current=OUTSIDE_Z
    targetZ.current=OUTSIDE_Z

    const proxy={z:OUTSIDE_Z,y:1.58,lookZ:11.5}
    const update=()=>{
      currentZ.current=proxy.z
      targetZ.current=proxy.z
      camera.position.set(0,proxy.y,proxy.z)
      camera.lookAt(0,1.50,proxy.lookZ)
    }
    update()

    const tl=gsap.timeline({onComplete:()=>{
      currentZ.current=INSIDE_START_Z
      targetZ.current=INSIDE_START_Z
      camera.position.set(0,1.58,INSIDE_START_Z)
      camera.lookAt(0,1.5,INSIDE_START_Z-9.4)
      setAutoMoving(false)
      setExperiencePhase('inside')
    }})
    tween.current=tl
    tl.to(proxy,{duration:.42,z:15.35,lookZ:10.8,ease:'power2.inOut',onUpdate:update})
      .to(proxy,{duration:.70,z:13.45,lookZ:7.7,ease:'power2.inOut',onUpdate:update},'>-.04')
      .to(proxy,{duration:.92,z:INSIDE_START_Z,lookZ:INSIDE_START_Z-9.4,ease:'power3.out',onUpdate:update},'>-.06')
    return()=>tl.kill()
  },[experiencePhase,camera,setActiveDoor,setAutoMoving,setCorridorFacing,setExperiencePhase,setNavigationTarget,setPhase])

  /* Complete the loop: from the returned corridor state, the entrance door opens and
     the camera physically travels back out to the intro screen. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='exiting') return
    tween.current?.kill()
    turningRef.current=false
    setAutoMoving(true)
    const startZ=currentZ.current
    const proxy={z:startZ,y:camera.position.y,lookZ:startZ+9.5}
    const update=()=>{
      currentZ.current=proxy.z
      targetZ.current=proxy.z
      camera.position.set(0,proxy.y,proxy.z)
      camera.lookAt(0,1.50,proxy.lookZ)
    }
    const tl=gsap.timeline({onComplete:()=>{
      currentZ.current=OUTSIDE_Z
      targetZ.current=OUTSIDE_Z
      setAutoMoving(false)
      setExperiencePhase('intro-return')
    }})
    tween.current=tl
    tl.to(proxy,{duration:.54,z:13.10,lookZ:18.5,ease:'power2.inOut',onUpdate:update})
      .to(proxy,{duration:.72,z:15.35,lookZ:21.0,ease:'power2.inOut',onUpdate:update},'>-.02')
      .to(proxy,{duration:.64,z:OUTSIDE_Z,lookZ:OUTSIDE_Z+8.0,ease:'power3.out',onUpdate:update},'>-.03')
    return()=>tl.kill()
  },[experiencePhase,camera,setAutoMoving,setExperiencePhase])

  const onWheel = useCallback((e)=>{
    if(!enabled || e.defaultPrevented) return

    /* The entrance is genuinely reversible. If the visitor reverses the wheel
       while the camera is still travelling through the centred intro door,
       cancel that forward move and physically travel back out from the exact
       current camera position. */
    if(experiencePhase==='entering') {
      const delta=Math.max(-140,Math.min(140,e.deltaY))
      if(delta < -7){
        e.preventDefault()
        setExperiencePhase('exiting')
      }
      return
    }

    if(experiencePhase!=='inside') return

    /* Forms and other real controls own their wheel events. */
    if(e.target?.closest?.('[data-room-interactive="true"]')) return

    e.preventDefault()
    const delta=Math.max(-140,Math.min(140,e.deltaY))

    if(phase==='corridor'){
      if(turningRef.current || navigationTarget || autoMoving) return

      /* Reversing immediately after the initial entry is also a complete, physical
         exit. Once the camera has travelled back to the entrance wall, one more
         reverse-wheel gesture takes the visitor back through the same door. */
      if(facingRef.current==='forward' && currentZ.current>=MAX_Z-.08 && targetZ.current>=MAX_Z-.02 && delta<-8){
        setExperiencePhase('exiting')
        return
      }

      /* At the returned starting wall, one more forward scroll opens the centre door
         and completes the experience back to the intro screen. */
      if(facingRef.current==='return' && currentZ.current>=MAX_Z-.08 && targetZ.current>=MAX_Z-.02 && delta>8){
        setExperiencePhase('exiting')
        return
      }

      const dir=facingRef.current==='forward'?-1:1
      targetZ.current=clamp(targetZ.current+delta*.0175*dir,MIN_Z,MAX_Z)
      return
    }

    if(phase==='room' && activeDoor==='work') return
    if(phase==='room' && performance.now()>roomReadyAt.current && delta<-7){
      setPhase('exiting')
    }
  },[enabled,experiencePhase,phase,activeDoor,setPhase,navigationTarget,autoMoving,setExperiencePhase])

  const onMove = useCallback((e)=>{
    if(!enabled || experiencePhase!=='inside') return
    targetParallax.current.x=((e.clientX/window.innerWidth)*2-1)*.19
    targetParallax.current.y=-((e.clientY/window.innerHeight)*2-1)*.085
  },[enabled,experiencePhase])

  useEffect(()=>{
    window.addEventListener('wheel',onWheel,{passive:false})
    window.addEventListener('pointermove',onMove,{passive:true})
    return()=>{window.removeEventListener('wheel',onWheel);window.removeEventListener('pointermove',onMove)}
  },[onWheel,onMove])

  /* Room entry stores the exact corridor position + direction. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='inside' || phase!=='entering'||!roomDoor) return
    tween.current?.kill()
    setAutoMoving(true)

    const entryFacing=facingRef.current
    const entryZ=currentZ.current
    roomEntryState.current={z:entryZ,facing:entryFacing}

    const side=roomDoor.side==='right'?1:-1
    const approachOffset=entryFacing==='forward'?2.45:-2.45
    const nearOffset=entryFacing==='forward'?.42:-.42
    const proxy={x:camera.position.x,y:camera.position.y,z:camera.position.z,tx:0,ty:1.55,tz:roomDoor.z}
    const update=()=>{camera.position.set(proxy.x,proxy.y,proxy.z);camera.lookAt(proxy.tx,proxy.ty,proxy.tz)}
    const tl=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{setAutoMoving(false);setPhase('room')}})
    tween.current=tl
    tl.to(proxy,{duration:.48,z:roomDoor.z+approachOffset,x:0,tx:side*2.3,tz:roomDoor.z,onUpdate:update})
      .to(proxy,{duration:.58,z:roomDoor.z+nearOffset,x:side*.52,tx:side*4.45,tz:roomDoor.z,onUpdate:update},'>-.04')
      .to(proxy,{duration:.90,x:side*5.55,z:roomDoor.z,tx:side*10.65,tz:roomDoor.z,onUpdate:update})
      .to(proxy,{duration:.52,x:side*7.02,y:1.58,tx:side*11.30,ty:1.72,tz:roomDoor.z,onUpdate:update})
    return()=>tl.kill()
  },[experiencePhase,phase,activeDoor,roomDoor,camera,setPhase,setAutoMoving])

  /* Room exit is the exact reverse spatial state: same Z, same facing, same mirrored journey. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='inside' || phase!=='exiting'||!roomDoor) return
    tween.current?.kill()
    setAutoMoving(true)
    const side=roomDoor.side==='right'?1:-1
    const restore=roomEntryState.current
    const restoreFacing=restore.facing || 'forward'
    const restoreZ=restore.z
    const nearOffset=restoreFacing==='forward'?.42:-.42
    const lookZ=restoreZ+(restoreFacing==='forward'?-9.4:9.4)

    const proxy={x:camera.position.x,y:camera.position.y,z:camera.position.z,tx:side*11.30,ty:1.72,tz:roomDoor.z}
    const update=()=>{camera.position.set(proxy.x,proxy.y,proxy.z);camera.lookAt(proxy.tx,proxy.ty,proxy.tz)}
    const tl=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{
      currentZ.current=restoreZ
      targetZ.current=restoreZ
      glance.current=0
      facingRef.current=restoreFacing
      setCorridorFacing(restoreFacing)
      camera.position.set(0,1.58,restoreZ)
      camera.lookAt(0,1.50,lookZ)
      setActiveDoor(null)
      setPhase('corridor')
      setAutoMoving(Boolean(navigationTarget))
    }})
    tween.current=tl
    tl.to(proxy,{duration:.50,x:side*5.5,tx:side*8.5,tz:roomDoor.z,onUpdate:update})
      .to(proxy,{duration:.84,x:side*.48,z:roomDoor.z+nearOffset,tx:0,tz:lookZ,onUpdate:update})
      .to(proxy,{duration:.60,x:0,z:restoreZ,tx:0,ty:1.50,tz:lookZ,onUpdate:update})
    return()=>tl.kill()
  },[experiencePhase,phase,activeDoor,roomDoor,camera,setActiveDoor,setPhase,setAutoMoving,setCorridorFacing,navigationTarget])

  useEffect(()=>{
    if(!navigationTarget){ autoTargetRef.current=null; return }
    autoTargetRef.current=navigationTarget
  },[navigationTarget])

  useFrame((_,dt)=>{
    if(!enabled || experiencePhase!=='inside' || phase!=='corridor' || turningRef.current) return

    const navDoor=navigationTarget?doors.find(d=>d.id===navigationTarget):null
    let navZ=null
    if(navDoor){
      const travelDir=navDoor.z<currentZ.current?'forward':'return'
      navZ=navDoor.z+(travelDir==='forward'?2.72:-2.72)
      if(facingRef.current!==travelDir){
        turnTo(travelDir)
        return
      }
      setAutoMoving(true)
      targetZ.current=clamp(navZ,MIN_Z,MAX_Z)
    }

    const zSmooth=1-Math.exp(-(navDoor?5.2:8.2)*dt)
    const lookSmooth=1-Math.exp(-6.0*dt)
    currentZ.current=THREE.MathUtils.lerp(currentZ.current,targetZ.current,zSmooth)
    parallax.current.x=THREE.MathUtils.lerp(parallax.current.x,targetParallax.current.x,1-Math.exp(-6.5*dt))
    parallax.current.y=THREE.MathUtils.lerp(parallax.current.y,targetParallax.current.y,1-Math.exp(-6.5*dt))

    const z=currentZ.current
    let desiredGlance=0,nearest=null,best=999
    doors.forEach(d=>{const dist=Math.abs(z-d.z);if(dist<best){best=dist;nearest=d}})
    if(nearest&&best<8.2){
      const side=nearest.side==='right'?1:-1
      const proximity=ease(1-best/8.2)
      desiredGlance=side*proximity*1.62
    }
    glance.current=THREE.MathUtils.lerp(glance.current,desiredGlance,lookSmooth)
    camera.position.set(parallax.current.x,1.58+parallax.current.y,z)
    const lookZ=facingRef.current==='forward'?z-9.4:z+9.4
    camera.lookAt(glance.current+parallax.current.x*.16,1.50+parallax.current.y*.42,lookZ)

    if(navDoor && navZ!==null && Math.abs(currentZ.current-navZ)<.055){
      autoTargetRef.current=null
      setNavigationTarget(null)
      setAutoMoving(false)
      setActiveDoor(navDoor.id)
      setPhase('entering')
      return
    }

    if(!navDoor && facingRef.current==='forward' && currentZ.current<=MIN_Z+.08 && targetZ.current<=MIN_Z+.01){
      targetZ.current=MIN_Z
      currentZ.current=MIN_Z
      turnTo('return')
    }
  })

  return {targetZ,currentZ}
}
