import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exteriorLayout, islandDistance } from '../src/rooms/exteriorPlan.js'
import { galleryPlotContains, gallerySeaViewContains } from '../src/rooms/gallerySite.js'
import { lightState,GLASS_Z } from '../src/rooms/cityPlan.js'

const settlement = await import('../src/rooms/settlementPlan.js').catch(()=>({}))
const traffic = await import('../src/rooms/settlementTraffic.js').catch(()=>({}))

test('settlement has a dense core, lower outer neighborhoods and unbuilt land on every side',()=>{
  assert.equal(typeof settlement.settlementDensity,'function')
  assert.ok(settlement.settlementDensity(80,-80)>.8)
  for(const [x,z] of [[-650,-80],[800,-80],[80,-860],[80,720]]){
    assert.ok(settlement.settlementDensity(x,z)<.4,'outer city is lower density than its core')
  }
  const lots=exteriorLayout().boxes.filter(b=>b.y===0&&b.h<90)
  const core=lots.filter(b=>Math.hypot(b.x-80,b.z+80)<320)
  const outer=lots.filter(b=>Math.hypot(b.x-80,b.z+80)>560)
  // The inhabited core now reserves continuous woodland fingers instead of
  // filling every former office lot. Keep a substantial mixed centre while
  // the separate housing tests require real homes and everyday amenities.
  assert.ok(core.length>50&&outer.length>25)
  const average=items=>items.reduce((sum,b)=>sum+b.h,0)/items.length
  assert.ok(average(core)>average(outer)*1.6,'height falls before the vegetation belt')
  const segments=settlement.settlementRoadSegments()
  for(const s of segments)for(let i=0;i<=10;i++){
    const x=s.x0+(s.x1-s.x0)*i/10,z=s.z0+(s.z1-s.z0)*i/10
    assert.ok(islandDistance(x,z)<-220,'streets stay in settled inland ground')
    assert.ok(!galleryPlotContains(x,z,8)&&!gallerySeaViewContains(x,z,0))
  }
  assert.ok(new Set(segments.map(s=>s.x0)).size>10&&new Set(segments.map(s=>s.z0)).size>10)
  for(const p of [[-760,-800],[890,-800],[-760,790],[850,790]])assert.equal(settlement.settlementRoadAt(...p),false)
})

test('outer neighborhoods use narrow local streets with matching physical lamp placement',()=>{
  const outer=settlement.settlementRoadSegments().filter(s=>settlement.settlementDensity((s.x0+s.x1)/2,(s.z0+s.z1)/2)<.5)
  assert.ok(outer.length>20)
  assert.ok(outer.every(s=>s.half<6),'local streets narrow as the homes become smaller and sparser')
  assert.equal(typeof settlement.settlementLampPlan,'function')
  const lamps=settlement.settlementLampPlan()
  assert.ok(lamps.length>200&&lamps.length<1800)
  for(const p of lamps)assert.equal(settlement.settlementRoadAt(p.x,p.z,1),true,'poles follow the real street kerb')
})

test('settled traffic remains on continuous closed streets for a complete circuit',()=>{
  assert.equal(typeof traffic.createSettlementTraffic,'function')
  const flow=traffic.createSettlementTraffic()
  assert.ok(flow.vehicles.length>35&&flow.vehicles.length<250)
  for(const route of flow.routes){
    for(let s=0;s<route.length;s+=2){
      const p=traffic.settlementRouteAt(route,s,{})
      assert.equal(settlement.settlementRoadAt(p.x,p.z),true,`route leaves road at ${p.x},${p.z}`)
      assert.ok(!galleryPlotContains(p.x,p.z,10))
    }
    const a=traffic.settlementRouteAt(route,0,{}),b=traffic.settlementRouteAt(route,route.length,{})
    assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1e-7,'closed routes have no position seam')
    assert.ok(Math.abs(Math.sin(a.yaw-b.yaw))<1e-7,'closed routes have no heading seam')
  }
  const previous=flow.vehicles.map(v=>traffic.settlementRouteAt(v.route,v.s,{}))
  for(let frame=0;frame<7200;frame++){
    traffic.stepSettlementTraffic(flow,1/60)
    for(const [i,v] of flow.vehicles.entries()){
      const p=traffic.settlementRouteAt(v.route,v.s,{})
      assert.ok(Math.hypot(p.x-previous[i].x,p.z-previous[i].z)<=v.v0/60+.001,'traffic never teleports or disappears')
      previous[i]=p
    }
  }
})

test('settled traffic holds at a red stop line and resumes on green',()=>{
  const flow=traffic.createSettlementTraffic(),route=flow.routes.find(r=>r.stops.length>3&&r.length>500)
  assert.ok(route,'a multi-block street route is available')
  const stop=route.stops[0]
  const timeFor=state=>Array.from({length:100},(_,i)=>i).find(t=>lightState(t,stop.m,stop.n,stop.axis)===state)
  const car={...flow.vehicles[0],route,s:stop.s,v:0,v0:8}
  flow.vehicles=[car];flow.time=timeFor('red')
  const start=traffic.settlementRouteAt(route,car.s,{})
  for(let i=0;i<30;i++)traffic.stepSettlementTraffic(flow,1/60)
  const stopped=traffic.settlementRouteAt(route,car.s,{})
  assert.ok(Math.hypot(start.x-stopped.x,start.z-stopped.z)<.01,'red signal keeps the car at its stop line')
  flow.time=timeFor('green')
  for(let i=0;i<60;i++)traffic.stepSettlementTraffic(flow,1/60)
  assert.ok(car.v>1,'green releases a queued car smoothly')
})

test('vehicles on different loops keep a physical gap on shared street lanes',()=>{
  const flow=traffic.createSettlementTraffic()
  for(let frame=0;frame<3600;frame++){
    traffic.stepSettlementTraffic(flow,1/60)
    if(frame%30)continue
    const poses=flow.vehicles.map(car=>traffic.settlementRouteAt(car.route,car.s,{}))
    for(let i=0;i<poses.length;i++)for(let j=i+1;j<poses.length;j++){
      if(flow.vehicles[i].route===flow.vehicles[j].route)continue
      const a=poses[i],b=poses[j],dx=b.x-a.x,dz=b.z-a.z
      if(Math.cos(a.yaw-b.yaw)<.98)continue
      const across=Math.abs(dx*Math.sin(a.yaw)+dz*Math.cos(a.yaw))
      if(across>1.2)continue
      assert.ok(Math.hypot(dx,dz)>(flow.vehicles[i].len+flow.vehicles[j].len)/2+.2,'shared lane vehicles cannot occupy the same road space')
    }
  }
})
