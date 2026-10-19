import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPointerLook } from '../src/experience/pointerLook.js'

function fixture({legacy=false}={}) {
  const doc = new EventTarget(), changes = [], errors = []
  let resolve, reject, allowed = true, requests = 0
  const pending = new Promise((yes, no) => { resolve=yes; reject=no })
  const canvas = { requestPointerLock: () => { requests++; return legacy ? undefined : pending } }
  doc.pointerLockElement = null
  doc.exitPointerLock = () => { doc.pointerLockElement=null; doc.dispatchEvent(new Event('pointerlockchange')) }
  const control=createPointerLook(canvas,{document:doc,isAllowed:()=>allowed,onChange:(active,reason)=>changes.push([active,reason]),onUnavailable:error=>errors.push(error)})
  return {doc,canvas,control,changes,errors,resolve,reject,get requests(){return requests},block(){allowed=false},grant(){doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'));resolve()},escape(){doc.exitPointerLock()}}
}

test('capture waits for browser acknowledgement and supports event-only browsers',async()=>{
  for(const legacy of [false,true]){
    const f=fixture({legacy});f.control.request()
    assert.equal(f.changes.some(([active])=>active),false)
    f.grant();await Promise.resolve()
    assert.equal(f.changes.filter(([active])=>active).length,1)
    f.control.dispose()
  }
})

test('programmatic review release is different from Escape and can recapture on the outside gesture',()=>{
  const f=fixture();f.control.request();f.grant()
  f.control.release('review')
  assert.equal(f.changes.some(([,reason])=>reason==='escape'),false)
  f.control.request();f.grant();f.escape()
  assert.equal(f.changes.at(-1)[1],'escape')
  f.control.dispose()
})

test('a late lock grant cannot capture the cursor after review, route disposal, or disallowed state',async()=>{
  for(const cancel of ['review','dispose','blocked']){
    const f=fixture();f.control.request()
    if(cancel==='dispose')f.control.dispose()
    else if(cancel==='blocked')f.block()
    else f.control.release('review')
    f.grant();await Promise.resolve()
    assert.equal(f.doc.pointerLockElement,null,cancel)
    assert.equal(f.changes.some(([active])=>active),false,cancel)
    f.control.dispose()
  }
})

test('denied requests are caught once and expose the drag fallback',async()=>{
  const f=fixture();const done=f.control.request()
  f.reject(new Error('Not supported'));await done
  assert.equal(f.errors.length,1)
  assert.equal(f.changes.some(([active])=>active),false)
  f.control.dispose()
})

test('an old cancelled request cannot release a newer desired capture',async()=>{
  const doc=new EventTarget(), pending=[], changes=[]
  const canvas={requestPointerLock:()=>new Promise(resolve=>pending.push(resolve))}
  doc.pointerLockElement=null
  doc.exitPointerLock=()=>{doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'))}
  const control=createPointerLook(canvas,{document:doc,isAllowed:()=>true,onChange:(...state)=>changes.push(state),onUnavailable:()=>{}})
  const old=control.request()
  control.release('review')
  const current=control.request()
  doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'))
  pending[0]();await old
  assert.equal(doc.pointerLockElement,canvas)
  assert.equal(changes.some(([,reason])=>reason==='escape'),false)
  pending[1]();await current
  control.dispose()
})

test('a cancelled legacy request is still guarded if the canvas unmounts before acknowledgement',async()=>{
  const f=fixture({legacy:true})
  await f.control.request()
  f.control.release('review');f.control.dispose()
  f.grant()
  assert.equal(f.doc.pointerLockElement,null)
})

test('a rapid return to free look waits for the pending exit before recapturing',async()=>{
  const doc=new EventTarget(),changes=[];let requests=0
  const canvas={requestPointerLock(){requests++;doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'));return Promise.resolve()}}
  doc.pointerLockElement=null;doc.exitPointerLock=()=>{}
  const control=createPointerLook(canvas,{document:doc,isAllowed:()=>true,onChange:(...state)=>changes.push(state),onUnavailable:()=>{}})
  await control.request();control.release('cursor');control.request()
  doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'));await Promise.resolve()
  assert.equal(requests,2,'the next click must not be lost while the previous exit is awaiting acknowledgement')
  assert.equal(doc.pointerLockElement,canvas);assert.equal(changes.at(-1)[0],true)
  control.dispose()
})

test('a newer normal-mode click cancels a queued recapture before the exit acknowledgement',async()=>{
  const doc=new EventTarget();let requests=0
  const canvas={requestPointerLock(){requests++;doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'));return Promise.resolve()}}
  doc.pointerLockElement=null;doc.exitPointerLock=()=>{}
  const control=createPointerLook(canvas,{document:doc,isAllowed:()=>true,onChange:()=>{},onUnavailable:()=>{}})
  await control.request();control.release('cursor');control.request();control.release('cursor')
  doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'));await Promise.resolve()
  assert.equal(requests,1);assert.equal(doc.pointerLockElement,null)
  control.dispose()
})

test('native look requests raw device motion before any platform acceleration',async()=>{
  const f=fixture();let options
  f.canvas.requestPointerLock=value=>{options=value;return Promise.resolve()}
  await f.control.request()
  assert.deepEqual(options,{unadjustedMovement:true})
  f.control.dispose()
})

function rawFixture(failure='NotSupportedError'){
  const doc=new EventTarget(),options=[],changes=[],errors=[]
  let rejectRaw
  const canvas={requestPointerLock(value){
    options.push(value)
    if(value?.unadjustedMovement)return new Promise((_,reject)=>{rejectRaw=reject})
    doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'));return Promise.resolve()
  }}
  doc.pointerLockElement=null
  doc.exitPointerLock=()=>{doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'))}
  const control=createPointerLook(canvas,{document:doc,isAllowed:()=>true,onChange:(...state)=>changes.push(state),onUnavailable:e=>errors.push(e)})
  return {doc,canvas,control,options,changes,errors,reject(){doc.dispatchEvent(new Event('pointerlockerror'));rejectRaw(new DOMException('Raw device motion unavailable',failure))}}
}

test('unsupported raw motion retries regular capture on the same activation without exposing drag mode',async()=>{
  const f=rawFixture(),done=f.control.request()
  assert.deepEqual(f.options,[{unadjustedMovement:true}])
  f.reject();assert.equal(await done,true)
  assert.deepEqual(f.options,[{unadjustedMovement:true},undefined])
  assert.equal(f.errors.length,0)
  assert.deepEqual(f.changes,[[true,'capture']])
  f.control.dispose()
})

test('normal-mode release while raw capture is pending forbids a fallback recapture',async()=>{
  const f=rawFixture(),done=f.control.request()
  assert.deepEqual(f.options,[{unadjustedMovement:true}])
  f.control.release('cursor');f.reject();assert.equal(await done,false)
  assert.equal(f.options.length,1);assert.equal(f.doc.pointerLockElement,null);assert.equal(f.errors.length,0)
  f.control.dispose()
})

test('permission denial is reported once and never retried as a raw-support failure',async()=>{
  const f=rawFixture('NotAllowedError'),done=f.control.request()
  assert.deepEqual(f.options,[{unadjustedMovement:true}])
  f.reject();assert.equal(await done,false)
  assert.equal(f.options.length,1);assert.equal(f.errors.length,1)
  assert.equal(f.errors[0].name,'NotAllowedError')
  f.control.dispose()
})
