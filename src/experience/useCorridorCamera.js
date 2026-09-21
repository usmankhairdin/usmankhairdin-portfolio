import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { doors } from '../data/projects.js'
import { useJourney } from './JourneyContext.jsx'
import useReducedMotion from './useReducedMotion.js'
import { motionEase } from './doorSystem.js'
import { ROOM_CAMERA_X } from '../rooms/roomCoordinates.js'

const MIN_Z=-90.2
const MAX_Z=12.15
const OUTSIDE_Z=17.25
const INSIDE_START_Z=10.1
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const ease=t=>t*t*(3-2*t)
const shortestTurn=(from,to)=>{
  let delta=(to-from)%(Math.PI*2)
  if(delta>Math.PI) delta-=Math.PI*2
  if(delta<-Math.PI) delta+=Math.PI*2
  return delta
}
const moveTowards=(value,target,maxDelta)=>{
  if(Math.abs(target-value)<=maxDelta) return target
  return value+Math.sign(target-value)*maxDelta
}

export default function useCorridorCamera(enabled=true){
  const {camera} = useThree()
  const {
    activeDoor,phase,setPhase,setActiveDoor,
    navigationTarget,setNavigationTarget,
    autoMoving,setAutoMoving,
    corridorFacing,setCorridorFacing,
    experiencePhase,setExperiencePhase,navigationOpen
  } = useJourney()
  const reducedMotion=useReducedMotion()
  const controlsEnabled=enabled&&!navigationOpen

  const targetZ = useRef(INSIDE_START_Z)
  const currentZ = useRef(INSIDE_START_Z)
  const zVelocity = useRef(0)
  const parallax = useRef({x:0,y:0})
  const targetParallax = useRef({x:0,y:0})
  const glance = useRef(0)
  const roomReadyAt = useRef(0)
  const touchY = useRef(null)
  const tween = useRef(null)
  const facingRef = useRef('forward')
  const turningRef = useRef(false)
  const autoTargetRef = useRef(null)
  const navigationSettle = useRef({doorId:null,elapsed:0})
  const roomEntryState = useRef({z:INSIDE_START_Z,facing:'forward'})
  const lookRig = useRef(new THREE.PerspectiveCamera())
  const curvePosition = useRef(new THREE.Vector3())
  const curveLook = useRef(new THREE.Vector3())
  const roomDoor = doors.find(d=>d.id===activeDoor)

  const applyCurvePose = useCallback((positionCurve, lookCurve, progress) => {
    positionCurve.getPointAt(progress, curvePosition.current)
    lookCurve.getPointAt(progress, curveLook.current)
    camera.position.copy(curvePosition.current)
    lookRig.current.position.copy(curvePosition.current)
    lookRig.current.lookAt(curveLook.current)
    camera.quaternion.copy(lookRig.current.quaternion)
    return curvePosition.current
  }, [camera])

  /* Doorway moves aim procedurally instead of following a second spline. The aim is
     always carried a set distance in front of the camera and swung from the heading it
     already has to the heading of the room, so it can never pass through the camera and
     invert the view - the one thing that threw a single-frame whip at the threshold. */
  const applyDoorwayPose = useCallback((positionCurve, progress, aim) => {
    positionCurve.getPointAt(progress, curvePosition.current)
    const swing = motionEase(progress)
    const yaw = aim.yaw + aim.turn * swing
    const lead = aim.lead + (aim.leadEnd - aim.lead) * swing
    curveLook.current.set(
      curvePosition.current.x + Math.sin(yaw) * lead,
      aim.height + (aim.heightEnd - aim.height) * swing,
      curvePosition.current.z - Math.cos(yaw) * lead,
    )
    camera.position.copy(curvePosition.current)
    lookRig.current.position.copy(curvePosition.current)
    lookRig.current.lookAt(curveLook.current)
    camera.quaternion.copy(lookRig.current.quaternion)
    return curvePosition.current
  }, [camera])

  /* The camera's live heading and the distance it is already aiming at, so a doorway
     move always begins from exactly the pose that is on screen. */
  const readAim = useCallback((lead) => {
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    return {
      yaw: Math.atan2(dir.x, -dir.z),
      height: camera.position.y + dir.y * lead,
      lead,
    }
  }, [camera])

  useEffect(()=>{ facingRef.current=corridorFacing },[corridorFacing])
  useEffect(()=>{ if(!autoMoving && !navigationTarget) zVelocity.current=0 },[autoMoving,navigationTarget])
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

    // Slerp the actual current camera quaternion instead of rebuilding an Euler yaw.
    // This preserves the tiny door glance/parallax already on screen and removes the
    // one-frame orientation snap that can happen when a user reverses direction.
    const startQ=camera.quaternion.clone()
    const startParallax={...parallax.current}
    const startGlance=glance.current
    const targetObject=new THREE.PerspectiveCamera()
    targetObject.position.set(0,1.58,currentZ.current)
    const targetLookZ=next==='forward'?currentZ.current-9.4:currentZ.current+9.4
    targetObject.lookAt(0,1.50,targetLookZ)
    const endQ=targetObject.quaternion.clone()
    const proxy={p:0}
    const tw=gsap.to(proxy,{p:1,duration:reducedMotion?.01:1.24,ease:motionEase,onUpdate:()=>{
      parallax.current.x=THREE.MathUtils.lerp(startParallax.x,0,proxy.p)
      parallax.current.y=THREE.MathUtils.lerp(startParallax.y,0,proxy.p)
      glance.current=THREE.MathUtils.lerp(startGlance,0,proxy.p)
      camera.position.set(parallax.current.x,1.58+parallax.current.y,currentZ.current)
      camera.quaternion.slerpQuaternions(startQ,endQ,proxy.p)
    },onComplete:()=>{
      parallax.current={x:0,y:0}
      targetParallax.current={x:0,y:0}
      glance.current=0
      camera.position.set(0,1.58,currentZ.current)
      camera.quaternion.copy(endQ)
      finishFacing(next)
      onDone?.()
    }})
    tween.current=tw
  },[camera,finishFacing,setAutoMoving,reducedMotion])

  useEffect(()=>()=>tween.current?.kill(),[])
  useEffect(()=>{ if(!controlsEnabled) touchY.current=null },[controlsEnabled])

  /* One continuous spline carries the camera through the entrance. A single progress
     tween removes the velocity breaks that multi-stage camera tweens can introduce. */
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
    zVelocity.current=0

    const posCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,1.58,OUTSIDE_Z),
      new THREE.Vector3(0,1.575,15.55),
      new THREE.Vector3(0,1.58,13.55),
      new THREE.Vector3(0,1.58,11.70),
      new THREE.Vector3(0,1.58,INSIDE_START_Z),
    ],false,'centripetal',.5)
    const lookCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,1.50,11.55),
      new THREE.Vector3(0,1.50,9.70),
      new THREE.Vector3(0,1.50,6.10),
      new THREE.Vector3(0,1.50,3.40),
      new THREE.Vector3(0,1.50,INSIDE_START_Z-9.4),
    ],false,'centripetal',.5)
    const proxy={p:0}
    const update=()=>{
      const pos=applyCurvePose(posCurve,lookCurve,proxy.p)
      currentZ.current=pos.z
      targetZ.current=pos.z
    }
    update()
    const tw=gsap.to(proxy,{p:1,duration:reducedMotion?.01:2.18,ease:motionEase,onUpdate:update,onComplete:()=>{
      applyCurvePose(posCurve,lookCurve,1)
      currentZ.current=INSIDE_START_Z
      targetZ.current=INSIDE_START_Z
      setAutoMoving(false)
      setExperiencePhase('inside')
    }})
    tween.current=tw
    return()=>tw.kill()
  },[experiencePhase,camera,setActiveDoor,setAutoMoving,setCorridorFacing,setExperiencePhase,setNavigationTarget,setPhase,reducedMotion,applyCurvePose])

  /* The return journey is the same continuous motion in reverse spatial logic. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='exiting') return
    tween.current?.kill()
    turningRef.current=false
    zVelocity.current=0
    setAutoMoving(true)
    const start=new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z)
    const posCurve=new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(0,1.58,Math.max(start.z,11.65)),
      new THREE.Vector3(0,1.58,13.55),
      new THREE.Vector3(0,1.575,15.55),
      new THREE.Vector3(0,1.58,OUTSIDE_Z),
    ],false,'centripetal',.5)
    const exitDir=new THREE.Vector3()
    camera.getWorldDirection(exitDir)
    const currentLook=camera.position.clone().add(exitDir.multiplyScalar(9.4))
    const lookCurve=new THREE.CatmullRomCurve3([
      currentLook,
      new THREE.Vector3(0,1.50,18.0),
      new THREE.Vector3(0,1.50,20.0),
      new THREE.Vector3(0,1.50,22.0),
      new THREE.Vector3(0,1.50,OUTSIDE_Z+8.0),
    ],false,'centripetal',.5)
    const proxy={p:0}
    const update=()=>{
      const pos=applyCurvePose(posCurve,lookCurve,proxy.p)
      currentZ.current=pos.z
      targetZ.current=pos.z
    }
    const tw=gsap.to(proxy,{p:1,duration:reducedMotion?.01:1.96,ease:motionEase,onUpdate:update,onComplete:()=>{
      applyCurvePose(posCurve,lookCurve,1)
      currentZ.current=OUTSIDE_Z
      targetZ.current=OUTSIDE_Z
      setAutoMoving(false)
      setExperiencePhase('intro-return')
    }})
    tween.current=tw
    return()=>tw.kill()
  },[experiencePhase,camera,setAutoMoving,setExperiencePhase,reducedMotion,applyCurvePose])


  const applyTravelDelta = useCallback((rawDelta, eventTarget) => {
    const delta=Math.max(-140,Math.min(140,rawDelta))

    if(experiencePhase==='entering') {
      if(delta < -7){ setExperiencePhase('exiting'); return true }
      return false
    }
    if(experiencePhase!=='inside') return false
    if(eventTarget?.closest?.('[data-room-interactive="true"]')) return false

    if(phase==='corridor'){
      if(turningRef.current || navigationTarget || autoMoving) return true
      if(facingRef.current==='forward' && currentZ.current>=MAX_Z-.08 && targetZ.current>=MAX_Z-.02 && delta<-8){
        setExperiencePhase('exiting'); return true
      }
      if(facingRef.current==='return' && currentZ.current>=MAX_Z-.08 && targetZ.current>=MAX_Z-.02 && delta>8){
        setExperiencePhase('exiting'); return true
      }
      const dir=facingRef.current==='forward'?-1:1
      targetZ.current=clamp(targetZ.current+delta*.0175*dir,MIN_Z,MAX_Z)
      return true
    }

    if(phase==='room' && performance.now()>roomReadyAt.current && delta<-7){
      setPhase('exiting'); return true
    }
    return false
  },[experiencePhase,phase,activeDoor,setPhase,navigationTarget,autoMoving,setExperiencePhase])

  const onWheel = useCallback((e)=>{
    if(!controlsEnabled || e.defaultPrevented) return
    if(applyTravelDelta(e.deltaY,e.target)) e.preventDefault()
  },[controlsEnabled,applyTravelDelta])

  const onTouchStart = useCallback((e)=>{
    if(!controlsEnabled || e.touches.length!==1 || e.target?.closest?.('[data-room-interactive="true"]')) return
    touchY.current=e.touches[0].clientY
  },[controlsEnabled])

  const onTouchMove = useCallback((e)=>{
    if(!controlsEnabled || touchY.current==null || e.touches.length!==1) return
    const y=e.touches[0].clientY
    const delta=(touchY.current-y)*1.35
    if(Math.abs(delta)<1.5) return
    touchY.current=y
    if(applyTravelDelta(delta,e.target)) e.preventDefault()
  },[controlsEnabled,applyTravelDelta])

  const onTouchEnd = useCallback(()=>{ touchY.current=null },[])

  const onMove = useCallback((e)=>{
    if(!controlsEnabled || reducedMotion || experiencePhase!=='inside' || phase!=='corridor' || autoMoving || navigationTarget || turningRef.current) return
    targetParallax.current.x=((e.clientX/window.innerWidth)*2-1)*.19
    targetParallax.current.y=-((e.clientY/window.innerHeight)*2-1)*.085
  },[controlsEnabled,reducedMotion,experiencePhase,phase,autoMoving,navigationTarget])

  useEffect(()=>{
    window.addEventListener('wheel',onWheel,{passive:false})
    window.addEventListener('pointermove',onMove,{passive:true})
    window.addEventListener('touchstart',onTouchStart,{passive:true})
    window.addEventListener('touchmove',onTouchMove,{passive:false})
    window.addEventListener('touchend',onTouchEnd,{passive:true})
    window.addEventListener('touchcancel',onTouchEnd,{passive:true})
    return()=>{
      window.removeEventListener('wheel',onWheel)
      window.removeEventListener('pointermove',onMove)
      window.removeEventListener('touchstart',onTouchStart)
      window.removeEventListener('touchmove',onTouchMove)
      window.removeEventListener('touchend',onTouchEnd)
      window.removeEventListener('touchcancel',onTouchEnd)
    }
  },[onWheel,onMove,onTouchStart,onTouchMove,onTouchEnd])

  /* Room entry and exit are one continuous centripetal spline each. Because the room now
     stands behind the door that was chosen, the same relative path serves every door: the
     control points are expressed in the active door's own terms (its z, its side of the
     corridor and the direction of travel), so a mirrored door produces a mirrored move of
     identical quality instead of a different route.

     The route is a spline; where the camera looks is solved rather than splined, so the
     aim stays a set distance ahead of the move and swings once, evenly, into the room. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='inside' || phase!=='entering'||!roomDoor) return
    tween.current?.kill()
    zVelocity.current=0
    setAutoMoving(true)

    const entryFacing=facingRef.current
    const entryZ=currentZ.current
    roomEntryState.current={z:entryZ,facing:entryFacing}
    const side=roomDoor.side==='right'?1:-1
    const travel=entryFacing==='forward'?1:-1
    const doorZ=roomDoor.z
    const approachOffset=travel*2.55
    const nearOffset=travel*.52

    const posCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z),
      new THREE.Vector3(0,1.58,doorZ+approachOffset),
      new THREE.Vector3(side*.38,1.58,doorZ+nearOffset),
      new THREE.Vector3(side*2.25,1.59,doorZ),
      new THREE.Vector3(side*5.15,1.59,doorZ),
      new THREE.Vector3(side*ROOM_CAMERA_X,1.58,doorZ),
    ],false,'centripetal',.5)
    const aim={...readAim(9.4),turn:0,leadEnd:4.28,heightEnd:1.72}
    aim.turn=shortestTurn(aim.yaw,side*Math.PI/2)
    const proxy={p:0}
    const update=()=>applyDoorwayPose(posCurve,proxy.p,aim)
    const tw=gsap.to(proxy,{p:1,duration:reducedMotion?.01:2.34,ease:motionEase,onUpdate:update,onComplete:()=>{
      applyDoorwayPose(posCurve,1,aim)
      setAutoMoving(false)
      setPhase('room')
    }})
    tween.current=tw
    return()=>tw.kill()
  },[experiencePhase,phase,activeDoor,roomDoor,camera,setPhase,setAutoMoving,reducedMotion,applyDoorwayPose,readAim])

  /* The exit is the same move read backwards: out through the same opening, into the
     same corridor position the visitor left from, with the aim leading the retreat so the
     turn back down the corridor stays continuous. */
  useLayoutEffect(()=>{
    if(experiencePhase!=='inside' || phase!=='exiting'||!roomDoor) return
    tween.current?.kill()
    zVelocity.current=0
    setAutoMoving(true)
    const side=roomDoor.side==='right'?1:-1
    const restore=roomEntryState.current
    const restoreFacing=restore.facing || 'forward'
    const restoreZ=restore.z
    const travel=restoreFacing==='forward'?1:-1
    const doorZ=roomDoor.z
    const nearOffset=travel*.52

    const posCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z),
      new THREE.Vector3(side*5.0,1.59,doorZ),
      new THREE.Vector3(side*2.1,1.59,doorZ),
      new THREE.Vector3(side*.36,1.58,doorZ+nearOffset),
      new THREE.Vector3(0,1.58,restoreZ),
    ],false,'centripetal',.5)
    const aim={...readAim(4.28),turn:0,leadEnd:9.4,heightEnd:1.50}
    aim.turn=shortestTurn(aim.yaw,travel===1?0:Math.PI)
    const proxy={p:0}
    const update=()=>applyDoorwayPose(posCurve,proxy.p,aim)
    const tw=gsap.to(proxy,{p:1,duration:reducedMotion?.01:2.18,ease:motionEase,onUpdate:update,onComplete:()=>{
      applyDoorwayPose(posCurve,1,aim)
      currentZ.current=restoreZ
      targetZ.current=restoreZ
      glance.current=0
      facingRef.current=restoreFacing
      setCorridorFacing(restoreFacing)
      setActiveDoor(null)
      setPhase('corridor')
      setAutoMoving(Boolean(navigationTarget))
    }})
    tween.current=tw
    return()=>tw.kill()
  },[experiencePhase,phase,activeDoor,roomDoor,camera,setActiveDoor,setPhase,setAutoMoving,setCorridorFacing,navigationTarget,reducedMotion,applyDoorwayPose,readAim])


  useEffect(()=>{
    if(!navigationTarget){ autoTargetRef.current=null; return }
    autoTargetRef.current=navigationTarget
    navigationSettle.current={doorId:navigationTarget,elapsed:0}
    targetParallax.current={x:0,y:0}
    setAutoMoving(true)
  },[navigationTarget,setAutoMoving])

  useFrame((_,dt)=>{
    if(!controlsEnabled || experiencePhase!=='inside' || phase!=='corridor' || turningRef.current) return

    const navDoor=navigationTarget?doors.find(d=>d.id===navigationTarget):null
    let navZ=null
    if(navDoor){
      const travelDir=navDoor.z<currentZ.current?'forward':'return'
      navZ=navDoor.z+(travelDir==='forward'?2.72:-2.72)
      if(facingRef.current!==travelDir){
        turnTo(travelDir)
        return
      }
      targetZ.current=clamp(navZ,MIN_Z,MAX_Z)
    }

    const frameDt=Math.min(dt,.05)
    const distance=targetZ.current-currentZ.current
    if(reducedMotion){
      currentZ.current=targetZ.current
      zVelocity.current=0
    }else{
      const maxSpeed=navDoor?22:10
      const acceleration=navDoor?16:28
      const braking=navDoor?19:32
      const stoppingSpeed=Math.sqrt(Math.max(0,2*braking*Math.abs(distance)))
      const desiredSpeed=Math.sign(distance)*Math.min(maxSpeed,stoppingSpeed,Math.abs(distance)*(navDoor?4.2:7.5))
      zVelocity.current=moveTowards(zVelocity.current,desiredSpeed,acceleration*frameDt)
      const step=zVelocity.current*frameDt
      if(Math.abs(step)>=Math.abs(distance)){
        currentZ.current=targetZ.current
        zVelocity.current=0
      }else currentZ.current+=step
    }
    let navigationArrived=false
    if(navDoor && navZ!==null && Math.abs(currentZ.current-navZ)<.035 && Math.abs(zVelocity.current)<.16){
      currentZ.current=navZ
      targetZ.current=navZ
      zVelocity.current=0
      if(navigationSettle.current.doorId!==navDoor.id) navigationSettle.current={doorId:navDoor.id,elapsed:0}
      navigationSettle.current.elapsed+=frameDt
      navigationArrived=true
    }else if(navDoor) navigationSettle.current.elapsed=0

    const lookSmooth=1-Math.exp(-7.2*frameDt)
    parallax.current.x=reducedMotion?0:THREE.MathUtils.lerp(parallax.current.x,targetParallax.current.x,1-Math.exp(-5.8*frameDt))
    parallax.current.y=reducedMotion?0:THREE.MathUtils.lerp(parallax.current.y,targetParallax.current.y,1-Math.exp(-5.8*frameDt))

    const z=currentZ.current
    let desiredGlance=0
    const nearest=doors.reduce((winner,d)=>{
      if(!winner) return d
      return Math.abs(z-d.z)<Math.abs(z-winner.z)?d:winner
    },null)
    const best=nearest?Math.abs(z-nearest.z):Infinity
    if(!navDoor&&nearest&&best<5.8){
      const side=nearest.side==='right'?1:-1
      const proximity=ease(1-best/5.8)
      desiredGlance=side*proximity*1.05
    }
    glance.current=THREE.MathUtils.lerp(glance.current,desiredGlance,lookSmooth)
    camera.position.set(parallax.current.x,1.58+parallax.current.y,z)
    const lookZ=facingRef.current==='forward'?z-9.4:z+9.4
    lookRig.current.position.copy(camera.position)
    lookRig.current.lookAt(glance.current+parallax.current.x*.16,1.50+parallax.current.y*.42,lookZ)
    camera.quaternion.slerp(lookRig.current.quaternion,lookSmooth)

    if(navigationArrived && (reducedMotion || navigationSettle.current.elapsed>=.12)){
      autoTargetRef.current=null
      navigationSettle.current={doorId:null,elapsed:0}
      setNavigationTarget(null)
      setAutoMoving(false)
      setActiveDoor(navDoor.id)
      setPhase('entering')
      return
    }

    if(!navDoor && facingRef.current==='forward' && currentZ.current<=MIN_Z+.08 && targetZ.current<=MIN_Z+.01){
      targetZ.current=MIN_Z
      currentZ.current=MIN_Z
      zVelocity.current=0
      turnTo('return')
    }
  })

  return {targetZ,currentZ}
}
