import assert from 'node:assert/strict'
import {afterEach,test} from 'node:test'
import {doors} from '../src/data/projects.js'
import {doorOpen,resetDoors,updateDoors} from '../src/experience/doorStates.js'
import {setEntranceOpen} from '../src/experience/entranceDoor.js'
import {DOOR_CENTRES} from '../src/experience/walkable.js'
import {createTerraceDoorState,MASTER_TERRACE_DOOR,stepTerraceDoor,terraceDoorPose} from '../src/experience/terraceDoor.js'

afterEach(()=>{resetDoors();setEntranceOpen(0)})

test('entrance and every room door stay shut until the visitor is close to the threshold',()=>{
  for(const d of DOOR_CENTRES){
    resetDoors();setEntranceOpen(0)
    const end=d.id==='entrance'||doors.find(door=>door.id===d.id)?.side==='end'
    for(let frame=0;frame<240;frame++)updateDoors(d.x+(end?0:2),d.z+(end?2:0),1/120)
    assert.equal(doorOpen(d.id),0,`${d.id} opens while the visitor is still two metres away`)
    for(let frame=0;frame<240;frame++)updateDoors(d.x+(end?0:.9),d.z+(end?.9:0),1/120)
    assert.ok(doorOpen(d.id)>.99,`${d.id} must open at close range`)
  }
})

test('the master-room handle stays still at a distance on both sides',()=>{
  const d=MASTER_TERRACE_DOOR
  for(const side of [-1,1]){
    const state=createTerraceDoorState()
    for(let frame=0;frame<300;frame++)stepTerraceDoor(state,d.x,d.z+side*2.2,1/120)
    assert.deepEqual(terraceDoorPose(state.progress),{open:0,angle:0,handle:0})
  }
})
