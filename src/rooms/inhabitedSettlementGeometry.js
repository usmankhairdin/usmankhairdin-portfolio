import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { islandBuildingGrade } from './terrainPlacement.js'
import { inhabitedAccessPlan } from './inhabitedAccessPlan.js'

const unitBox=new THREE.BoxGeometry(1,1,1).toNonIndexed()
const unitCylinder=new THREE.CylinderGeometry(1,1,1,8).toNonIndexed()
const trim='#d4d2bd',metal='#526568',wood='#594436',concrete='#92958b'
const hash=(n,s=0)=>{const v=Math.sin(n*73.73+s*127.7)*43758.5453;return v-Math.floor(v)}

function roofGeometry(w,d,rise,hip){
  const ridge=hip?Math.max(0,d/2-Math.min(w*.45,d*.36)):d/2
  const p=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[0,rise,-ridge],[0,rise,ridge]]
  const faces=[[0,3,5,4],[1,4,5,2],[3,2,5],[0,4,1],[0,1,2,3]],positions=[]
  const origin=new THREE.Vector3(0,rise*.25,0)
  for(const face of faces)for(let i=1;i<face.length-1;i++){
    const a=new THREE.Vector3(...p[face[0]]),b=new THREE.Vector3(...p[face[i]]),c=new THREE.Vector3(...p[face[i+1]])
    const normal=b.clone().sub(a).cross(c.clone().sub(a)),out=a.clone().add(b).add(c).multiplyScalar(1/3).sub(origin)
    if(normal.dot(out)<0)positions.push(...a.toArray(),...c.toArray(),...b.toArray())
    else positions.push(...a.toArray(),...b.toArray(),...c.toArray())
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals()
  return geometry
}

/** Real solid geometry, in exterior plan coordinates. Windows are recessed
 * behind their frames, gutters meet downpipes and porch posts meet the slab.
 * One color/role batch per spatial tile keeps hundreds of homes inexpensive. */
export function buildInhabitedSiteGeometry(site){
  const grade=islandBuildingGrade(site)
  const access=inhabitedAccessPlan(site)
  const parts=[],matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),siteMatrix=new THREE.Matrix4().makeRotationY(site.yaw)
  siteMatrix.setPosition(site.x,0,site.z)
  const put=(geometry,x,y,z,color,role=0,rotation=0,scale=null)=>{
    const owned=geometry.clone()
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),rotation)
    matrix.compose(new THREE.Vector3(x,y,z),quaternion,scale?new THREE.Vector3(...scale):new THREE.Vector3(1,1,1));owned.applyMatrix4(matrix)
    const count=owned.attributes.position.count,rgb=new THREE.Color(color).toArray(),colors=new Float32Array(count*3)
    for(let i=0;i<count;i++)colors.set(rgb,i*3)
    owned.setAttribute('color',new THREE.BufferAttribute(colors,3))
    owned.setAttribute('settlementRole',new THREE.Float32BufferAttribute(Array(count).fill(role),1))
    owned.setAttribute('settlementDetail',owned.attributes.position.clone())
    // All batches have identical attributes regardless of their source shape.
    owned.deleteAttribute('uv');owned.applyMatrix4(siteMatrix);parts.push(owned)
  }
  const box=(x,y,z,w,h,d,color,role=0,rotation=0)=>put(unitBox,x,y,z,color,role,rotation,[w,h,d])
  const cylinder=(x,y,z,r,h,color,role=11)=>put(unitCylinder,x,y,z,color,role,0,[r,h,r])
  const pitchedRoof=(x,z,w,d,y,rise,shape='gable',rotation=0)=>{
    const geometry=roofGeometry(w,d,rise,shape==='hip')
    put(geometry,x,y,z,site.roofColor,1,rotation);geometry.dispose()
    // Continuous fascia edges and rainwater goods make the eaves tangible.
    if(!rotation){
      for(const side of [-1,1]){
        box(x+side*w/2,y-.05,z,.11,.16,d,trim,2)
        box(x+side*(w/2+.055),y-.04,z,.105,.105,d,metal,11)
      }
      for(const end of [-1,1])box(x,y-.05,z+end*d/2,w,.15,.1,trim,2)
      box(x+w/2+.05,y/2,z-d/2+.13,.09,y,.09,metal,11)
      box(x,y+rise+.025,z,.13,.1,d*(shape==='hip'?.42:1),site.roofColor,1)
    }
  }
  const door=(x,z,yaw=0,width=1.05)=>{
    const c=Math.cos(yaw),s=Math.sin(yaw),point=(dx,dz)=>[x+c*dx+s*dz,z-s*dx+c*dz]
    const frame=(dx,dy,dz,w,h,d,color,role)=>{const [px,pz]=point(dx,dz);box(px,dy,pz,w,h,d,color,role,yaw)}
    frame(0,1.32,0,width+.25,2.4,.16,trim,2)
    frame(0,1.3,.105,width,2.15,.09,wood,5)
    frame(0,2.06,.16,width*.68,.44,.025,'#26434f',3)
    frame(width*.32,1.28,.18,.055,.1,.09,'#ac9b72',11)
    frame(0,.18,.42,width+1.1,.36,.85,concrete,6)
    frame(0,.085,.9,width+1.65,.17,.5,concrete,6)
  }
  const window=(x,y,z,yaw,w=1.2,h=1.45,lit=false)=>{
    const c=Math.cos(yaw),s=Math.sin(yaw),part=(dx,dy,dz,pw,ph,pd,color,role)=>box(x+c*dx+s*dz,y+dy,z-s*dx+c*dz,pw,ph,pd,color,role,yaw)
    part(0,0,0,w+.2,h+.2,.12,'#535b59',11)
    part(0,0,.07,w,h,.025,lit?'#ffce8b':'#42616d',lit?4:3)
    for(const side of [-1,1])part(side*(w+.1)/2,0,.12,.095,h+.2,.15,trim,2)
    for(const end of [-1,1])part(0,end*(h+.1)/2,.12,w+.2,.095,.15,trim,2)
    part(0,0,.125,.055,h,.14,trim,2)
    part(0,-h/2-.16,.23,w+.36,.12,.42,'#a0a394',2)
    if(lit)part(w*.22,0,.09,w*.18,h,.018,'#c4b392',4)
  }
  const windowsOn=(cx,cz,w,d,h,storeys,skipFront=false)=>{
    let serial=0
    for(let floor=0;floor<storeys;floor++){
      const y=.26+(floor+.55)*(h-.24)/storeys
      for(const side of [-1,1]){
        const bays=Math.max(2,Math.floor(w/3.2))
        for(let i=0;i<bays;i++){
          if(skipFront&&side===1&&floor===0)continue
          const x=-w/2+(i+.5)*w/bays
          if(side===1&&floor===0&&Math.abs(x-w*.13)<1.6)continue
          const lit=(serial++===0)||hash(serial,site.seed*50)>.61
          window(cx+x,y,cz+side*(d/2+.03),side===1?0:Math.PI,1.18,1.43,lit)
        }
      }
      for(const side of [-1,1])for(let i=0;i<Math.max(2,Math.floor(d/3.4));i++){
        const bays=Math.max(2,Math.floor(d/3.4)),z=-d/2+(i+.5)*d/bays
        window(cx+side*(w/2+.03),y,cz+z,side*Math.PI/2,1.05,1.35,hash(i+floor*7,site.seed*90)>.66)
      }
    }
  }
  const porch=(x,z,width=3.4)=>{
    const roofY=2.65,depth=2.12
    box(x,.14,z+depth*.43,width+.55,.28,depth+.8,concrete,6)
    for(const side of [-1,1])box(x+side*(width/2-.18),roofY/2,z+depth-.3,.16,roofY,.16,trim,2)
    const geometry=roofGeometry(width+.6,depth+.35,.65,false)
    put(geometry,x,roofY,z+depth*.48,site.roofColor,1);geometry.dispose()
    box(x,roofY-.07,z+depth-.1,width+.6,.19,.15,trim,2)
  }
  const court=(cx,cz,w,d,school=false)=>{
    box(cx,.055,cz,w,.11,d,school?'#47615c':'#5b6c60',7)
    for(const side of [-1,1]){
      box(cx+side*(w/2-.7),.118,cz,.075,.012,d-1.4,'#b5c0b4',10)
      box(cx,.119,cz+side*(d/2-.7),w-1.4,.012,.075,'#b5c0b4',10)
    }
    box(cx,.12,cz,w-1.4,.012,.075,'#c7c7ae',10)
    // A low net, actual posts and exercise benches give the open space scale.
    for(const side of [-1,1]){
      cylinder(cx+side*(w/2-1),.6,cz,.065,1.2,metal)
      box(cx+side*(w/2-1),.46,cz,.045,.72,.045,metal,11)
    }
    for(let i=0;i<9;i++)box(cx+(i-4)*(w-2)/8,.67,cz,.026,.67,.02,'#8d9990',11)
    for(let i=0;i<5;i++)box(cx,.38+i*.14,cz,w-2,.025,.02,'#8d9990',11)
    for(const side of [-1,1]){
      box(cx+side*(w/2-.7),.48,cz-d/2+1.2,2.4,.13,.65,wood,5)
      box(cx+side*(w/2-.7),.25,cz-d/2+1.2,1.8,.5,.12,metal,11)
    }
  }
  const {bodyW:w,bodyD:d,bodyH:h,settlementKind:kind}=site
  if(kind==='court'){
    court(0,access?-.15:0,site.w-1.7,site.d-(access?2.1:1.7))
    // Grounded fence line; no floating perimeter strip.
    for(const side of [-1,1])for(let i=0;i<7;i++){
      if(access&&side===-1&&i===6)continue
      cylinder(side*(site.w/2-.35),.8,(i/6-.5)*(site.d-1),.045,1.6,metal)
    }
  }else if(kind==='school'){
    const bz=-9.9
    box(0,.17,bz,w+.45,.34,d+.45,concrete,6)
    box(0,(h+.26)/2,bz,w,h-.26,d,site.wallColor,0)
    windowsOn(0,bz,w,d,h,site.storeys)
    pitchedRoof(0,bz,w+.9,d+.9,h,site.roofRise,'hip')
    door(w*.13,bz+d/2+.04);porch(w*.13,bz+d/2+.2,4.8)
    court(0,site.d/2-10.1,Math.min(w-1,27),17.5,true)
    box(-w*.37,2.2,bz+d/2+.19,2.3,.85,.12,'#506c70',2)
    // Flagpole and playground bars have tangible connections to the courtyard.
    cylinder(w*.43,2.7,site.d/2-2,.055,5.4,metal)
    box(w*.43-.6,4.85,site.d/2-2,1.15,.55,.025,'#aeb99c',9)
  }else if(kind==='market'){
    const back=-d*.25
    box(0,.13,0,w+.55,.26,d+.8,concrete,6)
    // An open market hall with separate pitched stalls, not an office facade.
    box(0,1.65,back,w,3.3,d*.46,site.wallColor,0)
    pitchedRoof(0,back,w+.6,d*.46+.6,3.3,1.1,'hip')
    for(let i=0;i<4;i++){
      const x=(i-1.5)*w/4,front=d*.29
      box(x,.8,front,w/4-.45,1.6,1.4,wood,5)
      for(const side of [-1,1])box(x+side*(w/8-.22),1.7,front+.7,.1,3.4,.1,metal,11)
      box(x,3.45,front,w/4-.15,.12,3.3,i%2?'#8b7c58':'#657b74',9)
      for(let row=0;row<2;row++)for(let k=0;k<4;k++){
        box(x+(k-1.5)*.62,1.75,front+(row-.5)*.5,.5,.3,.43,['#8c5a3a','#87954d','#b29149'][k%3],9)
      }
      window(x,2.15,back+d*.23+.04,0,1.6,1.3,true)
    }
  }else{
    const villa=kind==='villa',shop=kind==='shop'
    box(0,.16,0,w+.5,.32,d+.5,concrete,6)
    if(villa){
      box(-w*.13,(h+.24)/2,-d*.03,w*.74,h-.24,d*.94,site.wallColor,0)
      box(w*.25,(h+.24)/2,d*.15,w*.5,h-.24,d*.62,site.wallColor,0)
      pitchedRoof(-w*.13,-d*.03,w*.74+.75,d*.94+.7,h,site.roofRise,'gable')
      pitchedRoof(w*.25,d*.15,d*.62+.7,w*.5+.75,h-.2,site.roofRise*.76,'gable',Math.PI/2)
    }else{
      box(0,(h+.24)/2,0,w,h-.24,d,site.wallColor,0)
      if(kind==='townhouse'){
        const units=Math.max(3,Math.round(w/7.5)),unit=w/units
        for(let i=0;i<units;i++){
          const x=(i-(units-1)/2)*unit
          pitchedRoof(x,0,unit+.08,d+.85,h,Math.min(site.roofRise,unit*.38),'gable')
          if(i<units-1)box(x+unit/2,h*.5,d/2+.09,.18,h,.19,'#a3957f',2)
          door(x+unit*.15,d/2+.08,0,.95)
          porch(x+unit*.15,d/2+.2,2.2)
        }
      }else pitchedRoof(0,0,w+.9,d+.9,h,site.roofRise,site.roofShape==='hip'?'hip':'gable')
    }
    if(villa){
      // Each opening follows a real wing elevation. A rectangular window pass
      // around an L-shaped villa leaves windows and the entrance in mid-air.
      // Openings on shared internal faces are buried by the adjoining wing.
      windowsOn(-w*.13,-d*.03,w*.74,d*.94,h,site.storeys)
      windowsOn(w*.25,d*.15,w*.5,d*.62,h,site.storeys)
    }else windowsOn(0,0,w,d,h,site.storeys,shop)
    if(kind!=='townhouse'){
      const front=villa?d*.46:d/2
      door(w*.13,front+.08)
      if(!shop&&kind!=='clinic')porch(w*.13,front+.22,villa?4.2:3.1)
    }
    if(shop){
      const bays=3,bay=w/bays
      for(let i=0;i<bays;i++){
        const x=(i-1)*bay
        window(x,1.55,d/2+.05,0,bay-.65,2.1,true)
        box(x,3.02,d/2+.68,bay-.2,.17,1.7,i%2?'#718479':'#967b60',9)
        box(x,2.83,d/2+1.48,bay-.2,.38,.1,i%2?'#718479':'#967b60',9)
      }
      // Keep the front stair exit clear when this shop is on a graded plot.
      box((access?1:-1)*w*.35,.45,d/2+1.45,1.1,.9,.75,wood,5)
    }
    if(kind==='clinic'){
      box(-w*.28,3.3,d/2+.19,2.4,1.8,.14,'#c7cbbd',2)
      box(-w*.28,3.3,d/2+.28,.35,1.25,.04,'#9b5b53',8)
      box(-w*.28,3.3,d/2+.28,1.2,.35,.04,'#9b5b53',8)
      // A sheltered ambulance / patient drop-off reads from the roof view.
      box(0,2.9,d/2+1.22,w*.62,.15,2.1,'#637778',11)
      for(const side of [-1,1])box(side*w*.29,1.45,d/2+2,.14,2.9,.14,trim,2)
    }
    if(!shop&&site.roofShape!=='hip'){
      const chimneyY=h+site.roofRise*.45
      box(-w*.27,chimneyY,-d*.24,.65,1.6,.8,'#8c7d6c',0)
      box(-w*.27,chimneyY+.85,-d*.24,.85,.15,1.0,concrete,2)
    }
    // Low boundary planters and a front footpath stop each home reading as a
    // disconnected roof dropped on a uniform rectangular city slab.
    const pathW=kind==='townhouse'?w-1:1.65
    box(kind==='townhouse'?0:w*.13,.035,d/2+(access ? .9 : 1.25),pathW,.07,access?1.2:2.0,'#9b9e8c',6)
    for(const side of [-1,1]){
      if(access&&side===-1)continue
      box(side*(w/2-.45),.28,d/2+1.05,.62,.56,1.65,'#8c9480',6)
    }
  }
  // The entire building stays rigid and level. An opaque site foundation
  // reaches below the downhill terrain instead of leaving a floating corner.
  const foundation=(x0,x1,z0,z1)=>{
    if(x1-x0<.01||z1-z0<.01)return
    box((x0+x1)/2,(grade.bottomY-grade.baseY)/2,(z0+z1)/2,x1-x0,grade.baseY-grade.bottomY,z1-z0,'#888d83',12)
  }
  if(access){
    const cut=access.cutout
    // Leave a real recess: no full-height solid box remains behind the lower
    // treads. The exposed inboard edge is the garden's retaining wall.
    foundation(-site.w/2,site.w/2,-site.d/2,cut.z0)
    foundation(-site.w/2,cut.x0,cut.z0,site.d/2)
    foundation(cut.x1,site.w/2,cut.z0,site.d/2)
    for(const step of [access.foot,...access.steps,access.landing]){
      box((step.x0+step.x1)/2,(step.y0+step.y1)/2-grade.baseY,(step.z0+step.z1)/2,step.x1-step.x0,step.y1-step.y0,step.z1-step.z0,'#9b9e91',13)
    }
    const railZ=site.d/2-.13,postSteps=[0,Math.floor((access.steps.length-1)/2),access.steps.length-1]
    for(const i of new Set(postSteps)){
      const step=access.steps[i],x=(step.x0+step.x1)/2
      box(x,step.y1-grade.baseY+.46,railZ,.06,.92,.06,metal,11)
    }
    const first=access.steps[0],last=access.steps.at(-1)
    const a=new THREE.Vector3((first.x0+first.x1)/2,first.y1-grade.baseY+.92,railZ)
    const b=new THREE.Vector3((last.x0+last.x1)/2,last.y1-grade.baseY+.92,railZ)
    const direction=b.clone().sub(a),length=direction.length()
    const rail=new THREE.CylinderGeometry(.035,.035,length,8).toNonIndexed()
    rail.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()))
    const center=a.add(b).multiplyScalar(.5)
    put(rail,center.x,center.y,center.z,metal,11);rail.dispose()
  }else foundation(-site.w/2,site.w/2,-site.d/2,site.d/2)
  const merged=mergeGeometries(parts,false)
  merged.translate(0,grade.baseY,0)
  parts.forEach(part=>part.dispose());merged.computeBoundingBox();merged.computeBoundingSphere()
  return merged
}
