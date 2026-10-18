import assert from 'node:assert/strict'
import { test } from 'node:test'
import { islandDistance, ISLAND_SHIFT_Z } from '../src/rooms/islandLand.js'
import { GALLERY_PLOT, gallerySeaViewContains } from '../src/rooms/gallerySite.js'
import { AIRPORT_SITE, airportPointToIsland } from '../src/rooms/airportPlan.js'
const terrain=await import('../src/rooms/islandTerrain.js').catch(()=>({}))

const origin={x:90,z:ISLAND_SHIFT_Z-12}
function coastRadius(angle){
  let low=0,high=2400
  for(let i=0;i<34;i++){
    const r=(low+high)/2
    if(islandDistance(origin.x+Math.cos(angle)*r,origin.z+Math.sin(angle)*r)<0)low=r
    else high=r
  }
  return (low+high)/2
}

test('natural headlands preserve the gallery backshore, airfield and inhabited branch clearances',()=>{
  assert.ok(Math.abs(coastRadius(-Math.PI/2)-1000)<20,'the gallery-facing sea has not moved away from its authored backshore')
  for(const [x,z]of[[-520,-330],[400,-200],[210,470],[410,630]])assert.ok(islandDistance(x,z)+45<-210,'large inhabited branch sites remain on dry interior land')
  for(const x of[AIRPORT_SITE.minX-30,AIRPORT_SITE.maxX+30])for(const z of[AIRPORT_SITE.minZ-30,AIRPORT_SITE.maxZ+30]){
    const p=airportPointToIsland(x,z);assert.ok(islandDistance(p.x,p.z)<-190,'the entire runway reservation has a real dry backshore')
  }
})

test('the island silhouette has deep unequal coves and strong asymmetry instead of a box or oval outline',()=>{
  const count=144,radii=Array.from({length:count},(_,i)=>coastRadius(i*Math.PI*2/count))
  const smoothed=radii.map((_,i)=>Array.from({length:5},(_,j)=>radii[(i+j-2+count)%count]).reduce((a,b)=>a+b,0)/5)
  let coves=0
  for(let i=0;i<count;i++)if(smoothed[i]<smoothed[(i+count-1)%count]&&smoothed[i]<smoothed[(i+1)%count]){
    const depth=(smoothed[(i+count-12)%count]+smoothed[(i+12)%count])/2-smoothed[i]
    if(depth>210)coves++
  }
  assert.ok(coves>=3,'at least three broad coves cut more than210m between unequal headlands')
  const oppositeError=radii.reduce((sum,r,i)=>sum+Math.abs(r-radii[(i+count/2)%count]),0)/count
  assert.ok(oppositeError>230,'opposite coasts have visibly different radii rather than central box/oval symmetry')
  assert.ok(Math.max(...radii)-Math.min(...radii)>600,'headlands and sheltered bays differ at landscape scale')
})

test('shore distance has coherent metre-scale normals, a closed seam and a continuous deep core',()=>{
  for(let a=0;a<Math.PI*2;a+=Math.PI/48){
    const r=coastRadius(a),x=origin.x+Math.cos(a)*r,z=origin.z+Math.sin(a)*r
    const dx=(islandDistance(x+.1,z)-islandDistance(x-.1,z))/.2,dz=(islandDistance(x,z+.1)-islandDistance(x,z-.1))/.2
    assert.ok(Math.abs(Math.hypot(dx,dz)-1)<.025,'normalized radial distance measures actual metres at the water edge')
  }
  const left=coastRadius(-Math.PI+1e-6),right=coastRadius(Math.PI-1e-6)
  assert.ok(Math.abs(left-right)<.01,'the periodic shoreline has no angular seam')
  for(const [dx,dz]of[[.1,0],[-.1,0],[0,.1],[0,-.1]])assert.ok(Math.abs(islandDistance(origin.x+dx,origin.z+dz)-islandDistance(origin.x,origin.z))<.2,'the polar origin cannot create a deep-core height seam')
})

test('rolling terrain stays exactly flat on the beach, gallery outlook and broad airfield reservation',()=>{
  assert.equal(typeof terrain.islandTerrainHeight,'function')
  for(let x=-1300;x<=1500;x+=65)for(let z=-1400;z<=1500;z+=65){
    if(islandDistance(x,z)>=-255||gallerySeaViewContains(x,z))assert.equal(terrain.islandTerrainHeight(x,z),0)
  }
  for(let x=GALLERY_PLOT.x0-60;x<=GALLERY_PLOT.x1+60;x+=15)for(let z=GALLERY_PLOT.z0-60;z<=GALLERY_PLOT.z1+60;z+=15)assert.equal(terrain.islandTerrainHeight(x,z),0)
  for(let x=AIRPORT_SITE.minX-40;x<=AIRPORT_SITE.maxX+40;x+=40)for(let z=AIRPORT_SITE.minZ-40;z<=AIRPORT_SITE.maxZ+40;z+=20){
    const p=airportPointToIsland(x,z);assert.equal(terrain.islandTerrainHeight(p.x,p.z),0)
  }
})

test('asymmetric inland hills are real continuous terrain with finite gentle slopes',()=>{
  assert.equal(typeof terrain.islandTerrainGradient,'function')
  let high=0,low=Infinity,rolling=0
  for(let x=-700;x<=900;x+=40)for(let z=-700;z<=1000;z+=40){
    const h=terrain.islandTerrainHeight(x,z),g=terrain.islandTerrainGradient(x,z)
    assert.ok(Number.isFinite(h)&&h>=0&&h<45)
    assert.ok(Number.isFinite(g.x)&&Number.isFinite(g.z)&&Math.hypot(g.x,g.z)<.3,'rolling ground has no cone edges or vertical grades')
    assert.ok(Math.abs(h-terrain.islandTerrainHeight(x+.25,z+.25))<.1,'height stays continuous between neighboring mesh samples')
    high=Math.max(high,h);if(islandDistance(x,z)<-550){low=Math.min(low,h);if(h>12)rolling++}
  }
  assert.ok(high>30,'wooded inland rises are visible at gallery scale')
  assert.ok(low<5&&rolling>250,'broad hills alternate with real low valleys')
  for(const [x,z]of[[-200,200],[300,150],[-300,650],[450,650]]){
    const g=terrain.islandTerrainGradient(x,z)
    assert.ok(Math.abs(g.x-(terrain.islandTerrainHeight(x+.1,z)-terrain.islandTerrainHeight(x-.1,z))/.2)<.0002)
    assert.ok(Math.abs(g.z-(terrain.islandTerrainHeight(x,z+.1)-terrain.islandTerrainHeight(x,z-.1))/.2)<.0002)
  }
})

test('expanded shoreline contours remain star-convex about the existing ocean sampling origin',()=>{
  for(let a=0;a<Math.PI*2;a+=Math.PI/64){
    let exited=false
    for(let r=0;r<=2200;r+=15){
      const inside=islandDistance(90+Math.cos(a)*r,ISLAND_SHIFT_Z-12+Math.sin(a)*r)<0
      if(!inside)exited=true
      assert.ok(!(inside&&exited),'a contour ray has one coast crossing')
    }
    assert.ok(exited,'the existing coast search radius reaches the expanded shore')
  }
})
