import * as THREE from 'three'
import { AVENUES, NEAR_STREETS, STREETS, BLOCK, avenueOf, streetOf, streetD, worldZ, lightState } from './cityPlan.js'
import { settlementJunctions } from './settlementPlan.js'
import { settlementWarpPoint, settlementWarpDirection } from './settlementWarp.js'
import { islandRenderedTerrainHeight } from './islandTerrainMesh.js'

export function createOriginalSignals() {
  const signals=[]
  for(let m=AVENUES.from;m<=AVENUES.to;m++) for(let n=-NEAR_STREETS;n<=STREETS;n++) {
    signals.push({id:`${m}:${n}`,m,n,x:m*BLOCK,z:worldZ(streetD(n)),avenueHalf:avenueOf(m).half,streetHalf:streetOf(n).half,laneSide:-1})
  }
  return signals
}

export const originalSignalState=(time,signal,axis)=>lightState(time,signal.m,signal.n,axis==='x'?'x':'d')
export const settlementSignalState=originalSignalState
export const createSettlementSignals=()=>settlementJunctions().filter(junction=>junction.degree>=3).map(junction=>({...junction,laneSide:-1,settlement:true}))

// An effect setup owns its meshes. Replayed setup creates new resources after cleanup.
export function mountTrafficSignalMeshes(root,signals,ground,stateAt) {
  const visual=buildTrafficSignalMeshes(signals,ground,stateAt)
  root.add(visual.group)
  const dispose=visual.dispose
  visual.dispose=()=>{root.remove(visual.group);dispose()}
  return visual
}

/** Four kerb-side mast arms, hooded three-aspect heads, and correctly facing lenses. */
export function buildTrafficSignalMeshes(signals,ground=-96,stateAt=originalSignalState) {
  const group=new THREE.Group(),heads=[],matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0)
  group.name='traffic-signals'
  for(const signal of signals) for(const [axis,dir] of [['x',1],['x',-1],['z',1],['z',-1]]) {
    if(signal.settlement&&!(axis==='x'?(dir>0?signal.west:signal.east):(dir>0?signal.south:signal.north)))continue
    let yaw=axis==='x'?-dir*Math.PI/2:dir>0?Math.PI:0
    const laneSide=signal.laneSide??1
    const cx=signal.settlement?signal.sourceX:signal.x,cz=signal.settlement?signal.sourceZ:signal.z
    const sourceX=cx+(axis==='x'?-dir*(signal.avenueHalf+5.5):-dir*laneSide*(signal.avenueHalf+.8))
    const sourceZ=cz+(axis==='x'?dir*laneSide*(signal.streetHalf+.8):-dir*(signal.streetHalf+5.5))
    const sourceNormal=[Math.sin(yaw),Math.cos(yaw)]
    const sourceHX=axis==='x'?sourceX:cx-dir*laneSide*3.5,sourceHZ=axis==='z'?sourceZ:cz+dir*laneSide*3.5
    const pole=signal.settlement?settlementWarpPoint(sourceX,sourceZ):{x:sourceX,z:sourceZ}
    const head=signal.settlement?settlementWarpPoint(sourceHX,sourceHZ):{x:sourceHX,z:sourceHZ}
    const facing=signal.settlement?settlementWarpDirection(sourceHX,sourceHZ,...sourceNormal):{x:sourceNormal[0],z:sourceNormal[1]}
    const length=Math.hypot(facing.x,facing.z),normal=[facing.x/length,facing.z/length]
    yaw=Math.atan2(normal[0],normal[1])
    heads.push({signal,axis,dir,yaw,x:pole.x,z:pole.z,hx:head.x,hz:head.z,normal,sourceX,sourceZ,sourceHX,sourceHZ,sourceNormal,state:null})
  }
  const metal=new THREE.MeshBasicMaterial({color:'#30383b',fog:false}),black=new THREE.MeshBasicMaterial({color:'#080b0c',fog:false}),lensMaterial=new THREE.MeshBasicMaterial({color:'white',toneMapped:false,fog:false})
  const postGeometry=new THREE.CylinderGeometry(.11,.15,1,8),boxGeometry=new THREE.BoxGeometry(1,1,1)
  const lensGeometry=new THREE.CircleGeometry(.15,16),hoodGeometry=new THREE.CylinderGeometry(.205,.205,.28,12,1,true)
  hoodGeometry.rotateX(Math.PI/2)
  const make=(geometry,material,count)=>{const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.frustumCulled=false;mesh.raycast=()=>null;group.add(mesh);return mesh}
  const poles=make(postGeometry,metal,heads.length),arms=make(boxGeometry,metal,heads.length),boxes=make(boxGeometry,black,heads.length),hoods=make(hoodGeometry,black,heads.length*3),lenses=make(lensGeometry,lensMaterial,heads.length*3)
  const put=(mesh,index,x,y,z,yaw,sx,sy,sz)=>{position.set(x,y,z);rotation.setFromAxisAngle(up,yaw);scale.set(sx,sy,sz);matrix.compose(position,rotation,scale);mesh.setMatrixAt(index,matrix)}
  heads.forEach((h,i)=>{
    const baseGround=ground+(h.signal.settlement?islandRenderedTerrainHeight(h.x,h.z):0)
    put(poles,i,h.x,baseGround+3.4,h.z,0,1,6.8,1)
    const armX=h.hx-h.x,armZ=h.hz-h.z
    put(arms,i,(h.x+h.hx)/2,baseGround+6.7,(h.z+h.hz)/2,Math.atan2(-armZ,armX),Math.max(.16,Math.hypot(armX,armZ)),.16,.16)
    put(boxes,i,h.hx,baseGround+5.96,h.hz,h.yaw,.57,1.35,.3)
    for(let level=0;level<3;level++) {
      const y=baseGround+6.34-level*.38,index=i*3+level
      put(hoods,index,h.hx+h.normal[0]*.23,y,h.hz+h.normal[1]*.23,h.yaw,1,1,1)
      put(lenses,index,h.hx+h.normal[0]*.166,y,h.hz+h.normal[1]*.166,h.yaw,1,1,1)
    }
  })
  for(const mesh of group.children) mesh.instanceMatrix.needsUpdate=true
  const states=['red','amber','green'],lit=[new THREE.Color().setRGB(2.2,.035,.012),new THREE.Color().setRGB(2.2,.68,.015),new THREE.Color().setRGB(.015,1.65,.35)],dim=[new THREE.Color().setRGB(.035,.003,.002),new THREE.Color().setRGB(.025,.012,.002),new THREE.Color().setRGB(.002,.02,.006)]
  const update=time=>{
    let changed=false
    heads.forEach((head,i)=>{
      const state=stateAt(time,head.signal,head.axis)
      if(state===head.state)return
      head.state=state;changed=true
      for(let level=0;level<3;level++) lenses.setColorAt(i*3+level,states[level]===state?lit[level]:dim[level])
    })
    if(changed&&lenses.instanceColor) lenses.instanceColor.needsUpdate=true
  }
  update(0)
  const dispose=()=>{group.children.forEach(mesh=>mesh.dispose());for(const resource of [postGeometry,boxGeometry,lensGeometry,hoodGeometry,metal,black,lensMaterial])resource.dispose();group.clear()}
  return {group,heads,update,dispose}
}
