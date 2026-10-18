import { useEffect,useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { AIRPORT_RUNWAY,AIRPORT_PLANES } from './airportPlan.js'
import { airportPhysicalMaterial } from './airportMaterials.js'

const none=()=>null
export default function AirportGround(){
  const owned=useMemo(()=>{
    const groups=new Map()
    const add=(role,x,z,w,d,y=.18)=>{
      const g=new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2).translate(x,y,z)
      if(!groups.has(role))groups.set(role,[]);groups.get(role).push(g)
    }
    const r=AIRPORT_RUNWAY
    add('shoulder',r.x,r.z,r.w+10,r.d+8,.08)
    add('asphalt',r.x,r.z,r.w,r.d,.18)
    add('asphalt',-720,674,606,12,.18)
    add('asphalt',-720,691,12,40,.18)
    add('concrete',-730,641,215,42,.19)
    add('asphalt',-720,621,12,110,.18)
    for(let x=-1030;x<=-410;x+=18)add('white',x,710,7,.22,.20)
    for(const side of [-1,1])add('white',r.x,710+side*11.8,r.w-10,.2,.20)
    for(const x of [-1040,-400])for(const side of [-1,1])for(let k=0;k<4;k++)add('white',x,710+side*(2.8+k*1.8),17,.85,.20)
    for(const plane of AIRPORT_PLANES){
      add('yellow',plane.x,645,.12,18,.21);add('yellow',plane.x,636.5,8,.12,.21)
      for(const s of [-1,1])add('yellow',plane.x+s*7.5,646,.12,12,.21)
    }
    add('yellow',-720,674,580,.12,.20)
    const colors={shoulder:'#4a4b3c',asphalt:'#343a3b',concrete:'#8b918f',white:'#c2bfb0',yellow:'#b3a249'}
    const meshes=[...groups].map(([role,list])=>{
      const geometry=mergeGeometries(list);list.forEach(g=>g.dispose())
      const source=new THREE.MeshPhysicalMaterial({color:colors[role],roughness:role==='asphalt'?.97:.86})
      const material=airportPhysicalMaterial(source);source.dispose()
      const mesh=new THREE.Mesh(geometry,material);mesh.name=`airfield-ground-${role}`;mesh.raycast=none;return mesh
    })
    return meshes
  },[])
  useEffect(()=>()=>owned.forEach(m=>{m.geometry.dispose();m.material.dispose()}),[owned])
  return <group name="airfield-paving">{owned.map(m=><primitive key={m.uuid} object={m}/>)}</group>
}
