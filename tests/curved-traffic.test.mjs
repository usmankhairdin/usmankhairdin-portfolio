import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as traffic from '../src/rooms/settlementTraffic.js'
import { settlementWarpPoint, settlementWarpDirection, settlementUnwarpPoint } from '../src/rooms/settlementWarp.js'

const angle=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))

test('traffic evaluates the warped street and its exact tangent at world arc distances',()=>{
  const flow=traffic.createSettlementTraffic()
  assert.ok(flow.routes.length>8,'the settlement keeps a varied network of persistent loops')
  let warped=0
  for(const route of flow.routes){
    for(let s=0;s<route.length;s+=3.7){
      const p=traffic.settlementRouteAt(route,s,{})
      assert.ok(Number.isFinite(p.sourceX)&&Number.isFinite(p.sourceZ),'source coordinates remain available for canonical road and signal identity')
      const expected=settlementWarpPoint(p.sourceX,p.sourceZ,{})
      assert.ok(Math.hypot(expected.x-p.x,expected.z-p.z)<1e-8,'vehicles use the same smooth map as the streets')
      if(Math.hypot(p.sourceX-p.x,p.sourceZ-p.z)>8)warped++
      const before=traffic.settlementRouteAt(route,s-.02,{}),after=traffic.settlementRouteAt(route,s+.02,{})
      assert.ok(Math.abs(Math.hypot(after.x-before.x,after.z-before.z)/.04-1)<.004,'route distance measures real metres after bending the district')
      assert.ok(angle(p.yaw,Math.atan2(before.z-after.z,after.x-before.x))<.002,'heading follows the actual tangent without angle interpolation')
      assert.ok(Number.isFinite(p.curvature),'the renderer and speed controller receive steering curvature')
    }
  }
  assert.ok(warped>500,'traffic follows visibly curved streets across the district')
})

test('curved traffic brakes before the tight part of a turn and keeps lateral acceleration comfortable',()=>{
  const flow=traffic.createSettlementTraffic(),route=flow.routes.find(r=>!r.reverse&&r.length>550)
  assert.ok(route,'long neighborhood routes connect more than one small block')
  const car={...flow.vehicles[0],route,s:0,v:10,v0:10}
  flow.vehicles=[car]
  let turns=0,cruise=0
  for(let i=0;i<18000;i++){
    traffic.stepSettlementTraffic(flow,1/120)
    const p=traffic.settlementRouteAt(route,car.s,{})
    if(Math.abs(p.curvature)>.06){turns++;assert.ok(car.v*car.v*Math.abs(p.curvature)<2.9,'curvature is anticipated rather than entered at full straight-line speed')}
    if(Math.abs(p.curvature)<.004&&car.v>7)cruise++
  }
  assert.ok(turns>500,'the vehicle reaches several complete turns')
  assert.ok(cruise>40,'straight stretches still allow natural cruising')
})

test('canonical junction stop lines hold on red and release without moving the phase identity',async()=>{
  const { lightState }=await import('../src/rooms/cityPlan.js')
  const flow=traffic.createSettlementTraffic(),route=flow.routes.find(r=>r.stops?.length>3)
  assert.ok(route,'persistent routes carry world-distance stop descriptors')
  const stop=route.stops[0],car={...flow.vehicles[0],route,s:stop.s,v:0,v0:8}
  const timeFor=state=>Array.from({length:100},(_,i)=>i).find(t=>lightState(t,stop.m,stop.n,stop.axis)===state)
  flow.vehicles=[car];flow.time=timeFor('red')
  const before=traffic.settlementRouteAt(route,car.s,{})
  for(let i=0;i<45;i++)traffic.stepSettlementTraffic(flow,1/120)
  const held=traffic.settlementRouteAt(route,car.s,{})
  assert.ok(Math.hypot(before.x-held.x,before.z-held.z)<.001,'warping the intersection must not let a red signal slip')
  flow.time=timeFor('green')
  for(let i=0;i<120;i++)traffic.stepSettlementTraffic(flow,1/120)
  assert.ok(car.v>1,'the same canonical junction releases the queue on green')
})

test('physical signal poles, arms and facing directions follow the same warped junction',async()=>{
  const signals=await import('../src/rooms/trafficSignals.js')
  assert.equal(typeof signals.createSettlementSignals,'function')
  const definitions=signals.createSettlementSignals()
  assert.ok(definitions.length>40,'signal definitions follow the actual connected settlement junctions')
  const visual=signals.buildTrafficSignalMeshes(definitions,-96,signals.settlementSignalState)
  assert.ok(visual.heads.length>100)
  for(const h of visual.heads){
    const pole=settlementWarpPoint(h.sourceX,h.sourceZ,{}),head=settlementWarpPoint(h.sourceHX,h.sourceHZ,{})
    assert.ok(Math.hypot(h.x-pole.x,h.z-pole.z)<1e-9,'kerb poles remain on their curved street')
    assert.ok(Math.hypot(h.hx-head.x,h.hz-head.z)<1e-9,'mast arms end above the warped approach lane')
    const normal=settlementWarpDirection(h.sourceHX,h.sourceHZ,...h.sourceNormal,{}),length=Math.hypot(normal.x,normal.z)
    assert.ok(Math.hypot(h.normal[0]-normal.x/length,h.normal[1]-normal.z/length)<1e-9,'lenses face traffic along the local road tangent')
    assert.equal(signals.settlementSignalState(31,h.signal,h.axis),signals.originalSignalState(31,h.signal,h.axis),'physical heads retain the traffic controller phase')
  }
  visual.dispose()
})

test('the complete car, bus and bike footprint stays on asphalt throughout its route',async()=>{
  const {settlementRoadAt}=await import('../src/rooms/settlementPlan.js')
  const flow=traffic.createSettlementTraffic(),checked=new Set(),kinds=new Set()
  for(const car of flow.vehicles){
    const key=`${flow.routes.indexOf(car.route)}:${car.kind}`
    if(checked.has(key))continue
    checked.add(key);kinds.add(car.kind)
    const width=[1.9,2.5,.7][car.kind]
    for(let s=0;s<car.route.length;s+=.8){
      const p=traffic.settlementRouteAt(car.route,s,{}),dx=Math.cos(p.yaw),dz=-Math.sin(p.yaw)
      for(const along of [-car.len/2,0,car.len/2])for(const across of [-width/2,width/2]){
        const x=p.x+dx*along-dz*across,z=p.z+dz*along+dx*across
        assert.ok(settlementRoadAt(x,z),`kind ${car.kind} overhangs a kerb at ${x},${z}`)
      }
    }
  }
  assert.equal(kinds.size,3,'all rendered vehicle types retain suitable persistent streets')
})

const vehiclePose=(car)=>traffic.settlementRouteAt(car.route,car.s,{})
function bodiesOverlap(a,b){
  const p=vehiclePose(a),q=vehiclePose(b),pAxis=[Math.cos(p.yaw),-Math.sin(p.yaw)],qAxis=[Math.cos(q.yaw),-Math.sin(q.yaw)]
  const axes=[pAxis,[-pAxis[1],pAxis[0]],qAxis,[-qAxis[1],qAxis[0]]]
  const radius=(car,axis)=>{const at=vehiclePose(car),forward=[Math.cos(at.yaw),-Math.sin(at.yaw)];return car.len/2*Math.abs(axis[0]*forward[0]+axis[1]*forward[1])+.95*Math.abs(-axis[0]*forward[1]+axis[1]*forward[0])}
  return axes.every(axis=>Math.abs((q.x-p.x)*axis[0]+(q.z-p.z)*axis[1])<radius(a,axis)+radius(b,axis))
}

test('a following vehicle queues with a real body gap on the same curved route',()=>{
  const flow=traffic.createSettlementTraffic(),route={...flow.routes[0],stops:[]}
  const lead={...flow.vehicles[0],kind:0,len:4.5,route,s:35,v:0,v0:0},follower={...lead,s:13,v:8,v0:8}
  flow.vehicles=[lead,follower]
  for(let i=0;i<600;i++){
    traffic.stepSettlementTraffic(flow,1/120)
    assert.ok(!bodiesOverlap(lead,follower),'following must respect body dimensions through a curved approach')
  }
  assert.ok(follower.v<.6,'the follower settles into the stopped queue')
})

test('vehicles arriving from different curves yield before merging into their shared lane',()=>{
  const flow=traffic.createSettlementTraffic(),samples=new Map()
  let fixture
  for(const [ri,route] of flow.routes.entries()){
    if(fixture)break
    for(let s=0;s<route.length&&!fixture;s+=1){
      const p=traffic.settlementRouteAt(route,s,{}),key=`${Math.round(p.x)},${Math.round(p.z)}`,bucket=samples.get(key)||[]
      for(const q of bucket){
        if(q.ri===ri||Math.hypot(q.p.x-p.x,q.p.z-p.z)>.4||Math.cos(p.yaw-q.p.yaw)<.999)continue
        const a=traffic.settlementRouteAt(route,s-12,{}),b=traffic.settlementRouteAt(flow.routes[q.ri],q.s-12,{})
        if(Math.cos(a.yaw-b.yaw)<.9&&Math.hypot(a.x-b.x,a.z-b.z)>7){fixture=[{route,s:s-12},{route:flow.routes[q.ri],s:q.s-12}];break}
      }
      bucket.push({ri,s,p});samples.set(key,bucket)
    }
  }
  assert.ok(fixture,'two real neighborhood routes approach the same lane from distinct curves')
  flow.vehicles=fixture.map(at=>({...flow.vehicles[0],...at,route:{...at.route,stops:[]},kind:0,len:4.5,v:4,v0:6}))
  const travel=[0,0]
  for(let i=0;i<2400;i++){
    const before=flow.vehicles.map(c=>c.s)
    traffic.stepSettlementTraffic(flow,1/120)
    assert.ok(!bodiesOverlap(...flow.vehicles),'the merging bodies never overlap at the curved lane entry')
    flow.vehicles.forEach((c,j)=>{travel[j]+=(c.s-before[j]+c.route.length)%c.route.length})
  }
  assert.ok(travel.every(distance=>distance>25),'both vehicles make progress after resolving the merge')
})

for(const [name,kind,len] of [['car',0,4.5],['bus',1,12]])for(const type of ['narrow T','wide boulevard']){
  test(`${name} brakes its front bumper just before the physical stop line at a ${type}`,async()=>{
    const {lightState}=await import('../src/rooms/cityPlan.js')
    let flow,fixture
    // The new uneven district boundary changes which direction fits a long
    // bus around an entire local loop. Pick a real eligible loop, preserving
    // the physical narrow-T assertion instead of forcing an unsafe bus route.
    for(const seed of [451,1,7,19]){
      flow=traffic.createSettlementTraffic(seed)
      const candidates=flow.routes.flatMap(route=>route.allowedKinds.includes(kind)?route.stops.map(stop=>({route,stop,half:stop.axis==='x'?stop.junction.avenueHalf:stop.junction.streetHalf})):[])
      fixture=candidates.find(({stop,half})=>type==='narrow T'?stop.junction.degree===3&&half<6:stop.axis==='d'&&stop.n===0&&half>12)
      if(fixture)break
    }
    assert.ok(fixture,`a real ${type} route accommodates the entire ${name}`)
    const {stop,half}=fixture,route={...fixture.route,stops:[stop]},car={...flow.vehicles[0],kind,len,route,s:stop.s-25,v:6,v0:8}
    flow.vehicles=[car]
    const red=Array.from({length:100},(_,i)=>i).find(t=>lightState(t,stop.m,stop.n,stop.axis)==='red')
    for(let i=0;i<2400;i++){flow.time=red;traffic.stepSettlementTraffic(flow,1/120)}
    assert.ok(car.v<.03,'the moving approach reaches a stable red-light stop')
    const p=traffic.settlementRouteAt(route,car.s,{}),front=settlementUnwarpPoint(p.x+Math.cos(p.yaw)*len/2,p.z-Math.sin(p.yaw)*len/2,{})
    const clearance=Math.abs(stop.axis==='x'?front.x-stop.junction.sourceX:front.z-stop.junction.sourceZ)-(half+5.1)
    assert.ok(clearance>.2,`front bumper must remain before the painted line; source clearance ${clearance}`)
    assert.ok(clearance<1,`the queue should use its physical stop line rather than stopping far back; source clearance ${clearance}`)
  })
}

test('a vehicle that has cleared a stop-line descriptor continues through a red transition',async()=>{
  const {lightState}=await import('../src/rooms/cityPlan.js'),flow=traffic.createSettlementTraffic()
  const route=flow.routes.find(r=>r.stops.some(stop=>Math.abs(traffic.settlementRouteAt(r,stop.s+1,{}).curvature)<.005))
  const stop=route.stops.find(stop=>Math.abs(traffic.settlementRouteAt(route,stop.s+1,{}).curvature)<.005)
  const car={...flow.vehicles[0],route:{...route,stops:[stop]},s:stop.s+1,v:1,v0:1}
  flow.vehicles=[car]
  const red=Array.from({length:100},(_,i)=>i).find(t=>lightState(t,stop.m,stop.n,stop.axis)==='red'),start=car.s
  for(let i=0;i<120;i++){flow.time=red;traffic.stepSettlementTraffic(flow,1/120)}
  assert.ok(car.v>.99&&car.s-start>.99,'a passed line is not wrapped into a nearby false stop behind the car')
})

test('the complete default fleet crosses and turns without body collisions or permanently blocked queues',()=>{
  const flow=traffic.createSettlementTraffic(),original=[...flow.vehicles],widths=[1.9,2.5,.7],still=original.map(()=>0)
  for(let frame=0;frame<18000;frame++){
    const before=flow.vehicles.map(car=>({s:car.s,v:car.v}))
    traffic.stepSettlementTraffic(flow,1/60)
    assert.equal(flow.vehicles.length,original.length,'conflict handling keeps every persistent vehicle')
    const poses=flow.vehicles.map(vehiclePose)
    for(let i=0;i<flow.vehicles.length;i++){
      const car=flow.vehicles[i],prior=before[i]
      assert.equal(car,original[i],'vehicles retain their identity through intersection queues')
      assert.ok(car.v>=prior.v-3.5/60-1e-8,'crossing conflicts are anticipated with comfortable braking')
      const moved=(car.s-prior.s+car.route.length)%car.route.length
      assert.ok(Math.abs(moved-car.v/60)<1e-6,`vehicle ${i} cannot alternate frozen poses with moving velocity at ${(frame/60).toFixed(2)}s`)
      still[i]=moved<.0008?still[i]+1/60:0
      assert.ok(still[i]<45,`vehicle ${i} remains blocked for an entire signal cycle`)
      for(let j=0;j<i;j++){
        const other=flow.vehicles[j],p=poses[i],q=poses[j],dx=q.x-p.x,dz=q.z-p.z
        if(dx*dx+dz*dz>((car.len+other.len)/2+3)**2)continue
        const a=[Math.cos(p.yaw),-Math.sin(p.yaw)],b=[Math.cos(q.yaw),-Math.sin(q.yaw)],axes=[a,[-a[1],a[0]],b,[-b[1],b[0]]]
        const overlap=axes.every(axis=>{
          const ra=car.len/2*Math.abs(axis[0]*a[0]+axis[1]*a[1])+widths[car.kind]/2*Math.abs(-axis[0]*a[1]+axis[1]*a[0])
          const rb=other.len/2*Math.abs(axis[0]*b[0]+axis[1]*b[1])+widths[other.kind]/2*Math.abs(-axis[0]*b[1]+axis[1]*b[0])
          return Math.abs(dx*axis[0]+dz*axis[1])<ra+rb
        })
        assert.ok(!overlap,`vehicles ${j}/${i} overlap at ${(frame/60).toFixed(2)}s while crossing or turning`)
      }
    }
  }
})
