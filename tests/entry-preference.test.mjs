import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldUseWebExperience, entryPreloadKey } from '../src/entryPreference.js'

test('phones and touch tablets go directly to Web, desktop retains Corridor', () => {
  assert.equal(shouldUseWebExperience({width:390,coarsePointer:true}),true)
  assert.equal(shouldUseWebExperience({width:760,coarsePointer:false}),true)
  assert.equal(shouldUseWebExperience({width:1024,coarsePointer:true}),true)
  assert.equal(shouldUseWebExperience({width:1440,coarsePointer:false}),false)
})
test('mobile speculative Home loading never selects the immersive bundle', () => {
  assert.equal(entryPreloadKey('home',true),'homeWeb')
  assert.equal(entryPreloadKey('home',false),'home')
  assert.equal(entryPreloadKey('work',true),'work')
})
