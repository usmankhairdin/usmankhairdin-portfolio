import assert from 'node:assert/strict'
import {test} from 'node:test'

const {createScreenSession}=await import('../src/rooms/liveScreenSession.js').catch(()=>({}))

test('one dismissal returns to walking and stale hover cannot reopen the same LED',()=>{
  assert.equal(typeof createScreenSession,'function')
  const session=createScreenSession()
  assert.equal(session.enter('forma'),true)
  assert.equal(session.active,'forma')
  assert.equal(session.exit(),'forma')
  assert.equal(session.active,null)
  assert.equal(session.enter('forma'),false)
  assert.equal(session.exit(),null)
  session.leave('forma')
  assert.equal(session.enter('forma'),true)
})

test('late loads from a closed website cannot reopen a screen or replace another project',()=>{
  assert.equal(typeof createScreenSession,'function')
  const session=createScreenSession()
  session.enter('forma')
  const old=session.version
  session.exit()
  session.enter('sanaira')
  assert.equal(session.matches('forma',old),false)
  assert.equal(session.matches('sanaira',session.version),true)
  session.exit()
  assert.equal(session.matches('sanaira',session.version-1),false)
})

test('a deliberate second click can reopen the same screen without a hover-leave ritual',()=>{
  const session=createScreenSession()
  session.enter('forma')
  session.exit()
  assert.equal(session.enter('forma',{explicit:true}),true)
})
