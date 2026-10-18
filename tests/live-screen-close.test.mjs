import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
import {createScreenSession} from '../src/rooms/liveScreenSession.js'

test('leaving an LED releases its keyboard focus without touching another website',()=>{
  const source=readFileSync(new URL('../src/rooms/LiveProjectScreens.jsx',import.meta.url),'utf8')
  const marker='  const close=useCallback(({gesture=false}={})=>{'
  const start=source.indexOf(marker),end=source.indexOf('  },[session,focus])',start)
  assert.ok(start>=0&&end>start)
  const close=new Function('session','entries','controls','setActive','focus','resumeCaptured','look','lookCapture','gesture',source.slice(start+marker.length,end))
  const session=createScreenSession();session.enter('forma')
  let released=0,otherReleased=0
  const entries={current:new Map([['forma',{frame:{blur(){released++}}}],['sanaira',{frame:{blur(){otherReleased++}}}]])}
  close(session,entries,{current(){}},()=>{},{exit(){}},{current:false},{cursorFree:true},{},true)
  assert.equal(released,1,'Escape must go back to the corridor after the website is dismissed')
  assert.equal(otherReleased,0)
  assert.equal(session.active,null)
})
