import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'

test('ready corridor frames release boot even while an external website is still loading',()=>{
  const source=readFileSync(new URL('../src/experience/HomeExperience.jsx',import.meta.url),'utf8')
  const start=source.indexOf('function SceneReadySignal('),end=source.indexOf('\nfunction ExperienceHud',start)
  assert.ok(start>=0&&end>start)
  let frame,ready=0
  const component=new Function('useRef','useFrame','useLiveScreens','performance',source.slice(start,end)+';return SceneReadySignal;')
    (value=>({current:value}),fn=>{frame=fn},()=>({readiness:{complete:false}}),{mark(){}})
  component({onReady:()=>ready++})
  for(let i=0;i<8;i++)frame()
  assert.equal(ready,1,'an unrelated third-party website cannot extend the corridor loader')
  for(let i=0;i<20;i++)frame()
  assert.equal(ready,1)
})

test('the entrance can finish loading while the large forest transfer continues',()=>{
  const source=readFileSync(new URL('../src/experience/SceneAssetGate.jsx',import.meta.url),'utf8')
  const start=source.indexOf('const assets='),end=source.indexOf('export default function')
  const queued=[]
  const useLoader=Object.assign((loader,input)=>{
    if(input==='/forest.gltf')throw new Error('forest transfer still pending')
  },{preload:(loader,input)=>queued.push(input)})
  const assets=Object.fromEntries(['rooms','forest','city','helicopter','airport','corridor','roomMaps','sky','coast','beach','facade','portrait','laptop','logo'].map(key=>[key,`/${key}.gltf`]))
  assets.lightmaps=['/lightmap.webp'];assets.screens=['/screen.webp']
  const requests=new Function('useLoader','THREE','GLTFLoader','configureForestLoader','sceneAssetPlan','corridorTextureQuality',
    source.slice(start,end)+';return requests;')
    (useLoader,{TextureLoader(){},FileLoader(){}},function GLTFLoader(){},()=>{},()=>assets,()=> 'hi')
  assert.ok(queued.includes('/forest.gltf'),'the original forest is still downloaded automatically')
  assert.doesNotThrow(()=>{for(const request of requests)useLoader(request.loader,request.input)},'a pending forest must not keep the entrance behind its loader')
  assert.ok(requests.some(request=>request.input==='/rooms.gltf'),'the actual building remains required')
  assert.ok(requests.some(request=>request.input==='/sky.gltf'),'the sky remains required')
})
