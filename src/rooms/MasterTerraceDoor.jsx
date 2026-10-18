import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MASTER_TERRACE_DOOR as D, terraceDoor, terraceDoorPose } from '../experience/terraceDoor.js'
import { roomLit } from './referenceRooms.js'

const noRay = () => null
function Lever({ material, face, leverRef, width }) {
  return <group position={[width-.29,1.08,face*.045]}>
    <mesh material={material} rotation={[Math.PI/2,0,0]} raycast={noRay}><cylinderGeometry args={[.045,.045,.022,20]}/></mesh>
    <group ref={leverRef}>
      <mesh material={material} position={[0,0,face*.038]} rotation={[Math.PI/2,0,0]} raycast={noRay}><cylinderGeometry args={[.014,.014,.07,12]}/></mesh>
      <mesh material={material} position={[.095,0,face*.07]} rotation={[0,0,Math.PI/2]} raycast={noRay}><cylinderGeometry args={[.014,.014,.21,16]}/></mesh>
      <mesh material={material} position={[.2,0,face*.07]} raycast={noRay}><sphereGeometry args={[.014,12,8]}/></mesh>
    </group>
  </group>
}

// Room-local placement cancels the room's quarter turn, leaving a world XY
// leaf. A positive hinge turn swings outward onto the clear rear terrace.
export default function MasterTerraceDoor({ glass }) {
  const hinge=useRef(),frontLever=useRef(),backLever=useRef()
  const metal=useMemo(()=>roomLit(new THREE.MeshStandardMaterial({color:'#9e8357',metalness:.78,roughness:.3,envMapIntensity:.35}),.75),[])
  const dark=useMemo(()=>roomLit(new THREE.MeshStandardMaterial({color:'#252724',metalness:.65,roughness:.42}),.6),[])
  const leafW=D.width-.08,leafH=D.height-.065
  const pane=useMemo(()=>{
    const g=new THREE.PlaneGeometry(leafW-.04,leafH-.04)
    const p=g.attributes.position,uv=g.attributes.uv
    for(let i=0;i<p.count;i++)uv.setXY(i,(D.x-D.width/2+.04+leafW/2+p.getX(i)+12)/24,(D.floor+.025+leafH/2+p.getY(i)-.03)/5.7)
    return g
  },[leafW,leafH])
  useFrame(()=>{
    const pose=terraceDoorPose(terraceDoor.progress)
    if(hinge.current)hinge.current.rotation.y=pose.angle
    if(frontLever.current)frontLever.current.rotation.z=pose.handle
    if(backLever.current)backLever.current.rotation.z=pose.handle
  })
  useEffect(()=>()=>{metal.dispose();dark.dispose();pane.dispose()},[metal,dark,pane])
  return <group name="master-room-terrace-door" position={[D.roomX,D.floor,D.x]} rotation={[0,-Math.PI/2,0]}>
    {[-1,1].map(side=><mesh key={side} material={metal} position={[side*(D.width/2+.012),D.height/2,0]} raycast={noRay}><boxGeometry args={[D.frame,D.height,.08]}/></mesh>)}
    <mesh material={metal} position={[0,D.height+.01,0]} raycast={noRay}><boxGeometry args={[D.width+.07,.045,.08]}/></mesh>
    {/* The thin flush saddle spans the original floor/deck joint without a step. */}
    <mesh material={metal} position={[0,.001,-.085]} rotation={[-Math.PI/2,0,0]} raycast={noRay}><planeGeometry args={[D.width,.24]}/></mesh>
    <group ref={hinge} position={[-D.width/2+.04,0,.008]}>
      <mesh geometry={pane} material={glass} position={[leafW/2,.025+leafH/2,0]} raycast={noRay} renderOrder={4}/>
      {[0,leafW].map(x=><mesh key={x} material={metal} position={[x,.025+leafH/2,0]} raycast={noRay}><boxGeometry args={[.03,leafH,.045]}/></mesh>)}
      {[.025,.025+leafH].map(y=><mesh key={y} material={metal} position={[leafW/2,y,0]} raycast={noRay}><boxGeometry args={[leafW,.03,.045]}/></mesh>)}
      {[.3,1.38,2.45].map(y=><mesh key={y} material={dark} position={[0,y,0]} raycast={noRay}><cylinderGeometry args={[.022,.022,.12,16]}/></mesh>)}
      <Lever material={metal} face={1} leverRef={frontLever} width={leafW}/>
      <Lever material={metal} face={-1} leverRef={backLever} width={leafW}/>
    </group>
  </group>
}
