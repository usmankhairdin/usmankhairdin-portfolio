import assert from 'node:assert/strict'
import {afterEach,test} from 'node:test'
import {readFileSync} from 'node:fs'
import * as walkable from '../src/experience/walkable.js'
import * as input from '../src/experience/freeLook.js'

afterEach(()=>{input.lookCapture.request=input.lookCapture.release=null;input.setCursorFree(false);input.setRelativeLook(false);input.setLook(0)})

test('normal corridor walk faces the nearest corridor end instead of a side wall',()=>{
  assert.equal(typeof walkable.normalWalkYaw,'function')
  for(const [yaw,want] of [[.9,0],[-1.2,0],[2.1,Math.PI],[-2.4,-Math.PI],[Math.PI*8+.6,Math.PI*8]]){
    assert.ok(Math.abs(walkable.normalWalkYaw(0,-20,yaw)-want)<1e-10)
  }
})

test('terrace and room normal walks choose the nearest local straight axis',()=>{
  assert.equal(typeof walkable.normalWalkYaw,'function')
  for(const [x,z] of [[0,20.6],[36,-20],[0,-80],[-10,-8],[12,-24],[0,-56]]){
    for(const [yaw,want] of [[.5,0],[1.1,Math.PI/2],[-1.1,-Math.PI/2],[2.8,Math.PI]]){
      assert.ok(Math.abs(walkable.normalWalkYaw(x,z,yaw)-want)<1e-10,`wrong normal heading at ${x},${z}`)
    }
  }
})

test('switching into normal stops travel and smoothly straightens in place; free mode interrupts it',()=>{
  const source=readFileSync('src/experience/useCorridorCamera.js','utf8')
  const marker='  const toggleWalkingMode=useCallback(()=>{',start=source.indexOf(marker),end=source.indexOf('  },[cancelAutomaticTravel])',start)
  assert.ok(start>=0&&end>start)
  const track={current:{value:4,target:8,vel:2}},pos={current:{x:0,z:-20}},straightening={current:false}
  const toggle=new Function('input','normalWalkYaw','track','pos','straightening',`
    const {look,setCursorFree,lookCapture}=input,cancelAutomaticTravel=()=>{};
    ${source.slice(start+marker.length,end)}
  `).bind(null,input,walkable.normalWalkYaw,track,pos,straightening)
  input.setCursorFree(false);input.setLook(1.1,.4)
  toggle()
  assert.equal(input.look.cursorFree,true)
  assert.deepEqual(pos.current,{x:0,z:-20})
  assert.deepEqual(track.current,{value:4,target:4,vel:0})
  assert.equal(input.look.targetYaw,0);assert.equal(input.look.targetPitch,0)
  assert.equal(input.look.yaw,1.1,'the click must not snap the view instantly')
  input.stepLook(1/60)
  assert.ok(input.look.yaw<1.1&&input.look.yaw>0)
  const partial=input.look.yaw;let requests=0;input.lookCapture.request=()=>requests++
  toggle();input.stepLook(1)
  assert.equal(input.look.cursorFree,false);assert.equal(requests,1)
  assert.equal(input.look.yaw,partial,'returning to free look cancels the unfinished alignment')
})
