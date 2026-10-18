import assert from 'node:assert/strict'
import { readFile,stat } from 'node:fs/promises'
import { test } from 'node:test'
import { dirname,resolve } from 'node:path'
import { AIRPORT_OFFSET,AIRPORT_RUNWAY,AIRPORT_PLANES,AIRPORT_BUILDINGS,isAirportReserved,airportPointToIsland } from '../src/rooms/airportPlan.js'
import { islandDistance,exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { createIslandTreePlan } from '../src/rooms/islandTreePlan.js'

test('airport is grounded inland and reserved from homes and forest',()=>{
  assert.ok(AIRPORT_BUILDINGS.some(b=>b.role==='terminal')&&AIRPORT_BUILDINGS.some(b=>b.role==='hangar')&&AIRPORT_BUILDINGS.some(b=>b.role==='tower'))
  assert.ok(AIRPORT_PLANES.length>=2)
  for(const side of [-1,1]){
    const {x,z}=airportPointToIsland(AIRPORT_RUNWAY.x+side*AIRPORT_RUNWAY.w/2,AIRPORT_RUNWAY.z)
    assert.ok(islandDistance(x,z)<-180,'whole runway stays on dry inland ground')
  }
  const layout=exteriorLayout()
  for(const b of layout.boxes)assert.equal(isAirportReserved(b.x,b.z,Math.hypot(b.w,b.d)/2),false,'homes cannot occupy the runway/apron')
  for(const t of createIslandTreePlan(layout))assert.equal(isAirportReserved(t.x,t.z,t.radius+5),false,'crowns stay clear of aircraft and runway')
})

test('runtime aircraft keeps recognizable source geometry with mobile size textures',async()=>{
  const file='public/assets/city/airport/cessna172-runtime.glb',bytes=await readFile(file).catch(()=>null)
  assert.ok(bytes,'local source-derived civilian aircraft is present')
  assert.ok((await stat(file)).size<3*1024*1024,'aircraft texture payload is bounded')
  const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length).toString())
  const triangles=gltf.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0),0)
  assert.ok(triangles>13000&&triangles<15000,'full Cessna silhouette, fixed landing gear and cabin remain')
  assert.ok(gltf.images.length>=6,'authored civilian livery and normal maps remain embedded')
})

test('the entire airport import and local-loader dependency closure is present',async()=>{
  const pending=[resolve('src/rooms/IslandAirport.jsx')],visited=new Set()
  while(pending.length){
    const file=pending.pop();if(visited.has(file))continue;visited.add(file)
    const source=await readFile(file,'utf8')
    for(const match of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)){
      const imported=resolve(dirname(file),match[1]);await stat(imported)
      if(/Airport|airport/.test(imported))pending.push(imported)
    }
    for(const match of source.matchAll(/['"](\/assets\/[^'"]+)['"]/g)){
      const asset=resolve('public',match[1].slice(1).split('?')[0])
      assert.ok((await stat(asset)).size>0,`required loader asset is missing: ${asset}`)
    }
  }
})
