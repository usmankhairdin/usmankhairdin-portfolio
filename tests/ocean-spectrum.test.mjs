import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as coast from '../src/rooms/coastSurface.js'
import { islandDistance } from '../src/rooms/exteriorPlan.js'
const { oceanWaveAt } = coast

function pointAtCoast(angle,d){
  const nx=Math.cos(angle),nz=Math.sin(angle)
  let low=0,high=4000
  for(let i=0;i<30;i++){
    const radius=(low+high)/2
    if(islandDistance(90+nx*radius,-12+nz*radius)<d)low=radius
    else high=radius
  }
  const radius=(low+high)/2
  return [90+nx*radius,-12+nz*radius]
}

test('every side of the island has one connected moving water edge and submerged offshore troughs',()=>{
  for(const seed of [0,9163])for(let ray=0;ray<24;ray++)for(let frame=0;frame<32;frame++){
    const t=frame*3,angle=ray*Math.PI/12
    let wasCovered=false,transitions=0
    for(let d=-128;d<=600;d+=4){
      const [x,z]=pointAtCoast(angle,d),sample=coast.coastSurfaceAt(x,z,t,d,{seed})
      const covered=sample.coverage>.5
      if(covered!==wasCovered)transitions++
      assert.ok(!wasCovered||covered,`water disconnected on ray ${ray} at t=${t}, d=${d}`)
      if(sample.coverage>.99)assert.ok(sample.water>=sample.beach,'covered water never falls through the beach mesh')
      if(d>=180){
        assert.equal(sample.coverage,1,'an offshore trough cannot expose a sand oval')
        assert.ok(sample.water-sample.beach>.1,'the offshore seabed remains below the wave trough')
      }
      wasCovered=covered
    }
    assert.equal(transitions,1,'each beach ray crosses exactly one waterline')
  }
})

test('the swash advances around the island in one coherent cycle',()=>{
  const arrivals=[]
  for(let ray=0;ray<16;ray++){
    const [x,z]=pointAtCoast(ray*Math.PI/8,-67)
    // Begin during the shared retreat, avoiding a cycle wrap at t=0.
    let previous=coast.coastSurfaceAt(x,z,7,-67).coverage>.5,arrival
    for(let frame=1;frame<=400;frame++){
      const time=7+frame*.04,covered=coast.coastSurfaceAt(x,z,time,-67).coverage>.5
      if(!previous&&covered){arrival=time;break}
      previous=covered
    }
    assert.ok(arrival!==undefined,'each shore participates in the runup cycle')
    arrivals.push(arrival)
  }
  assert.ok(Math.max(...arrivals)-Math.min(...arrivals)<1.4,'local variation must not split the wash into independently arriving strips')
})

test('a breaking crest travels landward before joining the swash',()=>{
  const crestAt=time=>{
    let strongest=-1,position
    for(let d=25;d<=100;d+=.25){
      const {breaker}=coast.coastSurfaceAt(0,0,time,d)
      if(breaker>strongest){strongest=breaker;position=d}
    }
    return position
  }
  const before=crestAt(3),after=crestAt(4)
  assert.ok(after<before-5&&after>before-12,'incoming crest moves toward decreasing island distance at a steady speed')
})

test('ocean normals track the same continuous wave field as the displaced surface',()=>{
  for(const [x,z,t] of [[0,0,0],[-1450,200,4.7],[12345,-9876,53.2]]){
    const epsilon=.001,wave=oceanWaveAt(x,z,t)
    const dx=(oceanWaveAt(x+epsilon,z,t).height-oceanWaveAt(x-epsilon,z,t).height)/(2*epsilon)
    const dz=(oceanWaveAt(x,z+epsilon,t).height-oceanWaveAt(x,z-epsilon,t).height)/(2*epsilon)
    assert.ok(Math.abs(wave.dx-dx)<1e-7)
    assert.ok(Math.abs(wave.dz-dz)<1e-7)
  }
})

test('grouped offshore swell has visible metre-scale rolling crests without jumping',()=>{
  let low=Infinity,high=-Infinity
  for(let i=0;i<600;i++){
    const t=i*.1,wave=oceanWaveAt(-1600,47,t),next=oceanWaveAt(-1600,47,t+.1)
    low=Math.min(low,wave.height);high=Math.max(high,wave.height)
    assert.ok(Math.abs(wave.height)<3.2)
    assert.ok(Math.abs(next.height-wave.height)<.35,'small elapsed time cannot make waves jump')
    assert.ok(Math.hypot(wave.dx,wave.dz)<.8,'swells roll without a folded surface')
  }
  assert.ok(high-low>2,'rougher swell must remain visible from the gallery')
})

test('resolved distant swell retains irregular crest spacing instead of a single repeated carrier',()=>{
  const peaks=[],height=s=>oceanWaveAt(s*.97,-1000-s*.24,5,40).height
  for(let s=-1400;s<1400;s++)if(height(s)>height(s-1)&&height(s)>height(s+1))peaks.push(s)
  const gaps=peaks.slice(1).map((p,i)=>p-peaks[i]),mean=gaps.reduce((sum,g)=>sum+g,0)/gaps.length
  const variation=Math.sqrt(gaps.reduce((sum,g)=>sum+(g-mean)**2,0)/gaps.length)/mean
  assert.ok(variation>.07,'long resolved wave groups cannot collapse into evenly spaced horizon ridges')
})

function swashEdgeAt(x,z,time,seed=0){
  let low=-128,high=0
  for(let i=0;i<30;i++){
    const d=(low+high)/2
    if(coast.coastSurfaceAt(x,z,time,d,{seed}).coverage<.5)low=d
    else high=d
  }
  return (low+high)/2
}

test('each mounted sea obtains fresh random entropy representable by a shader uniform',()=>{
  assert.equal(typeof coast.createOceanSeed,'function')
  const entropy=[0x13579b00,0x2468ac00],draw=array=>{array[0]=entropy.shift();return array}
  const a=coast.createOceanSeed(draw),b=coast.createOceanSeed(draw)
  assert.notEqual(a,b,'a new visit draws a fresh seed instead of selecting a preset')
  for(const seed of [a,b])assert.ok(seed>0&&seed<2**24&&Math.fround(seed)===seed)
})

test('seeded wave sets do not repeat the old swash cycle and change their spatial strength over time',()=>{
  const period=2*Math.PI/.68,sites=[[-700,-850],[700,-850],[-700,700],[700,700]]
  for(const seed of [37,9163,16407031]){
    const changes=sites.map(([x,z])=>Math.abs(swashEdgeAt(x,z,4.2,seed)-swashEdgeAt(x,z,4.2+period,seed)))
    assert.ok(Math.max(...changes)>3,'the same old cycle phase cannot reproduce the waterline')
    const ranges=[]
    for(let window=0;window<3;window++){
      const reaches=sites.map(([x,z])=>{
        let minimum=0
        for(let t=window*30;t<(window+1)*30;t+=.5)minimum=Math.min(minimum,swashEdgeAt(x,z,t,seed))
        return minimum
      })
      ranges.push(reaches)
    }
    assert.ok(ranges[0].some((r,i)=>Math.abs(r-ranges[2][i])>2),'30–90 second sets have changing runup ranges')
    const sideDifferences=ranges.map(r=>r[0]-r[1])
    assert.ok(Math.max(...sideDifferences)-Math.min(...sideDifferences)>1,'which side has stronger runup evolves rather than retaining one fixed offset')
  }
  const first=sites.map(([x,z])=>swashEdgeAt(x,z,12,37)),other=sites.map(([x,z])=>swashEdgeAt(x,z,12,9163))
  assert.ok(first.some((r,i)=>Math.abs(r-other[i])>2),'fresh seeds produce different continuous wave-set calculations')
})

test('the connected swash has broken foam density along its front',()=>{
  const time=3,foams=[]
  for(let x=-400;x<=400;x+=17){
    const edge=swashEdgeAt(x,-900,time)
    foams.push(Math.max(...[5,10,15,20,25,30].map(r=>coast.coastSurfaceAt(x,-900,time,edge+r).foam)))
  }
  assert.ok(Math.max(...foams)-Math.min(...foams)>.3,'white water has resolved gaps and clusters without breaking water coverage')
})

test('the connected swash has a raised rolling lip in its displaced surface',()=>{
  const time=3
  const edge=swashEdgeAt(0,0,time)
  const depth=r=>{const s=coast.coastSurfaceAt(0,0,time,edge+r);return s.water-s.beach}
  assert.ok(depth(10)-(depth(0)+depth(20))*.5>.1,'the moving lip is raised in the displaced surface rather than painted on a flat sheet')
})

test('the rolling front has visible volume from the gallery and spans several mesh contours',()=>{
  const time=3,edge=swashEdgeAt(0,0,time)
  const height=r=>coast.coastSurfaceAt(0,0,time,edge+r).water
  const start=height(0),end=height(80),raised=[]
  for(let r=0;r<=80;r+=10)raised.push(height(r)-(start+(end-start)*r/80))
  const metres=Math.max(...raised),pixelsAtFarShore=metres*900/(2*Math.tan(31*Math.PI/180)*1000)
  assert.ok(pixelsAtFarShore>1.2,'even at 1000m a 900px gallery view resolves the raised wave silhouette')
  assert.ok(raised.filter(h=>h>.75).length>=4,'the crest spans at least four 10m mesh samples rather than one narrow glowing row')
})

test('unresolved waves filter smoothly instead of aliasing into bright lines',()=>{
  for(const footprint of [0,1,4,8,20,45,64,80]){
    const wave=oceanWaveAt(47,-133,7,footprint)
    const next=oceanWaveAt(47,-133,7,footprint+.001)
    assert.ok(Math.abs(next.height-wave.height)<.001)
  }
  assert.deepEqual(oceanWaveAt(47,-133,7,100),{height:0,dx:0,dz:0})
})

test('shore normals follow the complete shoaling and runup surface',()=>{
  assert.equal(typeof coast.coastSurfaceAt,'function')
  for(const seed of [0,37,16407031])for(const [x,z,t,d] of [[-620,180,2,-104],[900,-320,9,-65],[90,-900,2.4,20],[-300,500,23,60],[180,-700,6.1,135],[600,400,70,210],[-190,1200,12.3,600]]){
    const epsilon=.001,normal={dx:.8,dz:.6,seed}
    const field=coast.coastSurfaceAt(x,z,t,d,normal)
    const sample=(ox,oz)=>coast.coastSurfaceAt(x+ox,z+oz,t,d+normal.dx*ox+normal.dz*oz,normal).water
    assert.ok(Math.abs(field.dx-(sample(epsilon,0)-sample(-epsilon,0))/(2*epsilon))<1e-6)
    assert.ok(Math.abs(field.dz-(sample(0,epsilon)-sample(0,-epsilon))/(2*epsilon))<1e-6)
  }
})

test('breaking sets vary their arrivals and runup along the beach while protecting dry sand',()=>{
  assert.equal(typeof coast.coastSurfaceAt,'function')
  const reaches=[],firstArrivals=[]
  let foamSamples=0
  for(const z of [-530,-170,210,570]){
    let reach=Infinity,arrival=null,wasDry=false
    for(let frame=0;frame<500;frame++){
      const t=frame*.1
      for(const d of [-170,-140,-128,-55,...Array.from({length:91},(_,i)=>-120+i*2)]){
        const s=coast.coastSurfaceAt(-630,z,t,d)
        assert.ok(Object.values(s).every(Number.isFinite))
        assert.ok(s.coverage>=0&&s.coverage<=1&&s.foam>=0&&s.foam<=1)
        if(d<=-128){
          assert.equal(s.coverage,0,'the inland dry margin cannot flood')
          assert.equal(s.foam,0,'foam cannot appear on protected dry sand')
          assert.equal(s.wet,0,'the protected margin remains dry between sets')
        }
        if(s.coverage>.6){reach=Math.min(reach,d);if(d===-55&&wasDry&&arrival===null)arrival=t}
        if(d===-55&&s.coverage<.1)wasDry=true
        if(s.foam>.35)foamSamples++
      }
    }
    reaches.push(reach);firstArrivals.push(arrival)
  }
  assert.ok(reaches.every(d=>d<=-55&&d>-128),'sets visibly advance onto the beach without flooding it')
  assert.ok(new Set(reaches).size>1,'different beach stretches have different runup reach')
  const crestVariations=[5,15,25,35].map(t=>{
    const heights=[-530,-170,210,570].map(z=>coast.coastSurfaceAt(-630,z,t,swashEdgeAt(-630,z,t)+24).water)
    return Math.max(...heights)-Math.min(...heights)
  })
  assert.ok(Math.max(...crestVariations)>.15,'actual rolling crest heights differ alongshore')
  assert.ok(firstArrivals.every(Number.isFinite)&&new Set(firstArrivals).size>1,'local arrivals vary within the coherent front')
  assert.ok(foamSamples>100,'breaking and retreating waves carry visible foam')
})
