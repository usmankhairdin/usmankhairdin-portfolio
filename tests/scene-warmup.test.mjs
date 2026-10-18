import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileScenePrograms, deferSceneWarmup } from '../src/experience/sceneWarmup.js'

test('discarded StrictMode setup cannot start asynchronous GPU compilation', () => {
  const tasks=[],cancelled=[]
  let runs=0
  const schedule=fn=>(tasks.push(fn),tasks.length)
  const cancel=id=>cancelled.push(id)
  const cleanup=deferSceneWarmup(()=>runs++,schedule,cancel)
  cleanup()
  deferSceneWarmup(()=>runs++,schedule,cancel)
  tasks.forEach(fn=>fn())
  assert.equal(runs,1)
  assert.deepEqual(cancelled,[1])
})

test('shader polling tolerates a material disposed during asynchronous compilation',async()=>{
  const material={},tasks=[]
  let currentProgram={isReady:()=>false}
  const renderer={compile:()=>new Set([material]),properties:{get:()=>({currentProgram})}}
  const job=compileScenePrograms(renderer,{}, {},fn=>(tasks.push(fn),tasks.length),()=>{})
  currentProgram=undefined
  tasks.shift()()
  assert.equal(await job.ready,true)
})

test('unmounted scene stops pending shader polling',async()=>{
  const tasks=[],cancelled=[]
  let reads=0
  const renderer={compile:()=>new Set([{}]),properties:{get:()=>{reads++;return {currentProgram:{isReady:()=>false}}}}}
  const job=compileScenePrograms(renderer,{}, {},fn=>(tasks.push(fn),tasks.length),id=>cancelled.push(id))
  job.cancel();tasks.shift()()
  assert.equal(await job.ready,false)
  assert.equal(reads,1)
  assert.deepEqual(cancelled,[1])
})
