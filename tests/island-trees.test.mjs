import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import * as THREE from 'three'
import { exteriorLayout, islandDistance } from '../src/rooms/exteriorPlan.js'
import { galleryPlotContains, gallerySeaViewContains, GALLERY_SITE, GALLERY_PLOT, EXTERIOR_OFFSET } from '../src/rooms/gallerySite.js'
import { settlementRoadAt, settlementCells, settlementCellAt, settlementUnwarpPoint, SETTLEMENT_GRID } from '../src/rooms/settlementPlan.js'
import { isAirportReserved } from '../src/rooms/airportPlan.js'
import { ISLAND_WORLD_BOUNDS } from '../src/rooms/islandLand.js'
import { islandRenderedTerrainHeight } from '../src/rooms/islandTerrainMesh.js'

const trees=await import('../src/rooms/islandTreePlan.js').catch(()=>({}))
const ecology=await import('../src/rooms/settlementEcology.js').catch(()=>({}))
const footprintDistance=(x,z,b)=>{
  const dx=x-b.x,dz=z-b.z,c=Math.cos(b.yaw||0),s=Math.sin(b.yaw||0)
  return Math.hypot(Math.max(0,Math.abs(c*dx-s*dz)-b.w/2),Math.max(0,Math.abs(s*dx+c*dz)-b.d/2))
}

test('garden trees do not repeat mirrored planting rows around every home',()=>{
  const layout=exteriorLayout(),buildings=layout.boxes.filter(b=>b.y===0&&b.h<90),garden=trees.createIslandTreePlan(layout).filter(t=>t.kind==='building')
  let aligned=0
  for(const t of garden){
    const b=buildings.reduce((near,b)=>footprintDistance(t.x,t.z,b)<footprintDistance(t.x,t.z,near)?b:near)
    const dx=t.x-b.x,dz=t.z-b.z,c=Math.cos(b.yaw||0),s=Math.sin(b.yaw||0),x=c*dx-s*dz,z=s*dx+c*dz
    if(Math.min(...[-.34,0,.34].flatMap(f=>[Math.abs(x-b.w*f),Math.abs(z-b.d*f)]))<.03)aligned++
  }
  assert.ok(garden.length>150)
  assert.ok(aligned/garden.length<.18,`${aligned}/${garden.length} garden trees share the old exact mirrored rows`)
})

test('park planting crosses former grid seams where no actual street exists',()=>{
  let beyondFormerSquare=0
  for(const t of trees.createIslandTreePlan(exteriorLayout()).filter(t=>t.kind==='park')){
    const p=settlementUnwarpPoint(t.x,t.z),x=((p.x%80)+80)%80,z=(((SETTLEMENT_GRID.originZ-p.z)%80)+80)%80
    if(Math.min(x,80-x,z,80-z)<8.7)beyondFormerSquare++
  }
  assert.ok(beyondFormerSquare>=5,'trees must not stop at imaginary square park-cell borders')
})

test('expanded woodland covers the new island end and every root follows the actual rolling terrain',()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout()),edge=plan.filter(t=>t.kind==='edge')
  assert.ok(edge.filter(t=>t.z>ISLAND_WORLD_BOUNDS.maxZ-380).length>100,'the far inland headland has a real mature forest belt')
  assert.ok(edge.filter(t=>t.x>840).length>50&&edge.filter(t=>t.x<-660).length>50,'both widened sides receive forest rather than bare new land')
  assert.ok(plan.filter(t=>t.y>20).length>150,'mature trees grow on the wooded rises')
  for(const t of plan)assert.ok(Math.abs(t.y-islandRenderedTerrainHeight(t.x,t.z))<1e-9,'every tree root contacts the actual triangulated ground surface')
})

test('the shared woodland field connects multiple coastal forests through deep city land',()=>{
  assert.equal(typeof ecology.settlementWoodlandWeight,'function')
  const points=new Map(),key=(x,z)=>`${x},${z}`
  for(let x=Math.floor(ISLAND_WORLD_BOUNDS.minX/20)*20;x<=ISLAND_WORLD_BOUNDS.maxX;x+=20)for(let z=Math.floor(ISLAND_WORLD_BOUNDS.minZ/20)*20;z<=ISLAND_WORLD_BOUNDS.maxZ;z+=20){
    const weight=ecology.settlementWoodlandWeight(x,z)
    assert.ok(Number.isFinite(weight)&&weight>=0&&weight<=1)
    assert.ok(Math.abs(weight-ecology.settlementWoodlandWeight(x+.1,z+.1))<.015,'the ground field has a smooth transition at block boundaries')
    if(weight>.55&&islandDistance(x,z)<-245)points.set(key(x,z),{x,z})
  }
  let largest=[]
  while(points.size){
    const first=points.values().next().value,component=[first];points.delete(key(first.x,first.z))
    for(let i=0;i<component.length;i++)for(const [dx,dz] of [[20,0],[-20,0],[0,20],[0,-20]]){
      const at=key(component[i].x+dx,component[i].z+dz),p=points.get(at)
      if(p){component.push(p);points.delete(at)}
    }
    if(component.length>largest.length)largest=component
  }
  assert.ok(largest.filter(p=>islandDistance(p.x,p.z)<-650).length>150,'green corridors continue well beyond the coastal belt')
  for(const sector of [p=>p.x<-400,p=>p.x>600,p=>p.z<-650,p=>p.z>550]){
    assert.ok(largest.some(p=>sector(p)&&islandDistance(p.x,p.z)>-360),'the same connected woodland field reaches every coastal neighborhood')
  }
})

test('coastal jungle has connected mature green fingers deep inside inhabited neighborhoods',()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout()),forest=plan.filter(t=>['edge','grove'].includes(t.kind)&&t.h>=18)
  const deep=forest.filter(t=>t.kind==='grove'&&islandDistance(t.x,t.z)<-600&&settlementCellAt(t.x,t.z))
  assert.ok(deep.length>settlementCells().size,'deep mature woodland scales with the inhabited footprint rather than stopping at its outer boundary')
  const cells=new Map(),key=(x,z)=>`${x},${z}`
  forest.forEach((t,i)=>{const at=key(Math.floor(t.x/100),Math.floor(t.z/100));if(!cells.has(at))cells.set(at,[]);cells.get(at).push(i)})
  const unseen=new Set(forest.map((_,i)=>i));let connected=[]
  while(unseen.size){
    const first=unseen.values().next().value,component=[first];unseen.delete(first)
    for(let i=0;i<component.length;i++){
      const a=forest[component[i]],cx=Math.floor(a.x/100),cz=Math.floor(a.z/100)
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const j of cells.get(key(cx+dx,cz+dz))||[]){
        const b=forest[j]
        if(!unseen.has(j))continue
        const gap=Math.hypot(a.x-b.x,a.z-b.z)-a.radius-b.radius
        // A carriageway remains an intentional canopy break. It can join two
        // sides of the same green finger, while an empty housing block cannot.
        const roadCrossing=gap<32&&settlementRoadAt((a.x+b.x)/2,(a.z+b.z)/2,5)
        if(gap<12||roadCrossing){unseen.delete(j);component.push(j)}
      }
    }
    if(component.length>connected.length)connected=component
  }
  const inland=connected.map(i=>forest[i]).filter(t=>t.kind==='grove'&&islandDistance(t.x,t.z)<-600&&settlementCellAt(t.x,t.z))
  assert.ok(inland.length>deep.length*.8,'most deep urban groves connect back to the coastal forest across ordinary road gaps')
  assert.ok(inland.some(t=>t.x<0)&&inland.some(t=>t.x>220)&&inland.some(t=>t.z<0)&&inland.some(t=>t.z>150),'several green fingers cross the neighborhood instead of making one isolated park')
})

test('mature urban groves fill available park and neighborhood clearings',()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout()),urban=plan.filter(t=>t.kind!=='edge'&&(t.kind!=='grove'||settlementCellAt(t.x,t.z)))
  assert.ok(urban.filter(t=>t.h>=15).length>=300,'the district needs mature planted trees beyond its former 32 saplings')
  const parks=[...settlementCells().values()].filter(c=>c.park)
  let wellPlanted=0
  for(const cell of parks){
    const local=plan.filter(t=>['park','grove'].includes(t.kind)&&Math.hypot(t.x-cell.x,t.z-cell.z)<48)
    const mature=local.filter(t=>t.h>=15)
    if(mature.length>=7&&Math.max(...mature.map(t=>t.h))-Math.min(...mature.map(t=>t.h))>=6)wellPlanted++
  }
  assert.ok(wellPlanted>=parks.length*.7,'park canopies contain varied mature groups rather than four equal corner trees')
})

test('every coast band has a nearly continuous canopy of overlapping separate trees',()=>{
  const layout=exteriorLayout(),plan=trees.createIslandTreePlan(layout),forest=plan.filter(t=>t.kind==='edge')
  for(const [side,inSide] of [['east',(x,z)=>x>600],['west',(x,z)=>x<-400],['south',(x,z)=>z>550],['north',(x,z)=>z<-650]]){
    let eligible=0,covered=0
    for(let x=ISLAND_WORLD_BOUNDS.minX;x<ISLAND_WORLD_BOUNDS.maxX;x+=12)for(let z=ISLAND_WORLD_BOUNDS.minZ;z<ISLAND_WORLD_BOUNDS.maxZ;z+=12){
      const d=islandDistance(x,z)
      if(d<-410||d>-245||!inSide(x,z)||galleryPlotContains(x,z,40)||gallerySeaViewContains(x,z,35)||isAirportReserved(x,z,45)||settlementRoadAt(x,z,18)||layout.boxes.some(b=>b.y===0&&footprintDistance(x,z,b)<25))continue
      eligible++
      if(forest.some(t=>Math.hypot(x-t.x,z-t.z)<t.radius*.85))covered++
    }
    assert.ok(eligible>100,`${side} has a useful coast sample`)
    assert.ok(covered/eligible>.9,`${side} eligible inland canopy coverage is ${(covered/eligible*100).toFixed(1)}%`)
  }
})

test('forest spacing does not expose rows or a rectangular sampling lattice',()=>{
  const forest=trees.createIslandTreePlan(exteriorLayout()).filter(t=>t.kind==='edge')
  let diagonal=0
  for(const t of forest.slice(0,300)){
    let neighbor,distance=Infinity
    for(const other of forest){
      if(other===t)continue
      const d=Math.hypot(t.x-other.x,t.z-other.z)
      if(d<distance){distance=d;neighbor=other}
    }
    const angle=Math.atan2(Math.abs(t.z-neighbor.z),Math.abs(t.x-neighbor.x))
    if(angle>Math.PI/18&&angle<Math.PI/2-Math.PI/18)diagonal++
  }
  assert.ok(diagonal>180,'neighbor directions vary naturally instead of following straight seed rows')
})

test('planted trees respect rotated facades and curved road clearance in world space',()=>{
  const layout=exteriorLayout(),rotated={x:620,z:-60,y:0,w:150,d:18,h:20,yaw:Math.PI/4}
  const plan=trees.createIslandTreePlan({...layout,boxes:[...layout.boxes,rotated]})
  for(const t of plan){
    assert.ok(footprintDistance(t.x,t.z,rotated)>t.radius+.6,'a diagonal wing cannot intersect a mature crown')
    assert.equal(settlementRoadAt(t.x,t.z,Math.max(2.5,t.radius*.65)),false,'the organic carriageway remains free of roots and central crowns')
    assert.equal(isAirportReserved(t.x,t.z,t.radius+5),false,'airport and approach clearances remain open')
  }
})

test('planned UKD planting mixes coherent edge groves, streets and inland gardens',()=>{
  assert.equal(typeof trees.createIslandTreePlan,'function')
  const layout=exteriorLayout(),plan=trees.createIslandTreePlan(layout)
  assert.deepEqual(plan,trees.createIslandTreePlan(layout),'planting stays fixed across remounts')
  assert.ok(plan.length>400)
  const counts=Object.fromEntries(['edge','boulevard','building','park'].map(kind=>[kind,plan.filter(t=>t.kind===kind).length]))
  assert.ok(counts.edge>250,JSON.stringify(counts))
  assert.ok(counts.boulevard>15&&counts.building>15&&counts.park>15,JSON.stringify(counts))
  assert.equal(new Set(plan.map(t=>t.crown)).size,6)
  assert.ok(Math.min(...plan.map(t=>t.h))<6&&Math.max(...plan.map(t=>t.h))>20)
  for(const t of plan){
    assert.ok(islandDistance(t.x,t.z)+t.radius<-180,'whole crowns stay off the beach')
    assert.ok(!galleryPlotContains(t.x,t.z,t.radius+8),'gallery footprint remains clear')
    assert.ok(!gallerySeaViewContains(t.x,t.z,t.radius),'the sea outlook remains clear')
    assert.equal(settlementRoadAt(t.x,t.z,t.radius*.65),false,'roots and central crowns stay clear of planned streets')
    for(const b of layout.boxes.filter(b=>b.y===0)){
      const distance=footprintDistance(t.x,t.z,b)
      assert.ok(distance>t.radius+.6,'crowns remain outside houses and facades')
    }
  }
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    assert.ok(plan.filter(t=>t.kind==='edge'&&(t.x-90)*dx+(t.z+89.9)*dz>500).length>15,'groves reach each island side')
  }
  for(const side of [-1,1])assert.ok(plan.some(t=>Math.sign(t.x-GALLERY_SITE.x)===side&&Math.abs(t.x-GALLERY_SITE.x)-t.radius<170&&t.z+t.radius>GALLERY_PLOT.z0&&t.z-t.radius<GALLERY_PLOT.z1),'mature crowns remain visible beside both gallery flanks')
})

test('turning cannot redistribute close leaf detail on trees that remain in view',()=>{
  assert.equal(typeof trees.selectIslandTreeResidency,'function')
  const plan=Array.from({length:50},(_,i)=>({x:Math.cos(i)*110,z:Math.sin(i)*110,y:0,h:15,crown:i%6}))
  const costs=Array.from({length:6},()=>[3100,400]),eye={x:0,y:90,z:0}
  const resident=trees.selectIslandTreeResidency(plan,eye,costs)
  const first=new Uint8Array(plan.length).fill(1),turned=Uint8Array.from(first,(_,i)=>i%3?1:0)
  const a=trees.selectIslandTreeDetail(plan,eye,first,costs,undefined,undefined,resident)
  const bob={...eye,y:eye.y+.008}
  const retained=trees.selectIslandTreeResidency(plan,bob,costs,resident)
  assert.deepEqual(retained,resident,'eight millimetres of gait cannot reshuffle close crowns')
  const b=trees.selectIslandTreeDetail(plan,bob,turned,costs,a,undefined,retained)
  for(let i=0;i<plan.length;i++)if(turned[i])assert.equal(a[i],b[i])
})

test('tree detail uses a strict triangle cap, distance culling and resident hysteresis',()=>{
  assert.equal(typeof trees.selectIslandTreeDetail,'function')
  const plan=Array.from({length:1200},(_,i)=>({x:i%40*25,z:Math.floor(i/40)*25,h:15,y:0,crown:i%6}))
  const costs=Array.from({length:6},()=>[3100,400]),eye={x:0,y:90,z:0}
  const visible=new Uint8Array(plan.length).fill(1)
  const state=trees.selectIslandTreeDetail(plan,eye,visible,costs)
  const cost=state.reduce((sum,lod,i)=>sum+(lod?costs[plan[i].crown][lod-1]:0),0)
  assert.ok(cost<=trees.TREE_TRIANGLE_BUDGET&&cost>150000)
  assert.ok(state.some(lod=>lod===1)&&state.some(lod=>lod===2))
  assert.deepEqual(trees.selectIslandTreeDetail(plan,eye,visible,costs,state),state,'stationary residency is stable')
  assert.ok(trees.selectIslandTreeDetail(plan,{x:10000,y:90,z:10000},visible,costs).every(lod=>lod===0))
  assert.ok(trees.selectIslandTreeDetail(plan,eye,new Uint8Array(plan.length),costs).every(lod=>lod===0))
})

test('newly visible source detail cannot evict silhouettes that remain visible under the cap',()=>{
  const plan=[0,10,500,600,700].map(x=>({x,z:0,y:0,h:15,crown:0}))
  const eye={x:0,y:90,z:0},costs=[[60,40]],budget=200
  const resident=trees.selectIslandTreeResidency(plan,eye,costs,undefined,budget)
  const a=trees.selectIslandTreeDetail(plan,eye,new Uint8Array([0,0,1,1,0]),costs,undefined,budget,resident)
  const b=trees.selectIslandTreeDetail(plan,eye,new Uint8Array([1,0,1,1,1]),costs,a,budget,resident)
  assert.equal(a[2],2);assert.equal(a[3],2)
  assert.equal(b[2],2);assert.equal(b[3],2,'the newly visible near crown cannot steal far-tree capacity')
  assert.equal(b[4],0,'new silhouettes fill only spare capacity')
  assert.ok(b.reduce((sum,lod)=>sum+(lod?costs[0][lod-1]:0),0)<=budget)
})

test('new distant grove trees cannot evict overlapping visible medium crowns on a head turn',()=>{
  const plan=[{x:200,z:0,y:0,h:20,crown:0},{x:210,z:0,y:0,h:20,crown:0},...Array.from({length:20},(_,i)=>({x:600+i,z:0,y:0,h:20,crown:0}))]
  const costs=[[500,200,60,10]],eye={x:0,y:90,z:0},budget=200
  const first=new Uint8Array(plan.length);first[0]=first[1]=1
  const a=trees.selectIslandTreeDetail(plan,eye,first,costs,undefined,budget)
  const b=trees.selectIslandTreeDetail(plan,eye,new Uint8Array(plan.length).fill(1),costs,a,budget)
  assert.equal(a[0],3);assert.equal(a[1],3)
  assert.equal(b[0],3);assert.equal(b[1],3,'new far crowns fill spare capacity after existing visible crowns')
})

test('a complete compact crown fills spare budget when medium branch detail cannot fit',()=>{
  const plan=[{x:200,z:0,y:0,h:20,crown:0}],costs=[[500,200,60,10]],eye={x:0,y:90,z:0}
  const state=trees.selectIslandTreeDetail(plan,eye,new Uint8Array([1]),costs,undefined,50)
  assert.equal(state[0],4,'a dense grove remains planted instead of developing a budget-induced hole')
})

test('whole-canopy coverage is allocated before upgrading a handful of new mid-distance trees',()=>{
  const plan=Array.from({length:10},(_,i)=>({x:200+i,z:0,y:0,h:20,crown:0})),costs=[[500,200,60,10]],eye={x:0,y:90,z:0}
  const state=trees.selectIslandTreeDetail(plan,eye,new Uint8Array(10).fill(1),costs,undefined,200)
  assert.ok(state.every(lod=>lod>0),'all ten crowns fit as complete scans before branch-detail upgrades')
  assert.ok(state.some(lod=>lod===3),'spare geometry still improves the closest new branch clusters')
  assert.ok(state.reduce((sum,lod)=>sum+costs[0][lod-1],0)<=200)
})

test('the inland roof outlook renders the dense district rather than culling its planted mature groups',async()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout())
  const costs=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8')).extras.variants.map(v=>v.triangles)
  const camera=new THREE.PerspectiveCamera(75,1.8,.05,2400)
  camera.position.set(GALLERY_SITE.x,97.58,GALLERY_SITE.z);camera.rotation.set(-.3,Math.PI,0,'YXZ');camera.updateMatrixWorld()
  const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse))
  const visible=Uint8Array.from(plan,t=>frustum.intersectsBox(new THREE.Box3(new THREE.Vector3(t.x-t.radius-.5,t.y-.5,t.z-t.radius-.5),new THREE.Vector3(t.x+t.radius+.5,t.y+t.h+.5,t.z+t.radius+.5)))?1:0)
  const state=trees.selectIslandTreeDetail(plan,camera.position,visible,costs)
  for(const kinds of [['edge','grove'],['park','building','boulevard']]){
    const indices=plan.flatMap((t,i)=>visible[i]&&kinds.includes(t.kind)?[i]:[])
    assert.ok(indices.filter(i=>state[i]).length>indices.length*.96,`${kinds.join('/')} retain at least 96 percent of their planted visible crowns`)
  }
  assert.ok(state.reduce((sum,lod,i)=>sum+(lod?costs[plan[i].crown][lod-1]:0),0)<=trees.TREE_TRIANGLE_BUDGET)
})

test('actual island silhouettes remain stable across adjacent rear-roof look directions',async()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout())
  const gltf=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8')),costs=gltf.extras.variants.map(v=>v.triangles)
  const root=new THREE.Matrix4().makeTranslation(EXTERIOR_OFFSET[0],-96,EXTERIOR_OFFSET[2])
  const camera=new THREE.PerspectiveCamera(75,1.8,.05,2400)
  camera.position.set(0,1.58,-80)
  const eye=camera.position.clone().applyMatrix4(root.clone().invert())
  const resident=trees.selectIslandTreeResidency(plan,eye,costs),frustum=new THREE.Frustum(),matrix=new THREE.Matrix4()
  const mask=yaw=>{
    camera.rotation.y=THREE.MathUtils.degToRad(yaw);camera.updateMatrixWorld()
    frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(root))
    return Uint8Array.from(plan,t=>frustum.intersectsBox(new THREE.Box3(new THREE.Vector3(t.x-t.radius-.5,t.y-.5,t.z-t.radius-.5),new THREE.Vector3(t.x+t.radius+.5,t.y+t.h+.5,t.z+t.radius+.5)))?1:0)
  }
  let previous
  for(const yaw of [164,165,164,165]){
    const visible=mask(yaw),state=trees.selectIslandTreeDetail(plan,eye,visible,costs,previous,undefined,resident)
    if(previous)for(let i=0;i<plan.length;i++)if(previous[i]>=3&&visible[i])assert.equal(state[i],previous[i],'small turns retain overlapping visible silhouettes')
    assert.ok(state.reduce((sum,lod,i)=>sum+(lod?costs[plan[i].crown][lod-1]:0),0)<=trees.TREE_TRIANGLE_BUDGET)
    previous=state
  }
})

test('both coast outlooks retain a visible forest instead of spending the crown budget behind the camera',async()=>{
  const plan=trees.createIslandTreePlan(exteriorLayout())
  const costs=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8')).extras.variants.map(v=>v.triangles)
  const root=new THREE.Matrix4().makeTranslation(EXTERIOR_OFFSET[0],-96,EXTERIOR_OFFSET[2])
  for(const [x,yaw] of [[40,-Math.PI/2],[-40,Math.PI/2]]){
    const camera=new THREE.PerspectiveCamera(62,1.25,.05,2400)
    camera.position.set(x,1.58,-36);camera.rotation.set(-.25,yaw,0,'YXZ');camera.updateMatrixWorld()
    const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(root))
    const eye=camera.position.clone().applyMatrix4(root.clone().invert())
    const visible=Uint8Array.from(plan,t=>frustum.intersectsSphere(new THREE.Sphere(new THREE.Vector3(t.x,t.h*.5,t.z),t.h))?1:0)
    const state=trees.selectIslandTreeDetail(plan,eye,visible,costs)
    assert.ok(state.filter(v=>v>=3).length>100,'distant edge groves keep their full canopy coverage')
    const width=120,height=80,planned=new Uint8Array(width*height),retained=new Uint8Array(width*height)
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1)
    for(let i=0;i<plan.length;i++){
      const t=plan[i];if(t.kind!=='edge'||!visible[i])continue
      const center=new THREE.Vector3(t.x+EXTERIOR_OFFSET[0],-96+t.h*.78,t.z+EXTERIOR_OFFSET[2]),screen=center.clone().project(camera)
      if(screen.z>1)continue
      const across=center.clone().addScaledVector(right,t.radius*.8).project(camera),above=center.clone().addScaledVector(up,t.h*.27).project(camera)
      const cx=(screen.x*.5+.5)*width,cy=(.5-screen.y*.5)*height,rx=Math.max(1,Math.abs(across.x-screen.x)*width*.5),ry=Math.max(1,Math.abs(above.y-screen.y)*height*.5)
      for(let y=Math.max(0,Math.floor(cy-ry));y<Math.min(height,cy+ry);y++)for(let x=Math.max(0,Math.floor(cx-rx));x<Math.min(width,cx+rx);x++){
        if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue
        planned[y*width+x]=1;if(state[i])retained[y*width+x]=1
      }
    }
    const area=mask=>mask.reduce((sum,v)=>sum+v,0)
    assert.ok(area(retained)>area(planned)*.82,'budgeted coast views retain the dense projected canopy area')
  }
})

test('shared native UKD runtime trees retain full close foliage without duplicating the six crown forms',async()=>{
  const file=resolve('public/assets/forest/island-trees.gltf')
  const model=JSON.parse(await readFile(file,'utf8'))
  assert.equal(model.extras.variants.length,6)
  assert.equal(new Set(model.extras.variants.map(v=>v.species)).size,2)
  let bytes=(await stat(file)).size
  for(const {uri} of [...model.buffers,...model.images].filter(item=>item.uri))bytes+=(await stat(resolve(dirname(file),uri))).size
  assert.ok(bytes<30*1024*1024,`two native source scans and shared bark use ${bytes} bytes`)
  assert.equal(model.meshes.length,8,'the three crown profiles share geometry for each species instead of duplicating every native leaf')
  for(const variant of model.extras.variants){
    const costs=variant.meshes.map(i=>model.meshes[i].primitives.reduce((sum,p)=>sum+model.accessors[p.indices].count/3,0))
    assert.ok(costs[0]>180000&&costs[0]<270000,'close crowns retain every native-size curved leaf of the two source scans')
    assert.ok(costs[1]>36000&&costs[1]<40000,'middle crowns retain native-size source leaves and complete small branch clusters')
    assert.ok(costs[2]<1600&&costs[2]>300,'distant crowns preserve full-source canopy coverage in small branch clusters')
    assert.ok(costs[3]<750&&costs[3]>600,'the distant jungle tier retains solid roots, source branches and full-scan coverage')
  }
})

test('edge forest has overlapping mature crowns and broad projected coverage in both coast outlooks',()=>{
  const forest=trees.createIslandTreePlan(exteriorLayout()).filter(t=>t.kind==='edge')
  assert.ok(forest.every(t=>t.h>=24&&t.h<=42),'edge groves are mature forest rather than small park trees')
  assert.ok(Math.max(...forest.map(t=>t.h))-Math.min(...forest.map(t=>t.h))>12,'the forest has distinct mature canopy heights')
  let overlapping=0
  for(let i=0;i<forest.length;i++)if(forest.some((b,j)=>j!==i&&Math.hypot(forest[i].x-b.x,forest[i].z-b.z)<(forest[i].radius+b.radius)*.65))overlapping++
  assert.ok(overlapping>forest.length*.75,'crowns merge into a dense canopy while individual trees remain distinct')
})

test('distant tree canopies include every scanned source leaf without giant clipped leaf polygons',async()=>{
  for(const species of ['burkea','coastal']){
    const metrics=JSON.parse(await readFile(`public/assets/forest/${species}-canopy-metrics.json`,'utf8'))
    assert.ok(metrics.sourceLeafComponents>30000,'full scan foliage contributes to every distant crown')
    assert.ok(metrics.canopyClusters>25&&metrics.canopyClusters<200,'coverage is carried by small spatial branch clusters')
    assert.ok(metrics.coveredPixels>180000,'canopy retains dense leaf coverage instead of a few enlarged leaves')
  }
})

test('instanced fleets stay within budget and survive disposal/remount without disposing source assets',async()=>{
  const source=await readFile('src/rooms/IslandTrees.jsx','utf8')
  const create=new Function('THREE','selectIslandTreeDetail','selectIslandTreeResidency','TREE_TRIANGLE_BUDGET',
    source.slice(source.indexOf('const noRaycast='),source.indexOf('export default function'))+'return createTreeFleet;')
    (THREE,trees.selectIslandTreeDetail,trees.selectIslandTreeResidency,trees.TREE_TRIANGLE_BUDGET)
  const gltf=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8'))
  const binary=await readFile('public/assets/forest/island-trees.bin'),scene=new THREE.Group()
  const views=await (await import('./helpers/gltf-buffer-views.mjs')).gltfBufferViews(gltf,binary)
  const widths={SCALAR:1,VEC2:2,VEC3:3},types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}
  const attribute=i=>{
    const a=gltf.accessors[i],v=views[a.bufferView],Type=types[a.componentType]
    const start=v.byteOffset+(a.byteOffset||0)
    return new THREE.BufferAttribute(new Type(v.buffer.slice(start,start+a.count*widths[a.type]*Type.BYTES_PER_ELEMENT)),widths[a.type])
  }
  const materials=gltf.materials.map(m=>Object.assign(new THREE.MeshStandardMaterial(),{name:m.name}))
  let sourceDisposals=0
  for(const material of materials)material.addEventListener('dispose',()=>sourceDisposals++)
  for(const node of gltf.nodes){
    const root=new THREE.Group();root.name=node.name
    for(const part of gltf.meshes[node.mesh].primitives){
      const geometry=new THREE.BufferGeometry()
      for(const [key,name] of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv']])geometry.setAttribute(name,attribute(part.attributes[key]))
      geometry.setIndex(attribute(part.indices));geometry.addEventListener('dispose',()=>sourceDisposals++)
      root.add(new THREE.Mesh(geometry,materials[part.material]))
    }
    scene.add(root)
  }
  const model={scene,parser:{json:gltf}},plan=trees.createIslandTreePlan(exteriorLayout())
  const camera=new THREE.PerspectiveCamera(75,1.8,.1,2400)
  camera.position.set(90,97.6,-790);camera.lookAt(90,0,0);camera.updateMatrixWorld()
  for(let setup=0;setup<2;setup++){
    const fleet=create(model,plan)
    fleet.update(camera,new THREE.Matrix4())
    const triangles=fleet.group.children.reduce((sum,m)=>sum+m.count*m.geometry.index.count/3,0)
    assert.ok(triangles>0&&triangles<=trees.TREE_TRIANGLE_BUDGET)
    assert.equal(triangles,fleet.group.userData.planting.triangles)
    assert.ok(fleet.group.children.every(m=>m.count<=m.instanceMatrix.count&&m.count<=m.instanceColor.count),'the dense fleet fits every species and LOD instance allocation')
    assert.ok(fleet.group.children.every(m=>!m.castShadow&&!m.receiveShadow))
    fleet.dispose()
    assert.equal(fleet.group.children.length,0)
    assert.equal(sourceDisposals,0,'cached source geometry/materials remain reusable')
  }
})
