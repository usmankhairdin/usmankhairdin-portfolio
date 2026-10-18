import { islandDistance, ISLAND_WORLD_BOUNDS } from './islandLand.js'
import { islandRenderedTerrainHeight } from './islandTerrainMesh.js'
import { galleryPlotContains, gallerySeaViewContains } from './gallerySite.js'
import { isAirportReserved } from './airportPlan.js'
import { settlementRoadAt, settlementCells } from './settlementPlan.js'
import { settlementWoodlandWeight } from './settlementEcology.js'

export const TREE_TRIANGLE_BUDGET=4200000
export const TREE_DRAW_DISTANCE=2100
const plans=new WeakMap()
const hash=(x,z,salt=0)=>{const v=Math.sin(x*127.1+z*311.7+salt*71.3)*43758.5453;return v-Math.floor(v)}
const boxDistance=(x,z,b)=>{
  const dx=x-b.x,dz=z-b.z,c=Math.cos(b.yaw||0),s=Math.sin(b.yaw||0)
  return Math.hypot(Math.max(0,Math.abs(c*dx-s*dz)-b.w/2),Math.max(0,Math.abs(s*dx+c*dz)-b.d/2))
}

export function createIslandTreePlan(layout){
  if(plans.has(layout))return plans.get(layout)
  const trees=[],buildings=[...(layout.boxes||[]),...(layout.rounds||[])].filter(b=>b.y===0)
  const planted=new Map(),buildingCells=new Map(),cellKey=(x,z)=>`${x},${z}`
  for(const b of buildings){
    const c=Math.abs(Math.cos(b.yaw||0)),s=Math.abs(Math.sin(b.yaw||0)),ex=(c*b.w+s*b.d)/2,ez=(s*b.w+c*b.d)/2
    for(let x=Math.floor((b.x-ex-40)/80);x<=Math.floor((b.x+ex+40)/80);x++)for(let z=Math.floor((b.z-ez-40)/80);z<=Math.floor((b.z+ez+40)/80);z++){
      const key=cellKey(x,z);if(!buildingCells.has(key))buildingCells.set(key,[]);buildingCells.get(key).push(b)
    }
  }
  const add=(x,z,h,width,kind,salt)=>{
    const radius=h*width*.65
    if(islandDistance(x,z)+radius>=-190||galleryPlotContains(x,z,radius+8)||gallerySeaViewContains(x,z,radius)||isAirportReserved(x,z,radius+5))return false
    // Canopies may lightly overhang a pavement; the street and the central
    // crown remain clear, and roots never occupy a carriageway or foundation.
    if(settlementRoadAt(x,z,Math.max(2.5,radius*.65)))return false
    for(const b of buildingCells.get(cellKey(Math.floor(x/80),Math.floor(z/80)))||[])if(boxDistance(x,z,b)<=radius+.75)return false
    const cx=Math.floor(x/64),cz=Math.floor(z/64)
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const t of planted.get(cellKey(cx+dx,cz+dz))||[]){
      const woodland=['edge','grove'].includes(kind)&&['edge','grove'].includes(t.kind)
      const spacing=woodland ? .34 : kind==='park'&&t.kind==='park' ? .43 : .58
      if(Math.hypot(t.x-x,t.z-z)<(t.radius+radius)*spacing)return false
    }
    const tree={x,z,y:islandRenderedTerrainHeight(x,z),h,width,radius,kind,crown:Math.floor(hash(x,z,salt+3)*6),yaw:hash(x,z,salt+4)*Math.PI*2,tint:hash(x,z,salt+5)}
    trees.push(tree)
    const key=cellKey(cx,cz);if(!planted.has(key))planted.set(key,[]);planted.get(key).push(tree)
    return true
  }
  // A loose mix of young and established trees occupies street setbacks.
  // Offsets are independent in world space, so lamps do not produce a second
  // exact row of equally spaced stems beside the carriageway.
  for(const [i,t] of (layout.trees||[]).entries()){
    if(hash(t.x,t.z,4)>.58)continue
    for(let k=0;k<3;k++)add(t.x+(hash(t.x+i,t.z,k+12)-.5)*34,t.z+(hash(t.x,t.z+i,k+19)-.5)*34,5.5+hash(t.x,t.z,k+23)*8,.7+hash(t.x,t.z,k+29)*.25,'boulevard',i+k+11)
  }
  // Broad woodland fingers grow through the inhabited district before its
  // smaller planted gardens. They follow land ecology across block boundaries;
  // actual curved roads and building footprints carve their own clearings.
  const {minX,maxX,minZ,maxZ}=ISLAND_WORLD_BOUNDS
  for(let i=0;i<130000;i++){
    const x=minX+hash(i,1,221)*(maxX-minX),z=minZ+hash(i,2,222)*(maxZ-minZ),d=islandDistance(x,z)
    if(d>-405)continue
    const woodland=settlementWoodlandWeight(x,z)
    if(woodland<.32||hash(i,5,225)>.35+woodland*.65)continue
    const h=17+woodland*9+hash(i,3,223)*12,width=.75+hash(i,4,224)*.35
    add(x,z,h,width,'grove',226)
  }
  // Park crowns spill beyond former square cells into unbuilt neighboring
  // clearings. Actual roads and homes form their boundaries; the old lattice
  // does not. Unequal overlapping clouds avoid circular planted islands too.
  for(const cell of settlementCells().values()){
    const count=cell.park?200:90
    for(let i=0;i<count;i++){
      const cluster=i%3,gx=(hash(cell.m,cell.n,150+cluster)-.5)*48,gz=(hash(cell.m,cell.n,160+cluster)-.5)*48
      const angle=hash(cell.m+i,cell.n,170)*Math.PI*2,r=Math.sqrt(-2*Math.log(Math.max(1e-6,hash(cell.m,cell.n+i,171))))
      const spread=(cell.park?19:14)+hash(cell.m,cell.n,175+cluster)*14,aspect=.62+hash(cell.m,cell.n,180+cluster)*.7
      const x=cell.x+gx+Math.cos(angle)*r*spread,z=cell.z+gz+Math.sin(angle)*r*spread*aspect
      const h=(cell.park?14:10)+hash(cell.m+i,cell.n,172)*(cell.park?15:16),width=.68+hash(cell.m,cell.n+i,173)*.3
      add(x,z,h,width,'park',180+i)
    }
  }
  // Independent irregular garden clusters replace mirrored rows at x/z=0 and
  // +/- .34 of every house. The clearance predicate still protects full crowns.
  for(const [i,b] of buildings.entries()){
    if(b.h>90)continue
    const spread=12+Math.min(18,Math.max(b.w,b.d)*.32),phase=hash(b.x,b.z,31)*Math.PI*2
    for(let k=0;k<75;k++){
      const angle=hash(b.x+i,b.z,k+40)*Math.PI*2+phase,r=Math.sqrt(-2*Math.log(Math.max(1e-6,hash(b.x,b.z+i,k+120))))
      const x=b.x+Math.cos(angle)*r*spread+(hash(b.x,b.z,29)-.5)*b.w,z=b.z+Math.sin(angle)*r*spread*.82+(hash(b.x,b.z,30)-.5)*b.d
      if(boxDistance(x,z,b)>28)continue
      const h=5.5+hash(b.x+k,b.z,8)*19,width=.65+hash(b.x,b.z+k,13)*.31
      add(x,z,h,width,'building',i+k+41)
    }
  }
  // World-space rejection sampling follows the actual irregular shoreline rather
  // than the street warp or a rectangular seed lattice. Multiple rows overlap
  // across a deep belt, leaving the dry beach and gallery sea opening intact.
  for(let i=0;i<50000;i++){
    const x=minX+hash(i,1,201)*(maxX-minX),z=minZ+hash(i,2,202)*(maxZ-minZ),d=islandDistance(x,z)
    if(d>-222||d<-580)continue
    const ecology=.5+.5*Math.sin(x*.009+Math.sin(z*.007)*1.6)*Math.cos(z*.008-x*.003)
    const h=24+ecology*8+hash(i,3,203)*10,width=.88+hash(i,4,204)*.3
    add(x,z,h,width,'edge',205)
  }
  plans.set(layout,trees)
  return trees
}

// Residency ignores viewing direction. Turning away from a close tree must not
// spend its geometry budget on a different tree still in view. Distance margins
// and a resident preference also protect the selection against small gait bob.
export function selectIslandTreeResidency(trees,eye,costs,previous,budget=TREE_TRIANGLE_BUDGET){
  if(costs[0].length>=3){
    const resident=new Uint8Array(trees.length),ranked=[]
    for(let i=0;i<trees.length;i++){
      const t=trees[i],distance=Math.hypot(t.x-eye.x,t.z-eye.z,t.y+t.h*.5-eye.y)
      if(distance>Math.max(280,t.h*23)+(previous?.[i]?15:0))continue
      ranked.push({i,distance,score:distance/t.h-(previous?.[i] ? .08 : 0)})
    }
    ranked.sort((a,b)=>a.score-b.score||a.i-b.i)
    let triangles=0,near=0,middle=0
    for(const {i,distance} of ranked){
      const tier=costs[0].length===4?(distance<trees[i].h*4&&near<2?1:distance<trees[i].h*7&&middle<3?2:3):(distance<trees[i].h*9&&near<2?1:2)
      const cost=costs[trees[i].crown][tier-1]
      if(triangles+cost>Math.min(640000,budget*.3))continue
      resident[i]=tier;triangles+=cost;if(tier===1)near++;if(tier===2)middle++
    }
    return resident
  }
  const resident=new Uint8Array(trees.length),ranked=[]
  for(let i=0;i<trees.length;i++){
    const t=trees[i],distance=Math.hypot(t.x-eye.x,t.z-eye.z,t.y+t.h*.5-eye.y)
    if(distance>(previous?.[i]===1?235:210))continue
    ranked.push({i,score:distance-(previous?.[i]===1?12:0)})
  }
  ranked.sort((a,b)=>a.score-b.score||a.i-b.i)
  let triangles=0,near=0
  for(const {i} of ranked){
    if(near>=24)break
    const cost=costs[trees[i].crown][0]
    if(triangles+cost>Math.min(72000,budget))continue
    resident[i]=1;triangles+=cost;near++
  }
  return resident
}

// 0=cull, 1=source detail, 2=curved middle leaves, 3=full branch clusters,
// 4=compact full-scan distant grove. Reserve the
// complete nearby tier even behind the camera, so rotation cannot reduce the
// far allowance. Existing visible silhouettes keep their slots; new trees use
// spare capacity instead of making the visible forest reshuffle during a pan.
export function selectIslandTreeDetail(trees,eye,visible,costs,previous,budget=TREE_TRIANGLE_BUDGET,residency){
  const state=new Uint8Array(trees.length),ranked=[]
  const resident=residency||selectIslandTreeResidency(trees,eye,costs,previous,budget)
  let triangles=0
  for(let i=0;i<trees.length;i++)if(resident[i])triangles+=costs[trees[i].crown][resident[i]-1]
  for(let i=0;i<trees.length;i++){
    if(!visible[i])continue
    const t=trees[i],distance=Math.hypot(t.x-eye.x,t.z-eye.z,t.y+t.h*.5-eye.y)
    if(distance>TREE_DRAW_DISTANCE)continue
    if(resident[i])state[i]=resident[i]
    else ranked.push({i,distance})
  }
  const far=costs[0].length
  const tierFor=entry=>far===4?(entry.distance<trees[entry.i].h*13?3:4):far===3&&entry.distance<trees[entry.i].h*12?2:far
  const retained=i=>far===4&&previous?.[i]>=3&&previous[i]<=far
  ranked.sort((a,b)=>(retained(b.i)?1:0)-(retained(a.i)?1:0)||(tierFor(b)===far?1:0)-(tierFor(a)===far?1:0)||(previous?.[b.i]===far?1:0)-(previous?.[a.i]===far?1:0)||(trees[b.i].kind==='edge'?1:0)-(trees[a.i].kind==='edge'?1:0)||a.distance-b.distance||a.i-b.i)
  if(far===4){
    // Established visible crowns keep their detail through a turn. New trees
    // first receive a whole compact canopy; spare triangles then improve branch
    // contours instead of leaving gaps through the connected woodland fingers.
    for(const {i} of ranked)if(retained(i)){
      const cost=costs[trees[i].crown][previous[i]-1]
      if(triangles+cost>budget)continue
      state[i]=previous[i];triangles+=cost
    }
    for(const {i} of ranked)if(!retained(i)){
      const cost=costs[trees[i].crown][3]
      if(triangles+cost>budget)continue
      state[i]=4;triangles+=cost
    }
    const upgrades=ranked.filter(entry=>!retained(entry.i)&&state[entry.i]===4&&tierFor(entry)===3)
      .sort((a,b)=>a.distance/trees[a.i].h-b.distance/trees[b.i].h||a.i-b.i)
    for(const {i} of upgrades){
      const extra=costs[trees[i].crown][2]-costs[trees[i].crown][3]
      if(triangles+extra>budget)continue
      state[i]=3;triangles+=extra
    }
    return state
  }
  for(const {i,distance} of ranked){
    const tier=tierFor({i,distance}),cost=costs[trees[i].crown][tier-1]
    if(triangles+cost>budget)continue
    state[i]=tier;triangles+=cost
  }
  return state
}
