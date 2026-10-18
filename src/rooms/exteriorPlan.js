import { TOWER_TOP, layoutBuildings } from './cityPlan.js'
import { EXTERIOR_OFFSET, galleryPlotContains, gallerySeaViewContains } from './gallerySite.js'
import { ISLAND, ISLAND_SHIFT_X, ISLAND_SHIFT_Z, islandDistance } from './islandLand.js'
import { SETTLEMENT_GRID, settlementCells, settlementDensity, settlementRoadAt, settlementRoadSegments, settlementLampPlan, landscapeHash } from './settlementPlan.js'
import { settlementWarpPoint, settlementWarpYaw, settlementWarpDirection } from './settlementWarp.js'
import { settlementWoodlandWeight } from './settlementEcology.js'
import { inhabitedSite } from './inhabitedSettlementPlan.js'
import { isAirportReserved } from './airportPlan.js'
export { ISLAND, islandDistance, sourceIslandDistance, SOURCE_COAST_GLSL, EXTERIOR_COAST_GLSL } from './islandLand.js'
export const shoreline=()=>ISLAND.coast
let exterior
const FACADE_CLEARANCE=.8

function lotFootprint(parent){
  return {x:parent.x,z:parent.z,w:parent.b.w*parent.scale,d:parent.b.d*parent.scale,yaw:parent.yaw}
}
function sitesSeparated(a,b){
  const ac=Math.cos(a.yaw),as=Math.sin(a.yaw),bc=Math.cos(b.yaw),bs=Math.sin(b.yaw),dx=b.x-a.x,dz=b.z-a.z
  // Separating axes of both rigid lots, expanded by the facade gap. Check
  // complete footprints, since comparing centres misses rotated neighbors.
  for(const [x,z] of [[ac,-as],[as,ac],[bc,-bs],[bs,bc]]){
    const ar=Math.abs(x*ac-z*as)*a.w/2+Math.abs(x*as+z*ac)*a.d/2
    const br=Math.abs(x*bc-z*bs)*b.w/2+Math.abs(x*bs+z*bc)*b.d/2
    if(Math.abs(dx*x+dz*z)>=ar+br+FACADE_CLEARANCE)return true
  }
  return false
}

function lotPoint(parent, x, z) {
  const dx=(x-parent.b.x)*parent.scale,dz=(z-parent.b.z)*parent.scale,c=Math.cos(parent.yaw),s=Math.sin(parent.yaw)
  return {x:parent.x+c*dx+s*dz,z:parent.z-s*dx+c*dz}
}
function placeLotItem(item,parent){
  return {...item,...lotPoint(parent,item.x,item.z),...(item.w?{w:item.w*parent.scale,d:item.d*parent.scale}:{}),yaw:parent.yaw,anchor:[parent.x,parent.z],sourceAnchor:[parent.b.x,parent.b.z],density:parent.density}
}
function lotClear(parent){
  const b=parent.b,w=b.w*parent.scale,d=b.d*parent.scale,radius=Math.hypot(w,d)/2
  if(islandDistance(parent.x,parent.z)+radius>-220||isAirportReserved(parent.x,parent.z,radius+8)||galleryPlotContains(parent.x,parent.z,radius+12)||gallerySeaViewContains(parent.x,parent.z,radius))return false
  // Sample the oriented footprint, including its interior. A curve can pass
  // through a long building without touching any of its four corners.
  for(let ix=0;ix<=Math.ceil(w/5);ix++)for(let iz=0;iz<=Math.ceil(d/5);iz++){
    const x=b.x-b.w/2+b.w*ix/Math.ceil(w/5),z=b.z-b.d/2+b.d*iz/Math.ceil(d/5),p=lotPoint(parent,x,z)
    if(settlementRoadAt(p.x,p.z,2.7))return false
  }
  return true
}

function inhabitedClear(site,occupied){
  const radius=Math.hypot(site.w,site.d)/2
  if(islandDistance(site.x,site.z)+radius>-220||isAirportReserved(site.x,site.z,radius+8)||galleryPlotContains(site.x,site.z,radius+12)||gallerySeaViewContains(site.x,site.z,radius))return false
  if(settlementWoodlandWeight(site.x,site.z)>.78)return false
  const c=Math.cos(site.yaw),s=Math.sin(site.yaw)
  for(let ix=0;ix<=Math.ceil(site.w/4);ix++)for(let iz=0;iz<=Math.ceil(site.d/4);iz++){
    const dx=-site.w/2+site.w*ix/Math.ceil(site.w/4),dz=-site.d/2+site.d*iz/Math.ceil(site.d/4)
    if(settlementRoadAt(site.x+c*dx+s*dz,site.z-s*dx+c*dz,2))return false
  }
  return occupied.every(other=>sitesSeparated(site,other))
}

// Homes address actual retained street edges, including T junctions and long
// merged blocks. Their gardens keep the space of the old full-block buildings.
// Fronts are tangent to the adjoining curved road rather than world axes.
function populateNeighborhoods(result,occupied){
  const roads=settlementRoadSegments(),byId=new Map(roads.map(s=>[s.id,s])),cells=[...settlementCells().values()]
  const fronts=[]
  for(const cell of cells){
    const {m,n}=cell
    for(const [id,side] of [[`${m},${n},x`,'north'],[`${m},${n+1},x`,'south'],[`${m},${n},z`,'west'],[`${m+1},${n},z`,'east']]){
      const road=byId.get(id)
      if(road)fronts.push({cell,road,side,rank:landscapeHash(m,n,430+['north','south','west','east'].indexOf(side))})
    }
  }
  fronts.sort((a,b)=>a.rank-b.rank)
  const candidate=(front,kind,t,serial)=>{
    const {cell,road,side}=front,seed=landscapeHash(cell.m,cell.n,serial+450)
    const dimensions=kind==='school'?[35,39]:kind==='clinic'?[21,23]:kind==='market'?[25,23]:kind==='shop'?[21,19]:kind==='court'?[29,23]:kind==='townhouse'?[24+seed*4,17]:kind==='villa'?[17+seed*3,19+seed*2]:[12.5+seed*3.2,15+seed*2]
    for(const scale of kind==='school'?[1,.92,.84]:[1,.93]){
      const [w,d]=dimensions.map(v=>v*scale),setback=road.half+5+d/2+seed*2.5
      const sourceX=road.sourceX0+(road.sourceX1-road.sourceX0)*t+(side==='west'?setback:side==='east'?-setback:0)
      const sourceZ=road.sourceZ0+(road.sourceZ1-road.sourceZ0)*t+(side==='north'?-setback:side==='south'?setback:0)
      const world=settlementWarpPoint(sourceX,sourceZ)
      const tangent=settlementWarpDirection(sourceX,sourceZ,road.axis==='x'?1:0,road.axis==='z'?-1:0)
      const tangentYaw=Math.atan2(-tangent.z,tangent.x),yaw=tangentYaw+(side==='south'||side==='west'?Math.PI:0)
      const density=settlementDensity(world.x,world.z),woodland=settlementWoodlandWeight(world.x,world.z)
      if(woodland>.7||woodland>.42&&seed>(.76-woodland)*2||density<.24)continue
      const site=inhabitedSite({id:`${kind}:${cell.m}:${cell.n}:${side}:${serial}`,kind,...world,w,d,yaw,density,seed,sourceX,sourceZ})
      if(!inhabitedClear(site,occupied))continue
      occupied.push(site);result.boxes.push(site);result.settlements.push(site)
      return true
    }
    return false
  }
  // Reserve everyday services before fitting smaller homes around them.
  // Distinct site geometry (school playground, market stalls, shop awnings)
  // communicates local life without floating labels or decorative billboards.
  for(const [kind,target] of [['school',2],['clinic',3],['market',5],['court',4],['shop',12]]){
    let count=0
    for(const front of fronts){
      if(front.cell.density<.4||front.cell.density>.96||front.cell.park)continue
      if(candidate(front,kind,.5,Math.floor(front.rank*10000)+1000)){count++;if(count>=target)break}
    }
  }
  for(const front of fronts){
    if(front.cell.park)continue
    for(const [i,t]of [.2,.5,.8].entries()){
      const choice=landscapeHash(front.cell.m,front.cell.n,i+477)
      const kind=choice>.84&&front.cell.density>.5?'townhouse':choice>.58?'villa':'house'
      candidate(front,kind,t,i)
    }
  }
}

export function exteriorLayout(){
  if(exterior)return exterior
  const original=layoutBuildings(),result={boxes:[],rounds:[],roofs:[],beacons:[],poles:[],trees:[],settlements:[]}
  const lots=new Map(original.boxes.filter(b=>b.y===0&&b.anchor).map(b=>[b.anchor.join(','),b]))
  const accepted=new Map(),occupied=[]
  for(const [key,b] of lots){
    const cell=settlementCells().get(`${Math.floor(b.x/80)},${Math.floor((SETTLEMENT_GRID.originZ-b.z)/80)}`),world=settlementWarpPoint(b.x,b.z),density=settlementDensity(world.x,world.z)
    const woodland=settlementWoodlandWeight(world.x,world.z)
    if(!cell||cell.park||density<.79||woodland>.64||landscapeHash(b.x,b.z,4)>.64)continue
    const parent={b,...world,yaw:settlementWarpYaw(b.x,b.z),density,cap:11+64*density*density,scale:1}
    // Most buildings keep their existing dimensions. A compressed curved lot
    // receives a modest setback instead of letting its walls enter the street.
    for(const scale of [1,.94,.88,.82,.75]){
      parent.scale=scale
      const footprint=lotFootprint(parent)
      if(lotClear(parent)&&occupied.every(other=>sitesSeparated(footprint,other))){accepted.set(key,parent);occupied.push(footprint);break}
    }
  }
  for(const kind of ['boxes','rounds','roofs','beacons'])for(const item of original[kind]){
    const parent=item.anchor&&accepted.get(item.anchor.join(','))
    if(!parent||item.y>=parent.cap-.05)continue
    result[kind].push(placeLotItem({...item,...(item.h?{h:Math.min(item.h,parent.cap-(item.y||0))}:{})},parent))
  }
  populateNeighborhoods(result,occupied)
  result.poles=settlementLampPlan()
  for(const [i,p]of result.poles.entries())if(i%5===0&&result.trees.length<240){
    const length=Math.hypot(p.tangent.x,p.tangent.z),side=i%2?1:-1
    result.trees.push({x:p.x-side*p.tangent.z/length*6,z:p.z+side*p.tangent.x/length*6})
  }
  result.boxes.push(...original.boxes.filter(b=>b.h===TOWER_TOP).map(b=>({...b,x:b.x-EXTERIOR_OFFSET[0],z:b.z-EXTERIOR_OFFSET[2],yaw:0})))
  exterior=result
  return exterior
}

export function sourceIslandLayout(){
  return Object.fromEntries(Object.entries(exteriorLayout()).map(([key,items])=>[key,items.map(item=>({...item,x:item.x-ISLAND_SHIFT_X,z:item.z-ISLAND_SHIFT_Z,...(item.anchor?{anchor:[item.anchor[0]-ISLAND_SHIFT_X,item.anchor[1]-ISLAND_SHIFT_Z]}:{})}))]))
}
