import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {addAfterEffect,useFrame,useThree} from '@react-three/fiber'
import * as THREE from 'three'
import {useJourney} from '../experience/JourneyContext.jsx'
import {look,lookCapture,stopFallbackLook} from '../experience/freeLook.js'
import {claimSceneClick,followLink,linkAtPoint} from './linkTargets.js'
import {floorReflection} from '../experience/floorReflection.js'
import {canShowWebsite,websiteContainsPoint,websiteHitClip,websiteProjection,websiteTransform} from './liveScreenGeometry.js'
import {createScreenSession} from './liveScreenSession.js'
import {canFocusWebsite,createScreenFocus,websiteReviewPose} from './liveScreenFocus.js'
import {workRoomProjects} from './workRoomProjects.js'
import {createWebsiteReadiness} from './liveScreenReadiness.js'
import {prepareLiveWebsites,attachPreparedWebsite} from './liveWebsitePreload.js'

const Context=createContext(null)
export const useLiveScreens=()=>useContext(Context)

export function LiveScreensProvider({children,preloadReady=true}){
  const navigate=useNavigate(),reviewLink=useRef(()=>null)
  const entries=useRef(new Map()),controls=useRef(()=>{}),suppressClick=useRef(false)
  const align=useRef(()=>{}),focus=useMemo(createScreenFocus,[])
  const session=useMemo(createScreenSession,[]),[active,setActive]=useState(null)
  const resumeCaptured=useRef(false)
  const readiness=useMemo(()=>createWebsiteReadiness(workRoomProjects.filter(p=>p.embedUrl).map(p=>p.slug)),[])
  const preloadLayer=useRef(null),prepared=useRef(new Map())
  useEffect(()=>{
    if(!preloadReady)return
    const websites=prepareLiveWebsites(workRoomProjects,preloadLayer.current,readiness)
    prepared.current=websites.entries
    return()=>{websites.dispose();prepared.current=new Map()}
  },[readiness,preloadReady])
  const {activeDoor,phase,navigationOpen}=useJourney()
  const close=useCallback(({gesture=false}={})=>{
    const previous=session.exit()
    if(!previous)return
    // Demote only the interactive LED. Every website keeps running beneath
    // the depth-tested canvas, without raising another wall's iframe.
    controls.current(false);setActive(null)
    focus.exit()
    entries.current.get(previous)?.frame?.blur()
    // Request within the outside click's activation, while the camera returns.
    // Input remains held until that animation completes.
    if(gesture&&resumeCaptured.current&&!look.cursorFree)lookCapture.request?.()
    resumeCaptured.current=false
  },[session,focus])
  const activate=useCallback(id=>{
    if(activeDoor!=='work'||phase!=='room'||navigationOpen||!entries.current.has(id))return
    if(focus.holding&&!session.active)return
    if(!entries.current.get(id).canActivate?.())return
    if(!session.enter(id,{explicit:true}))return
    entries.current.get(id).hitReady=false
    resumeCaptured.current=look.locked
    lookCapture.release?.('review')
    stopFallbackLook();look.locked=false
    if(!look.cursorFree){look.targetYaw=look.yaw;look.targetPitch=look.pitch}
    look.vYaw=look.vPitch=0
    document.body.classList.remove('looking','look-aim','link-hover')
    align.current(id);controls.current(true);setActive(id)
    return true
  },[activeDoor,phase,navigationOpen,session,focus])
  useEffect(()=>{if(activeDoor!=='work'||phase!=='room'||navigationOpen)close()},[activeDoor,phase,navigationOpen,close])
  useEffect(()=>{
    let linkPress=null
    const down=e=>{
      if(e.button!==0)return
      linkPress=null
      if(!session.active){suppressClick.current=false;return}
      if(e.target.closest?.('.live-project-screen'))return
      const entry=entries.current.get(session.active)
      if((!entry?.hitReady||e.target.tagName==='CANVAS')&&entry?.containsPoint?.(e.clientX,e.clientY))return
      // Links and native controls own the release click. Dismissing on down
      // would swallow navigation or turn a cancelled drag into a page visit.
      if(e.target.closest?.('a,button,input,select,textarea,[role="button"]'))return
      const route=reviewLink.current(e)
      if(route){linkPress={route,x:e.clientX,y:e.clientY,id:e.pointerId,moved:0};return}
      suppressClick.current=true;close({gesture:true});e.preventDefault();e.stopImmediatePropagation()
    }
    const click=e=>{
      if(suppressClick.current){
        suppressClick.current=false;e.preventDefault();e.stopImmediatePropagation();return
      }
      if(!session.active||e.target.closest?.('.live-project-screen'))return
      if(e.target.closest?.('a,button,input,select,textarea,[role="button"]')){close();return}
      const route=reviewLink.current(e)
      if(route||linkPress){
        const press=linkPress;linkPress=null
        claimSceneClick(e);e.preventDefault();e.stopImmediatePropagation()
        if(press&&route===press.route&&press.moved<=4&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<=4){close();followLink(route,navigate)}
      }
    }
    const move=e=>{if(linkPress&&e.pointerId===linkPress.id)linkPress.moved=Math.max(linkPress.moved,Math.hypot(e.clientX-linkPress.x,e.clientY-linkPress.y))}
    const cancel=()=>{suppressClick.current=false;linkPress=null}
    const wheel=e=>{
      // Native iframe wheel stays in its document; outside wheel never walks.
      if(session.active){e.preventDefault();e.stopImmediatePropagation()}
    }
    document.addEventListener('pointerdown',down,true);document.addEventListener('click',click,true)
    document.addEventListener('pointercancel',cancel,true)
    document.addEventListener('pointermove',move,true)
    window.addEventListener('wheel',wheel,{capture:true,passive:false})
    return()=>{
      document.removeEventListener('pointerdown',down,true);document.removeEventListener('click',click,true)
      document.removeEventListener('pointercancel',cancel,true)
      document.removeEventListener('pointermove',move,true)
      window.removeEventListener('wheel',wheel,true)
    }
  },[close,session,navigate])
  const value=useMemo(()=>({entries,controls,align,focus,session,readiness,preloadLayer,prepared,reviewLink,active,activate,close}),[session,focus,readiness,active,activate,close])
  return <Context.Provider value={value}><div className="live-screen-layer" aria-label="Work Room live websites" ref={preloadLayer}/>{children}</Context.Provider>
}

// Live LEDs use depth-tested apertures; the floor reflection retains its capture.
export function LiveProjectSurface({project,width,height,position}){
  const {entries}=useLiveScreens(),mesh=useRef()
  useEffect(()=>{
    const entry={project,width,height,mesh:mesh.current,loaded:false,object:null,dispose:null}
    entries.current.set(project.slug,entry);floorReflection.hidden.add(mesh.current)
    return()=>{entry.dispose?.();entries.current.delete(project.slug);floorReflection.hidden.delete(entry.mesh)}
  },[entries,project,width,height])
  return <mesh ref={mesh} position={position} visible={false} raycast={()=>null}>
    <planeGeometry args={[width,height]}/>
    <meshBasicMaterial color="#000000" opacity={0} transparent={false} blending={THREE.NoBlending} depthWrite toneMapped={false}/>
  </mesh>
}

export function LiveScreenLayer(){
  const {gl,size,camera,scene}=useThree(),{entries,controls,align,focus,session,preloadLayer:layer,prepared,reviewLink,active,close}=useLiveScreens()
  const {activeDoor,phase}=useJourney()
  useEffect(()=>{
    const canvas=gl.domElement,root=canvas.closest('.experience-root'),wrapper=canvas.closest('.experience-canvas')
    const canvasPointer=canvas.style.pointerEvents,wrapperPointer=wrapper?.style.pointerEvents
    reviewLink.current=e=>{
      const rect=canvas.getBoundingClientRect()
      return linkAtPoint(scene,camera,e.clientX-rect.left,e.clientY-rect.top,rect.width,rect.height)
    }
    controls.current=on=>{
      root.toggleAttribute('data-live-review',on)
      canvas.style.pointerEvents=on?'none':canvasPointer
      if(wrapper)wrapper.style.pointerEvents=on?'none':wrapperPointer
      for(const entry of entries.current.values())if(entry.object){
        const interactive=on&&focus.ready&&session.active===entry.project.slug
        entry.object.element.toggleAttribute('data-interactive',interactive)
        entry.object.element.style.pointerEvents=interactive?'auto':'none'
        entry.frame.tabIndex=interactive?0:-1
        entry.object.element.style.clipPath=interactive?'inset(50%)':'none'
      }
    }
    return()=>{
      for(const entry of entries.current.values())entry.dispose?.()
      controls.current(false);controls.current=()=>{}
      reviewLink.current=()=>null
    }
  },[gl,entries,controls,session,focus,scene,camera,reviewLink])
  useEffect(()=>{
    if(!active)return
    let pose=null,projection=null
    const token=session.version
    return addAfterEffect(()=>{
      if(!session.matches(active,token))return
      if(!focus.ready)return
      const entry=entries.current.get(session.active)
      if(!entry?.object||!entry.loaded)return
      const moved=!pose||!pose.equals(camera.matrixWorld)
      if(!entry.hitReady||moved||!projection?.equals(camera.projectionMatrix)){
        const entering=!entry.hitReady
        entry.object.element.style.clipPath=websiteHitClip(gl,entry.mesh,entry.width,entry.height,camera)
        entry.hitReady=true;pose=camera.matrixWorld.clone();projection=camera.projectionMatrix.clone()
        entry.object.element.style.visibility='visible'
        if(entering)entry.frame.focus({preventScroll:true})
      }
    })
  },[active,camera,entries,gl,session,focus])
  useFrame((_,dt)=>{
    if(!layer.current)return
    focus.step(Math.min(dt,.1))
    align.current=id=>{
      const entry=entries.current.get(id)
      entry.mesh.updateWorldMatrix(true,false)
      focus.enter(camera,websiteReviewPose(entry.mesh,entry.width,entry.height,camera))
    }
    const inRoom=activeDoor==='work'&&phase==='room'
    // Websites start after scene readiness and remain mounted for the visit.
    // Turning around or leaving the room must never reload the opposite wall.
    for(const entry of entries.current.values()){
      const mesh=entry.mesh
      entry.canActivate=()=>{
        mesh.updateWorldMatrix(true,false)
        return entry.loaded&&canFocusWebsite(mesh,entry.width,camera)
      }
      entry.containsPoint=(x,y)=>{
        mesh.updateWorldMatrix(true,false)
        return websiteContainsPoint(websiteProjection(mesh.matrixWorld,entry.width,entry.height,camera,size.width,size.height),x,y)
      }
      mesh.visible=true;mesh.updateWorldMatrix(true,false)
      const visible=canShowWebsite(mesh,camera,inRoom)
      mesh.visible=false
      if(!visible&&session.active===entry.project.slug)close()
      const website=prepared.current.get(entry.project.slug)
      if(!website)continue
      if(!entry.object){
        attachPreparedWebsite(entry,website,new THREE.Matrix4())
      }
      entry.loaded=website.loaded
      const matrix=websiteProjection(mesh.matrixWorld,entry.width,entry.height,camera,size.width,size.height,entry.object.matrix)
      entry.object.element.style.transform=websiteTransform(matrix)
      const interactive=focus.ready&&session.active===entry.project.slug
      if(interactive&&!entry.wasInteractive)entry.object.element.style.clipPath='inset(50%)'
      entry.wasInteractive=interactive
      entry.object.element.toggleAttribute('data-interactive',interactive)
      entry.object.element.style.pointerEvents=interactive?'auto':'none'
      entry.frame.tabIndex=interactive?0:-1
      if(!interactive)entry.object.element.style.clipPath='none'
      entry.object.element.style.visibility=visible&&entry.loaded?'visible':'hidden'
      mesh.visible=visible&&entry.loaded
    }
  })
  return null
}
