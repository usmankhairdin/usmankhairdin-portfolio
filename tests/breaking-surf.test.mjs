import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as geometry from '../src/rooms/coastGeometry.js'
import { coastSurfaceAt } from '../src/rooms/coastSurface.js'
import { islandDistance } from '../src/rooms/islandLand.js'
import { GLASS_Z } from '../src/rooms/cityPlan.js'

const surf=await import('../src/rooms/breakerSurface.js').catch(()=>({}))

test('the breaking cross-section folds shoreward and rejoins the underlying water at both ends',()=>{
  assert.equal(typeof surf.breakerProfileAt,'function')
  const first=surf.breakerProfileAt(0),last=surf.breakerProfileAt(1)
  assert.equal(first.height,0);assert.equal(last.height,0)
  let folds=0
  for(let i=1;i<1000;i++){
    const u=i/1000,s=surf.breakerProfileAt(u),epsilon=1e-5
    assert.ok(Object.values(s).every(Number.isFinite))
    const before=surf.breakerProfileAt(u-epsilon),after=surf.breakerProfileAt(u+epsilon)
    assert.ok(Math.abs(s.dOffset-(after.offset-before.offset)/(2*epsilon))<.02)
    assert.ok(Math.abs(s.dHeight-(after.height-before.height)/(2*epsilon))<.002)
    if(s.dOffset<0&&s.height>.55)folds++
  }
  assert.ok(folds>80,'a real overhanging lip must fold horizontally; a height-only bump cannot satisfy this')
})

test('the breaker joins descend beneath the base sea instead of leaving an opaque shelf',()=>{
  assert.equal(typeof surf.breakerLiftAt,'function')
  assert.ok(surf.breakerLiftAt(0,6).lift<-.2)
  assert.ok(surf.breakerLiftAt(1,6).lift<-.2)
  assert.ok(surf.breakerLiftAt(.56,6).lift>5)
  for(let i=1;i<500;i++){
    const u=i/500,s=surf.breakerLiftAt(u,6),e=1e-5
    const measured=(surf.breakerLiftAt(u+e,6).lift-surf.breakerLiftAt(u-e,6).lift)/(2*e)
    assert.ok(Math.abs(s.slope-measured)<.03,'join normals include the gradual submergence')
  }
})

test('retiring breaker interiors submerge and their lip foam fades before the old visibility cutoff',()=>{
  for(const strength of [.024,.026,.035]){
    const lift=surf.breakerLiftAt(.5,12*strength,1,strength).lift
    assert.ok(lift<0,'even the highest retired lip is beneath the connected sea')
    assert.ok(surf.breakerLipAt(.5,1,strength)<.03,'an almost retired surface cannot retain a bright white polygon')
  }
})

test('staggered connected breakers have rooftop-visible relief and travel toward the beach',()=>{
  assert.equal(typeof surf.breakerWaveAt,'function')
  for(const seed of [37,9163]){
    const waves=[0,1,2].map(i=>surf.breakerWaveAt(90,-1000,7,i,seed))
    assert.ok(waves.filter(w=>w.strength>.3).length>=2,'multiple visible fronts coexist')
    assert.ok(waves.some(w=>w.height*w.strength>5.5),'the primary face retains more than five metres of relief at rooftop viewing distance')
    for(const [i,w] of waves.entries()){
      const next=surf.breakerWaveAt(90,-1000,7.1,i,seed)
      if(w.progress>.1&&w.progress<.85)assert.ok(next.center<w.center,'fronts travel landward rather than translating a flat foam map')
    }
    assert.ok(new Set(waves.map(w=>Math.round(w.center))).size===3)
  }
})

// These fail if a folded sheet is simply faded out offshore, or if a moving
// shoreline is allowed to restore the height of an already collapsing event.
test('one incoming event carries whitewater onto the beach before its runup reverses',()=>{
  const seed=37,rest=surf.breakerPositionAt(90,-1000,0),frames=[]
  for(let time=0;time<80;time+=.04){
    const wave=surf.breakerWaveAt(rest.x,rest.z,time,0,seed)
    if(wave.waveId===1&&wave.progress>.25)frames.push({time,wave})
  }
  const turn=frames.reduce((best,frame)=>frame.wave.center<best.wave.center?frame:best)
  assert.ok(turn.wave.center<-70,'the same incoming event reaches wet beach sand instead of dying tens of metres offshore')
  const advancing=frames.filter(frame=>frame.time<turn.time)
  for(let i=1;i<advancing.length;i++)assert.ok(advancing[i].wave.center<advancing[i-1].wave.center,'the visible front continues advancing throughout crest collapse')
  const after=frames.find(frame=>frame.time>turn.time+2)
  assert.ok(after.wave.center>turn.wave.center+4,'the same event retreats after maximum runup')
  for(const {time,wave}of frames.filter(({wave})=>wave.progress>.64&&wave.progress<.91)){
    const p=surf.breakerPositionAt(rest.x,rest.z,wave.center+8)
    assert.ok(surf.breakerFoamAt(p.x,p.z,time,wave.center+8,{seed})>.08,'the collapsing wave hands its whitewater to the advancing and retreating shoreward bore')
    const sample=coastSurfaceAt(p.x,p.z,time,wave.center+8,{seed})
    assert.ok(sample.coverage>.9,'the same event carries connected water beneath its whitewater')
  }
})

test('a collapsing event cannot regain face height when the shoreline retreats',()=>{
  const seed=37,rest=surf.breakerPositionAt(90,-1000,0)
  let previous=Infinity
  for(let time=0;time<80;time+=.04){
    const wave=surf.breakerWaveAt(rest.x,rest.z,time,0,seed)
    if(wave.waveId!==1||wave.progress<.42)continue
    const height=wave.height*wave.strength
    assert.ok(height<=previous+.00001,`an already collapsed face cannot emerge again: ${previous} -> ${height} at t=${time}`)
    previous=height
  }
})

test('the incoming bore matches swash launch velocity without pausing or overshooting at contact',()=>{
  for(const seed of [37,9163])for(const [x,z]of [[90,-1000],[1100,-500],[-1100,500]])for(const index of [0,1,2]){
    let low=0,high=100
    for(let i=0;i<45;i++){
      const mid=(low+high)/2,wave=surf.breakerWaveAt(x,z,mid,index,seed)
      if(wave.waveId+wave.progress<1.64)low=mid
      else high=mid
    }
    const time=(low+high)/2,epsilon=.0001,front=t=>surf.breakerWaveAt(x,z,t,index,seed).front
    const before=(front(time)-front(time-epsilon))/epsilon,after=(front(time+epsilon)-front(time))/epsilon
    assert.ok(before<-5&&after<-5,'the collapsing front keeps travelling shoreward through contact')
    assert.ok(Math.abs(before-after)<.03,`the same water cannot change launch velocity at contact: ${before} -> ${after}`)
    let previous=Infinity
    for(let t=time-12;t<=time;t+=.04){
      const next=front(t)
      assert.ok(next<previous,'incoming propagation must stay monotone before beach contact')
      previous=next
    }
  }
})

test('each coast carries the same collapsed event in its displaced water, foam and shoreline',()=>{
  const cx=90,cz=GLASS_Z-24
  for(const seed of [37,9163])for(let ray=0;ray<12;ray++){
    const angle=ray*Math.PI/6,rest=surf.breakerPositionAt(cx+1000*Math.cos(angle),cz+1000*Math.sin(angle),0)
    let time=0,wave
    for(;time<80;time+=.02){wave=surf.breakerWaveAt(rest.x,rest.z,time,0,seed);if(wave.waveId===1&&wave.progress>=.82)break}
    assert.ok(time<80)
    assert.ok(wave.front<-78&&wave.front>-110,'the tracked event reaches the wet beach while protecting inland sand')
    assert.equal(wave.strength,0,'the folded face is retired by maximum runup')
    const p=surf.breakerPositionAt(rest.x,rest.z,wave.front+18),sample=coastSurfaceAt(p.x,p.z,time,wave.front+18,{seed})
    assert.ok(Math.abs(sample.edge-wave.front)<.001,'the actual shoreline is owned by that incoming event')
    assert.ok(sample.water-sample.beach>1,'a displaced bore carries water after the folded mesh has retired')
    assert.ok(surf.breakerFoamAt(p.x,p.z,time,wave.front+18,{seed})>.08,'the event retains advecting whitewater after face retirement')
  }
})

test('an actual event wrap cannot pop the shoreward bore or its foam',()=>{
  for(const seed of [37,9163])for(const [x,z]of [[90,-1000],[1100,-500],[-1100,500]]){
    const rest=surf.breakerPositionAt(x,z,0),initial=surf.breakerWaveAt(rest.x,rest.z,0,0,seed).waveId
    let low=0,high=80
    for(let i=0;i<40;i++){
      const mid=(low+high)/2
      if(surf.breakerWaveAt(rest.x,rest.z,mid,0,seed).waveId===initial)low=mid
      else high=mid
    }
    for(const d of [-95,-60,-35,0,40]){
      const p=surf.breakerPositionAt(rest.x,rest.z,d),before=coastSurfaceAt(p.x,p.z,low,d,{seed}),after=coastSurfaceAt(p.x,p.z,high,d,{seed})
      assert.ok(Math.abs(before.edge-after.edge)<.001&&Math.abs(before.water-after.water)<.001,'an invisible recycled mesh cannot reset shoreline motion')
      assert.ok(Math.abs(surf.breakerFoamAt(p.x,p.z,low,d,{seed})-surf.breakerFoamAt(p.x,p.z,high,d,{seed}))<.001,'event foam has no visible wrap')
    }
  }
})

test('whitewater spills shoreward while the seaward face and trough remain legible',()=>{
  assert.equal(typeof surf.breakerFoamEnvelope,'function')
  assert.ok(surf.breakerFoamEnvelope(-30,1,1)>.4,'broad whitewater survives beyond the lip')
  assert.ok(surf.breakerFoamEnvelope(35,1,1)<.1,'the seaward face is not filled by a bright flat wake')
  assert.ok(surf.breakerFoamEnvelope(-100,1,1)<.1,'a dark trough separates adjacent fronts')
})

test('spilling foam is localized to the curled lip rather than painting the entire raised face',()=>{
  assert.equal(typeof surf.breakerLipAt,'function')
  assert.equal(surf.breakerLipAt(.2,1),0)
  assert.ok(surf.breakerLipAt(.5,1)>.95)
  assert.equal(surf.breakerLipAt(.82,1),0)
  assert.equal(surf.breakerLipAt(.5,0),0)
})

test('spilling sections vary organically along a connected front and evolve with time',()=>{
  assert.equal(typeof surf.breakerSpillAt,'function')
  const samples=[]
  let change=0
  for(let x=-1200;x<1300;x+=19){
    const a=surf.breakerSpillAt(x,-1050,7,1,37),b=surf.breakerSpillAt(x,-1050,25,1,37)
    samples.push(a);change+=Math.abs(a-b)
  }
  assert.ok(Math.min(...samples)<.15&&Math.max(...samples)>.85,'blue unbroken sections and white spilling sections coexist')
  assert.ok(change/samples.length>.15,'the spilling pattern changes instead of remaining a fixed painted ridge')
})

test('broken water leaves a broad turbulent foam field while dry land stays uncovered',()=>{
  assert.equal(typeof surf.breakerFoamAt,'function')
  const time=4,wave=[0,1,2].map(i=>surf.breakerWaveAt(90,-1000,time,i,37)).find(w=>w.breaking>.6&&w.center>75)
  assert.ok(wave,'sample a breaking front rather than an unbroken offshore swell')
  const samples=[]
  for(let d=wave.center-75;d<wave.center-5;d+=5)samples.push(surf.breakerFoamAt(90,-1000,time,d,{seed:37}))
  assert.ok(samples.filter(f=>f>.12).length>8,'foam occupies a broad wake rather than a narrow Gaussian line')
  assert.equal(surf.breakerFoamAt(90,-1000,7,-140,{seed:37}),0)
  for(let d=-128;d<500;d+=4){
    const s=coastSurfaceAt(90,-1000,7,d,{seed:37})
    assert.ok(s.coverage>=0&&s.coverage<=1,'the connected underlying sea remains authoritative')
  }
})

test('foam fades continuously when a breaker retires and its next offshore front starts',()=>{
  const x=90,z=-1051.6864337,t=64.00575487,d=-45,options={seed:37}
  const before=surf.breakerFoamAt(x,z,t-.00001,d,options)
  const after=surf.breakerFoamAt(x,z,t+.00001,d,options)
  assert.ok(Math.abs(before-after)<.01,`a cycle wrap must not pop a foam field: ${before} -> ${after}`)
})

test('the foam field stays aligned with the actual raised lip instead of sampling a second world-space wave phase',()=>{
  const x=1020.328735,z=-587.171082,time=11,seed=37
  const wave=surf.breakerWaveAt(x,z,time,1,seed),d=wave.center-10
  const lip=surf.breakerPositionAt(x,z,d),clear=surf.breakerPositionAt(x,z,wave.center+30)
  assert.ok(surf.breakerFoamAt(lip.x,lip.z,time,d,{seed})>.15,'the reviewed east-side lip must retain its associated foam')
  assert.ok(surf.breakerFoamAt(clear.x,clear.z,time,wave.center+30,{seed})<.025,'foam does not drift onto the neighbouring clear face')
})

test('the curling sheet has enough cross-section samples and a closed island-wide seam',()=>{
  assert.equal(typeof geometry.createBreakerGeometry,'function')
  const mesh=geometry.createBreakerGeometry(),p=mesh.attributes.position,u=mesh.attributes.aAcross
  assert.ok(p.count>50000&&p.count<150000)
  assert.ok(mesh.index.count/3<300000)
  const unique=new Set([...u.array].map(v=>Math.round(v*10000)))
  assert.ok(unique.size>64,'the curl is modelled by many connected rows of vertices')
  assert.ok([...p.array].every(Number.isFinite))
  mesh.dispose()
})

test('offshore breaker placement preserves angular ordering on every side of the island',()=>{
  assert.equal(typeof surf.breakerPositionAt,'function')
  const mesh=geometry.createBreakerGeometry(1024,1),p=mesh.attributes.position,cx=90,cz=GLASS_Z-24
  for(const target of [-75,70,150,220,278])for(let i=0;i<1024;i++){
    const next=(i+1)%1024,a=surf.breakerPositionAt(p.getX(i),p.getZ(i),target),b=surf.breakerPositionAt(p.getX(next),p.getZ(next),target)
    const cross=(a.x-cx)*(b.z-cz)-(a.z-cz)*(b.x-cx)
    assert.ok(cross>0,`adjacent crest sections must not cross on ray ${i}, distance ${target}`)
    assert.ok(Math.abs(islandDistance(a.x,a.z)-target)<.05,'the ordered placement still follows the target coast contour')
  }
  // The old noisy-normal extrusion reversed segments 847/848 at this phase.
  const targetFor=i=>{const x=p.getX(i),z=p.getZ(i),w=surf.breakerWaveAt(x,z,19,0,37);return w.center+surf.breakerProfileAt(.6,w.breaking).offset}
  const a=surf.breakerPositionAt(p.getX(847),p.getZ(847),targetFor(847)),b=surf.breakerPositionAt(p.getX(848),p.getZ(848),targetFor(848))
  assert.ok((a.x-cx)*(b.z-cz)-(a.z-cz)*(b.x-cx)>0,'the reviewed north-coast reversal stays fixed')
  mesh.dispose()
})
