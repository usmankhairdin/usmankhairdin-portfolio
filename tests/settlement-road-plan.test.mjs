import assert from 'node:assert/strict'
import { test } from 'node:test'
import { settlementWarpPoint, settlementUnwarpPoint, settlementWarpDirection, settlementWarpJacobian } from '../src/rooms/settlementWarp.js'
import { SETTLEMENT_GRID, settlementBlocks, settlementCells, settlementCellAt, settlementRoadAt, settlementRoadMask, settlementRoadSegments, settlementRoadExists, settlementJunctions, settlementLampPlan } from '../src/rooms/settlementPlan.js'
import { exteriorLayout, islandDistance } from '../src/rooms/exteriorPlan.js'
import { galleryPlotContains, gallerySeaViewContains } from '../src/rooms/gallerySite.js'
import { isAirportReserved } from '../src/rooms/airportPlan.js'
import { TOWER_TOP } from '../src/rooms/cityPlan.js'

test('the shared district map has an exact inverse and bounded, nonfolding directions', () => {
  for (let x=-1100; x<=1100; x+=73) for (let z=-1100; z<=1100; z+=79) {
    const p=settlementWarpPoint(x,z),q=settlementUnwarpPoint(p.x,p.z),j=settlementWarpJacobian(x,z)
    assert.ok(Math.hypot(q.x-x,q.z-z)<1e-9)
    assert.ok(Math.abs(j.xx*j.zz-j.xz*j.zx-1)<1e-12)
    for(const [dx,dz] of [[1,0],[0,1],[Math.SQRT1_2,Math.SQRT1_2]]){
      const tangent=settlementWarpDirection(x,z,dx,dz),next=settlementWarpPoint(x+dx*.001,z+dz*.001)
      assert.ok(Math.hypot((next.x-p.x)/.001-tangent.x,(next.z-p.z)/.001-tangent.z)<1e-5)
      assert.ok(Math.hypot(tangent.x,tangent.z)>.6&&Math.hypot(tangent.x,tangent.z)<1.6)
    }
  }
})

test('irregular merged blocks share one connected road network with real T junctions', () => {
  const blocks=settlementBlocks(),cells=settlementCells(),seen=new Set(),adj=new Map()
  const shapes=new Set(blocks.map(b=>`${b.cols}x${b.rows}`))
  assert.ok(shapes.size>=5&&shapes.has('1x1')&&shapes.has('4x1')&&shapes.has('1x4'),'natural district boundaries retain both long-block orientations and smaller infill blocks')
  for(const b of blocks)for(const c of b.cells){
    const id=`${c.m},${c.n}`
    assert.equal(seen.has(id),false);seen.add(id)
    assert.equal(settlementCellAt(c.x,c.z),c)
    if(c.m>b.m0)assert.equal(settlementRoadExists(c.m,c.n,'z'),false)
    if(c.n>b.n0)assert.equal(settlementRoadExists(c.m,c.n,'x'),false)
  }
  assert.equal(seen.size,cells.size)
  for(const s of settlementRoadSegments()){
    const a=`${s.m},${s.n}`,b=`${s.m+(s.axis==='x'?1:0)},${s.n+(s.axis==='z'?1:0)}`
    for(const [v,u]of [[a,b],[b,a]]){if(!adj.has(v))adj.set(v,[]);adj.get(v).push(u)}
  }
  assert.ok([...adj.values()].every(a=>a.length>=2),'no unsupported road stubs end in the forest')
  const visited=new Set(),queue=[adj.keys().next().value]
  while(queue.length){const v=queue.pop();if(visited.has(v))continue;visited.add(v);queue.push(...adj.get(v))}
  assert.equal(visited.size,adj.size,'all neighborhoods share a connected network')
  assert.ok(settlementJunctions().filter(j=>j.degree===3).length>35)
})

test('curved road ownership, shader atlas, lamps and protected ground agree', () => {
  const data=settlementRoadMask(),{size,min,originZ}=SETTLEMENT_GRID
  const cell=(m,n)=>data.subarray(((n-min)*size+m-min)*4,((n-min)*size+m-min)*4+4)
  let curved=0
  for(const s of settlementRoadSegments()){
    const info=cell(s.m,s.n),channel=s.axis==='z'?0:1
    assert.equal(info[channel],255);assert.equal(info[channel+2]/255*16,s.half)
    const mid=s.points[s.points.length>>1],chord={x:(s.x0+s.x1)/2,z:(s.z0+s.z1)/2}
    if(Math.hypot(mid.x-chord.x,mid.z-chord.z)>.15)curved++
    for(let i=1;i<s.points.length;i++)assert.ok(Math.hypot(s.points[i].x-s.points[i-1].x,s.points[i].z-s.points[i-1].z)<4)
    for(const p of s.points){
      assert.ok(islandDistance(p.x,p.z)<-224)
      assert.equal(galleryPlotContains(p.x,p.z,12),false)
      assert.equal(gallerySeaViewContains(p.x,p.z,5),false)
      assert.equal(isAirportReserved(p.x,p.z,8),false)
    }
    for(const offset of [-s.half-.3,-s.half+.3,0,s.half-.3,s.half+.3]){
      const x=(s.sourceX0+s.sourceX1)/2+(s.axis==='z'?offset:0),z=(s.sourceZ0+s.sourceZ1)/2+(s.axis==='x'?offset:0),world=settlementWarpPoint(x,z)
      const am=Math.floor(x/80+.5),an=Math.floor((originZ-z)/80),sm=Math.floor(x/80),sn=Math.floor((originZ-z)/80+.5),a=cell(am,an),b=cell(sm,sn)
      const expected=Boolean(a[0]>127&&Math.abs(x-am*80)<=a[2]/255*16||b[1]>127&&Math.abs(z-(originZ-sn*80))<=b[3]/255*16)
      assert.equal(settlementRoadAt(world.x,world.z),expected)
    }
  }
  assert.ok(curved>100,'most retained streets visibly curve between junctions')
  for(const p of settlementLampPlan()){
    const expected=settlementWarpPoint(p.sourceX,p.sourceZ)
    assert.ok(Math.hypot(expected.x-p.x,expected.z-p.z)<1e-10)
    assert.equal(settlementRoadAt(p.x,p.z,1),true)
  }
})

test('straight buildings and their roof families follow curved lots without entering roads', () => {
  const layout=exteriorLayout(),buildings=layout.boxes.filter(b=>b.y===0&&b.h!==TOWER_TOP)
  assert.ok(buildings.length>220)
  assert.ok(buildings.filter(b=>Math.abs(b.yaw)>.04).length>100)
  for(const b of buildings){
    const c=Math.cos(b.yaw),s=Math.sin(b.yaw)
    for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){
      const dx=ix*b.w/2,dz=iz*b.d/2,x=b.x+c*dx+s*dz,z=b.z-s*dx+c*dz
      assert.equal(settlementRoadAt(x,z,1),false,'a building footprint never occupies a carriageway')
    }
    assert.ok(b.y+b.h<TOWER_TOP-5)
  }
  const byAnchor=new Map(buildings.map(b=>[b.anchor.join(','),b]))
  for(const roof of layout.roofs){
    const parent=byAnchor.get(roof.anchor.join(','))
    assert.ok(parent,'every roof retains its ground building anchor')
    assert.equal(roof.yaw,parent.yaw)
    const dx=roof.x-parent.x,dz=roof.z-parent.z,c=Math.cos(parent.yaw),s=Math.sin(parent.yaw)
    assert.ok(Math.abs(c*dx-s*dz)<=parent.w/2+1&&Math.abs(s*dx+c*dz)<=parent.d/2+1)
  }
})

test('every accepted ground building has a separate oriented site and facade clearance', () => {
  const buildings=exteriorLayout().boxes.filter(b=>b.y===0)
  const corners=b=>{
    const c=Math.cos(b.yaw||0),s=Math.sin(b.yaw||0)
    return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>({x:b.x+c*x*b.w/2+s*z*b.d/2,z:b.z-s*x*b.w/2+c*z*b.d/2}))
  }
  const polygons=buildings.map(corners)
  for(let i=0;i<buildings.length;i++)for(let j=i+1;j<buildings.length;j++){
    const a=polygons[i],b=polygons[j],axes=[a,b].flatMap(poly=>[0,1].map(k=>{
      const p=poly[k],q=poly[(k+1)%4],length=Math.hypot(q.x-p.x,q.z-p.z)
      return {x:-(q.z-p.z)/length,z:(q.x-p.x)/length}
    }))
    const gaps=axes.map(axis=>{
      const pa=a.map(p=>p.x*axis.x+p.z*axis.z),pb=b.map(p=>p.x*axis.x+p.z*axis.z)
      return Math.max(Math.min(...pb)-Math.max(...pa),Math.min(...pa)-Math.max(...pb))
    })
    assert.ok(Math.max(...gaps)>=.8-1e-8,`ground families ${i}/${j} overlap or lack facade clearance at ${buildings[i].x},${buildings[i].z} and ${buildings[j].x},${buildings[j].z}`)
  }
})

test('road headings sweep across neighborhoods instead of retaining one box-lattice orientation',()=>{
  const tangents=[[-400,-80],[-160,-80],[80,-80],[320,-80],[560,-80]].map(([x,z])=>settlementWarpDirection(x,z,1,0))
  let sweep=0
  for(const a of tangents)for(const b of tangents)sweep=Math.max(sweep,Math.abs(Math.atan2(a.x*b.z-a.z*b.x,a.x*b.x+a.z*b.z)))
  assert.ok(sweep>.8,'one through-street family changes heading by more than45 degrees through the inhabited district')
  const headings=settlementRoadSegments().map(road=>{
    const middle=settlementWarpDirection((road.sourceX0+road.sourceX1)/2,(road.sourceZ0+road.sourceZ1)/2,road.axis==='x'?1:0,road.axis==='z'?1:0)
    return Math.atan2(middle.z,middle.x)
  })
  const oblique=headings.filter(a=>Math.min(Math.abs(Math.sin(a)),Math.abs(Math.cos(a)))>Math.sin(Math.PI/9)).length
  assert.ok(oblique>headings.length*.28,'visible streets occupy a broad mix of local orientations')
})

test('elongated neighborhood blocks remove the repeated single-cell street lattice',()=>{
  const blocks=settlementBlocks(),count=blocks.reduce((sum,b)=>sum+b.cells.length,0)
  const elongated=blocks.filter(b=>Math.max(b.cols,b.rows)>=3).reduce((sum,b)=>sum+b.cells.length,0)
  const merged=blocks.filter(b=>b.cells.length>1).reduce((sum,b)=>sum+b.cells.length,0)
  assert.ok(elongated>count*.4,'long blocks carry a substantial share of the inhabited district')
  assert.ok(merged>count*.65,'most neighborhoods share streets around several source cells')
  assert.ok(blocks.some(b=>Math.max(b.cols,b.rows)>=4),'some streets run past long neighborhood blocks')
  const junctions=settlementJunctions().filter(j=>j.degree>=3)
  assert.ok(junctions.filter(j=>j.degree===3).length>junctions.length*.55,'T junctions interrupt the repeated four-way grid')
})
