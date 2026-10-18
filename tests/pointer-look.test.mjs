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
