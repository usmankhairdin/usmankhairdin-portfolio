import test from 'node:test'
import assert from 'node:assert/strict'
import { doors } from '../src/data/projects.js'
import { isFree, slide, toRoomLocal, toWorld } from '../src/experience/walkable.js'

test('an unobstructed doorway step follows the requested heading without pulling toward its centre',()=>{
  for(const door of doors)for(const offset of [-.35,.35])for(const direction of [-1,1]){
    const [x,z]=toWorld(door,3.5,offset)
    const [tx,tz]=toWorld(door,3.5+direction*.07,offset)
    assert.equal(isFree(tx,tz,()=>1),true,`${door.id}: fixture must be clear`)
    const out=[]
    assert.equal(slide(x,z,tx-x,tz-z,()=>1,out),true)
    const [lx,lz]=toRoomLocal(door,...out)
    assert.ok(Math.abs(lx-(3.5+direction*.07))<1e-10,door.id)
    assert.ok(Math.abs(lz-offset)<1e-10,`${door.id}: unrequested sideways movement`)
  }
})
