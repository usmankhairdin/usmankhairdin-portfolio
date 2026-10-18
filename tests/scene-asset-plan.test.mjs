import assert from 'node:assert/strict'
import {access} from 'node:fs/promises'
import {test} from 'node:test'
const assets=await import('../src/experience/sceneAssetPlan.js').catch(()=>({}))
test('both preload qualities resolve every local dependency before the procedural scene mounts',async()=>{
 assert.equal(typeof assets.sceneAssetPlan,'function')
 for(const quality of ['hi','lo']){
  const plan=assets.sceneAssetPlan(quality)
  const urls=Object.values(plan).flat()
  assert.ok(urls.length>50,'gate includes models, room maps, source photographs and project captures')
  for(const url of urls)await access('public'+url.split('?')[0])
  assert.ok(!urls.some(url=>/bizcare|bansar|pnw-leads/.test(url)))
 }
})
