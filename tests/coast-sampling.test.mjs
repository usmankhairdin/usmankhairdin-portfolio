import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCoastGeometry } from '../src/rooms/coastGeometry.js'
import { islandDistance } from '../src/rooms/exteriorPlan.js'

test('the reference surf mesh resolves metre-scale relief across the full coast',()=>{
  const geometry=createCoastGeometry(),positions=geometry.attributes.position
  assert.ok(positions.count<350000)
  assert.ok(geometry.index.count/3<700000)
  const surf=[]
  for(let i=0;i<positions.count;i++){
    const d=islandDistance(positions.getX(i),positions.getZ(i))
    if(d>-125&&d<80)surf.push(d)
  }
  assert.ok(surf.length>80000,'the surf has enough actual vertices for small raised water detail')
  const levels=[...new Set(surf.map(d=>Math.round(d)))].sort((a,b)=>a-b)
  assert.ok(levels.length>80,'shore-normal sampling resolves the breaker shape')
  for(let i=1;i<levels.length;i++)assert.ok(levels[i]-levels[i-1]<=2)
  geometry.dispose()
})

test('the seaward mesh keeps enough samples for the visible 128 metre swells',()=>{
  const geometry=createCoastGeometry(),positions=geometry.attributes.position,levels=new Set()
  for(let i=0;i<positions.count;i++){
    const d=Math.round(islandDistance(positions.getX(i),positions.getZ(i)))
    if(d>=200&&d<=400)levels.add(d)
  }
  const ordered=[...levels].sort((a,b)=>a-b)
  assert.ok(ordered.length>=7,'visible offshore swell must have real displaced vertices')
  for(let i=1;i<ordered.length;i++)assert.ok(ordered[i]-ordered[i-1]<=40,'avoid flat offshore strips shaded as unresolved waves')
  geometry.dispose()
})
