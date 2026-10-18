import { BLOCK, KIND, lightState, mulberry32 } from './cityPlan.js'
import { SETTLEMENT_GRID, settlementBlocks, settlementSourceRoadAt, settlementRoadAt, settlementRoadExists, settlementJunctions, landscapeHash } from './settlementPlan.js'
import { settlementWarpPoint, settlementWarpDirection } from './settlementWarp.js'

const wrap=(s,length)=>{const distance=s%length;return distance<0?distance+length:distance}
const CORNER=10, LATERAL_ACCEL=2, BRAKING=3.5
// Quintic corner coordinates have zero curvature at both tangent joins. Steering
// can build and unwind continuously instead of jumping onto a circular arc.
const ease=t=>1.5*t+t*t*t-3*t*t*t*t+1.5*t*t*t*t*t
const easeD=t=>1.5+3*t*t-12*t*t*t+7.5*t*t*t*t
const easeDD=t=>6*t-36*t*t+30*t*t*t
function sourceAt(route,u,out={}){
  u=wrap(u,route.sourceLength)
  for(const p of route.parts){
    if(u<=p.length){
      if(p.turn){
        const t=u/p.length,a=CORNER*ease(t),b=CORNER*(1-ease(1-t)),d=CORNER/p.length,dd=d/p.length
        out.x=p.x+p.dx*a+p.tx*b;out.z=p.z+p.dz*a+p.tz*b
        out.dx=d*(p.dx*easeD(t)+p.tx*easeD(1-t));out.dz=d*(p.dz*easeD(t)+p.tz*easeD(1-t))
        out.ddx=dd*(p.dx*easeDD(t)-p.tx*easeDD(1-t));out.ddz=dd*(p.dz*easeDD(t)-p.tz*easeDD(1-t))
      }else{out.x=p.x+p.dx*u;out.z=p.z+p.dz*u;out.dx=p.dx;out.dz=p.dz;out.ddx=0;out.ddz=0}
      return out
    }
    u-=p.length
  }
  return sourceAt(route,0,out)
}
function mappedAt(route,u,out={},withCurvature=true){
  const p=sourceAt(route,u,{}),d=settlementWarpDirection(p.x,p.z,p.dx,p.dz,{}),speed=Math.hypot(d.x,d.z)
  settlementWarpPoint(p.x,p.z,out)
  // Differentiate the exact mapped tangent along the analytic source curve.
  // The symmetric derivative is submillimetre, independent of render timesteps.
  out.sourceX=p.x;out.sourceZ=p.z;out.yaw=Math.atan2(-d.z,d.x);out.parameterSpeed=speed
  if(withCurvature){
    const h=.001,before=sourceAt(route,u-h,{}),after=sourceAt(route,u+h,{})
    const a=settlementWarpDirection(before.x,before.z,before.dx,before.dz,{}),b=settlementWarpDirection(after.x,after.z,after.dx,after.dz,{})
    out.curvature=(d.x*(b.z-a.z)-d.z*(b.x-a.x))/(2*h*speed*speed*speed)
  }
  return out
}
function arcIndex(route,s){
  const samples=route.samples
  let low=0,high=samples.length-1
  while(low+1<high){const mid=(low+high)>>1;if(samples[mid].s<=s)low=mid;else high=mid}
  return low
}
function worldDistanceAt(route,u){
  u=wrap(u,route.sourceLength)
  const samples=route.samples
  let low=0,high=samples.length-1
  while(low+1<high){const mid=(low+high)>>1;if(samples[mid].u<=u)low=mid;else high=mid}
  const a=samples[low],b=samples[high]
  return a.s+(b.s-a.s)*(u-a.u)/(b.u-a.u)
}
function stopLineParameter(route,part,axis,coordinate){
  const key=axis==='x'?'x':'z',direction=axis==='x'?part.dx:part.dz
  let low=part.u-1.5*CORNER,high=part.u+part.length+1.5*CORNER
  // A local street's painted line can begin after steering has started. Solve
  // its actual source-coordinate crossing through the adjacent eased corner.
  for(let i=0;i<36;i++){
    const middle=(low+high)/2
    if((sourceAt(route,middle,{})[key]-coordinate)*direction<0)low=middle;else high=middle
  }
  return (low+high)/2
}
export function settlementRouteAt(route,s,out={}){
  const forward=wrap(route.reverse?-s:s,route.length),index=arcIndex(route,forward),a=route.samples[index],b=route.samples[index+1]
  const t=(forward-a.s)/(b.s-a.s),t2=t*t,t3=t2*t,span=b.s-a.s
  // Hermite inversion uses the analytic du/ds at both ends, so short lookup
  // intervals do not introduce speed pulses through the quintic turn profile.
  const u=(2*t3-3*t2+1)*a.u+(t3-2*t2+t)*span/a.speed+(-2*t3+3*t2)*b.u+(t3-t2)*span/b.speed
  mappedAt(route,u,out,false)
  out.curvature=a.curvature+(b.curvature-a.curvature)*(forward-a.s)/(b.s-a.s)
  if(route.reverse){out.yaw+=Math.PI;out.curvature=-out.curvature}
  return out
}
function curveSpeedAt(route,s){
  const forward=wrap(route.reverse?-s:s,route.length),index=arcIndex(route,forward),a=route.samples[index],b=route.samples[index+1],key=route.reverse?'backwardLimit':'forwardLimit'
  return a[key]+(b[key]-a[key])*(forward-a.s)/(b.s-a.s)
}
function previewAt(route,s){
  const forward=wrap(route.reverse?-s:s,route.length),i=arcIndex(route,forward),a=route.samples[i],b=route.samples[i+1],t=(forward-a.s)/(b.s-a.s),direction=route.reverse?-1:1
  return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,dx:direction*(a.dx+(b.dx-a.dx)*t),dz:direction*(a.dz+(b.dz-a.dz)*t)}
}
function routeJunctions(route){
  const junctions=new Map(settlementJunctions().map(j=>[`${j.m},${j.n}`,j])),near=new Map()
  for(let i=0;i<route.samples.length-1;i+=3){
    const sample=route.samples[i],p=sourceAt(route,sample.u,{}),m=Math.round(p.x/BLOCK),n=Math.round((SETTLEMENT_GRID.originZ-p.z)/BLOCK),junction=junctions.get(`${m},${n}`)
    if(!junction||Math.hypot(p.x-junction.sourceX,p.z-junction.sourceZ)>24)continue
    if(!near.has(junction.id))near.set(junction.id,{junction,positions:[]})
    near.get(junction.id).positions.push(wrap(route.reverse?-sample.s:sample.s,route.length))
  }
  return [...near.values()].map(({junction,positions})=>{
    positions.sort((a,b)=>a-b)
    let gap=-1,cut=0
    for(let i=0;i<positions.length;i++){const space=wrap(positions[(i+1)%positions.length]-positions[i],route.length);if(space>gap){gap=space;cut=i}}
    const enter=positions[(cut+1)%positions.length],exit=positions[cut]
    return {id:junction.id,junction,enter,exit,span:wrap(exit-enter,route.length)}
  })
}
function roundedRoute(x0,z0,x1,z1,reverse=false){
  const parts=[]
  const line=(x,z,dx,dz,length)=>parts.push({x,z,dx,dz,length})
  const turn=(x,z,dx,dz,tx,tz)=>parts.push({x,z,dx,dz,tx,tz,turn:true,length:1.5*CORNER})
  line(x0+CORNER,z0,1,0,x1-x0-2*CORNER);turn(x1-CORNER,z0,1,0,0,1)
  line(x1,z0+CORNER,0,1,z1-z0-2*CORNER);turn(x1,z1-CORNER,0,1,-1,0)
  line(x1-CORNER,z1,-1,0,x1-x0-2*CORNER);turn(x0+CORNER,z1,-1,0,0,-1)
  line(x0,z1-CORNER,0,-1,z1-z0-2*CORNER);turn(x0,z0+CORNER,0,-1,1,0)
  let u=0
  for(const p of parts){p.u=u;u+=p.length}
  const route={parts,reverse,sourceLength:u,length:0,x0,z0,x1,z1,samples:[],stops:[]}
  const parameters=[0],prior={}
  for(const part of parts){const count=Math.ceil(part.length/.15);for(let i=1;i<=count;i++)parameters.push(part.u+part.length*i/count)}
  let distance=0
  for(let i=0;i<parameters.length;i++){
    const at=parameters[i],p=mappedAt(route,at,{})
    if(i)distance+=Math.hypot(p.x-prior.x,p.z-prior.z)
    route.samples.push({u:at,s:distance,x:p.x,z:p.z,dx:Math.cos(p.yaw),dz:-Math.sin(p.yaw),speed:p.parameterSpeed,curvature:p.curvature,limit:Math.min(12,Math.sqrt(LATERAL_ACCEL/Math.max(.00001,Math.abs(p.curvature))))})
    prior.x=p.x;prior.z=p.z
  }
  route.length=distance
  const size=route.samples.length-1
  for(const p of route.samples)p.forwardLimit=p.backwardLimit=p.limit
  // Two sweeps around the closed circuit propagate comfortable braking before
  // every bend, including the bend across the persistent route's distance seam.
  for(let pass=0;pass<2;pass++){
    for(let i=size-1;i>=0;i--){const a=route.samples[i],b=route.samples[i+1];a.forwardLimit=Math.min(a.forwardLimit,Math.sqrt(b.forwardLimit*b.forwardLimit+4.6*(b.s-a.s)))}
    route.samples[size].forwardLimit=route.samples[0].forwardLimit
    for(let i=1;i<=size;i++){const a=route.samples[i-1],b=route.samples[i];b.backwardLimit=Math.min(b.backwardLimit,Math.sqrt(a.backwardLimit*a.backwardLimit+4.6*(b.s-a.s)))}
    route.samples[0].backwardLimit=route.samples[size].backwardLimit
  }
  for(const junction of settlementJunctions()){
    if(junction.degree<3)continue
    for(const p of parts){
      if(p.turn)continue
      const axis=Math.abs(p.dx)>.5?'x':'d',across=Math.abs((junction.sourceX-p.x)*p.dz-(junction.sourceZ-p.z)*p.dx)
      if(across>3)continue
      const along=(junction.sourceX-p.x)*p.dx+(junction.sourceZ-p.z)*p.dz
      const approach=along+(reverse?18:-18)
      if(approach<0||approach>p.length)continue
      const sourceOffset=(axis==='x'?junction.avenueHalf:junction.streetHalf)+5.1
      const sourceDirection=(reverse?-1:1)*(axis==='x'?p.dx:p.dz)
      const coordinate=(axis==='x'?junction.sourceX:junction.sourceZ)-sourceDirection*sourceOffset
      const u=stopLineParameter(route,p,axis,coordinate),s=worldDistanceAt(route,u)
      route.stops.push({s:wrap(reverse?-s:s,route.length),m:junction.m,n:junction.n,axis,junction,sourceOffset})
    }
  }
  route.stops.sort((a,b)=>a.s-b.s)
  route.junctions=routeJunctions(route)
  return route
}
function perimeterExists(m,n,cols,rows){
  for(let x=m;x<m+cols;x++)if(!settlementRoadExists(x,n,'x')||!settlementRoadExists(x,n+rows,'x'))return false
  for(let z=n;z<n+rows;z++)if(!settlementRoadExists(m,z,'z')||!settlementRoadExists(m+cols,z,'z'))return false
  return true
}
function allowedVehicleKinds(route){
  const fits=[true,true,true],lengths=[4.5,12,2.1],widths=[1.9,2.5,.7]
  // Kerb clearance is checked in real world metres after the map's local
  // compression. A long bus cannot inherit a route solely from its centreline.
  for(let s=0;s<route.length;s+=.55){
    const p=settlementRouteAt(route,s,{}),dx=Math.cos(p.yaw),dz=-Math.sin(p.yaw)
    for(let kind=0;kind<3;kind++){
      if(!fits[kind])continue
      for(const along of [-lengths[kind]/2-.1,0,lengths[kind]/2+.1])for(const across of [-widths[kind]/2-.1,widths[kind]/2+.1]){
        if(!settlementRoadAt(p.x+dx*along-dz*across,p.z+dz*along+dx*across))fits[kind]=false
      }
    }
    if(!fits.some(Boolean))break
  }
  return fits.flatMap((valid,kind)=>valid?[kind]:[])
}
export function createSettlementTraffic(seed=451){
  const rnd=mulberry32(seed),routes=[],vehicles=[],bounds=new Map(),oz=SETTLEMENT_GRID.originZ
  for(const block of settlementBlocks()){
    const {m0:m,n0:n,cols,rows}=block
    if(landscapeHash(m,n,63)<.24)bounds.set(`${m},${n},${cols},${rows}`,{m,n,cols,rows})
    // A second class of longer routes crosses several neighborhood boundaries.
    for(const [w,h] of [[cols+1,rows],[cols,rows+1],[cols+1,rows+1]]){
      if(landscapeHash(m,n,64)>.18||!perimeterExists(m,n,w,h))continue
      bounds.set(`${m},${n},${w},${h}`,{m,n,cols:w,rows:h});break
    }
  }
  for(const {m,n,cols,rows} of bounds.values()){
    if(routes.length>=38||!perimeterExists(m,n,cols,rows))continue
    const reverse=rnd()>.5,off=reverse?1.7:-1.7
    const route=roundedRoute(m*BLOCK+off,oz-(n+rows)*BLOCK+off,(m+cols)*BLOCK-off,oz-n*BLOCK-off,reverse)
    let valid=true
    for(const sample of route.samples){const p=sourceAt(route,sample.u,{});if(!settlementSourceRoadAt(p.x,p.z)){valid=false;break}}
    if(!valid)continue
    route.allowedKinds=allowedVehicleKinds(route)
    if(!route.allowedKinds.length)continue
    routes.push(route)
    const count=Math.max(2,Math.floor(route.length/95))
    for(let i=0;i<count;i++){
      const choice=rnd()<.035?KIND.bus:rnd()<.12?KIND.bike:KIND.car,kind=route.allowedKinds.includes(choice)?choice:route.allowedKinds[0],v0=7+rnd()*3
      const shade=rnd(),paint=shade<.45?[.72,.74,.72]:shade<.7?[.08,.1,.12]:[.23+rnd()*.2,.12+rnd()*.2,.12+rnd()*.2]
      const s=(i+rnd()*.2)*route.length/count,car={kind,route,s,v:Math.min(v0,curveSpeedAt(route,s)),v0,len:[4.5,12,2.1][kind],paint,light:[.6+rnd()*.7,rnd(),rnd()],brake:0}
      const p=settlementRouteAt(route,car.s,{})
      if(vehicles.some(other=>{const q=settlementRouteAt(other.route,other.s,{});return Math.hypot(p.x-q.x,p.z-q.z)<(car.len+other.len)/2+6}))continue
      vehicles.push(car)
    }
  }
  // Initial poses are parked between junctions. Starting halfway through two
  // conflicting turns leaves neither driver enough distance to yield within
  // the same comfortable braking limit used during normal driving.
  const placed=[]
  for(const car of vehicles){
    let position
    for(let step=0;step<car.route.length*2;step++){
      const s=wrap(car.s+(step%2?1:-1)*Math.ceil(step/2)*.5,car.route.length)
      if(!car.route.junctions.every(event=>{
        const progress=wrap(s-event.enter,car.route.length),clearance=car.len/2+3
        return progress>event.span+clearance&&progress<car.route.length-clearance
      }))continue
      const p=settlementRouteAt(car.route,s,{})
      if(placed.some(other=>Math.hypot(p.x-other.x,p.z-other.z)<(car.len+other.len)/2+6))continue
      position={s,...p,len:car.len};break
    }
    if(!position)throw new Error('Traffic route has no clear initial approach space')
    car.s=position.s;car.v=0;placed.push(position)
  }
  return {routes,vehicles,lanes:[],turning:[],time:31,count:vehicles.length}
}
function crossingReservations(flow){
  const owners=flow.junctionOwners??=new Map(),requests=flow.junctionRequests??=new WeakMap(),near=new Map(),live=new Set(flow.vehicles)
  const context=(car,event)=>{
    const progress=wrap(car.s-event.enter,car.route.length),inside=progress<=event.span
    const stop=car.route.stops.find(stop=>stop.junction.id===event.id)
    const past=stop?wrap(car.s-stop.s,car.route.length)<event.span+8:inside
    const green=!stop||lightState(flow.time,stop.m,stop.n,stop.axis)==='green'
    return {car,event,inside,past,green,stop,progress,ahead:wrap(event.enter-car.s,car.route.length)}
  }
  for(const [id,claims] of owners){
    const retained=claims.filter(claim=>{
      if(!live.has(claim.car))return false
      const at=context(claim.car,claim.event)
      if(at.inside)claim.entered=true
      return !(claim.entered&&at.progress>claim.event.span+claim.car.len/2+2&&at.progress<claim.car.route.length/2||!at.past&&!at.green)
    })
    if(retained.length)owners.set(id,retained);else owners.delete(id)
  }
  for(const [index,car] of flow.vehicles.entries()){
    const active=new Set(),times=requests.get(car)||new Map()
    for(const event of car.route.junctions){
      const at=context(car,event)
      if(!at.inside&&at.ahead>45)continue
      active.add(event.id)
      const line=at.stop?wrap(at.stop.s-car.s,car.route.length):at.ahead
      // Priority begins at the actual queue, not at the distant lookahead
      // boundary. Otherwise an approaching car can leapfrog a bus that has
      // already waited through its red phase at the painted stop line.
      if(!times.has(event.id)&&(at.past||line<car.len/2+2))times.set(event.id,flow.time)
      at.since=times.get(event.id)??flow.time+line/Math.max(1,car.v);at.index=index
      if(!near.has(event.id))near.set(event.id,[])
      near.get(event.id).push(at)
    }
    for(const id of times.keys())if(!active.has(id))times.delete(id)
    requests.set(car,times)
  }
  const blocked=new Map()
  const paths=flow.junctionPaths??=new WeakMap(),limits=flow.junctionConflictLimits??=new WeakMap()
  const bodyPath=at=>{
    let cache=paths.get(at.car.route)
    if(!cache){cache=new Map();paths.set(at.car.route,cache)}
    const key=`${at.event.id}:${at.car.kind}:${at.car.len}`
    if(cache.has(key))return cache.get(key)
    const samples=[],width=[1.9,2.5,.7][at.car.kind],margin=at.car.len/2+3
    for(let progress=-margin;progress<=at.event.span+margin;progress+=1){
      const p=settlementRouteAt(at.car.route,at.event.enter+progress,{})
      samples.push({x:p.x,z:p.z,dx:Math.cos(p.yaw),dz:-Math.sin(p.yaw),half:at.car.len/2+1,side:width/2+1,progress})
    }
    cache.set(key,samples);return samples
  }
  const overlap=(a,b)=>{
    const x=b.x-a.x,z=b.z-a.z,dot=Math.abs(a.dx*b.dx+a.dz*b.dz),cross=Math.abs(a.dx*b.dz-a.dz*b.dx)
    return Math.abs(x*a.dx+z*a.dz)<a.half+b.half*dot+b.side*cross&&Math.abs(-x*a.dz+z*a.dx)<a.side+b.half*cross+b.side*dot&&Math.abs(x*b.dx+z*b.dz)<b.half+a.half*dot+a.side*cross&&Math.abs(-x*b.dz+z*b.dx)<b.side+a.half*cross+a.side*dot
  }
  const clearedConflict=(incoming,claim)=>{
    const a=bodyPath(incoming),b=bodyPath(claim)
    let cache=limits.get(a)
    if(!cache){cache=new WeakMap();limits.set(a,cache)}
    if(!cache.has(b)){
      let last=-Infinity
      for(let i=b.length-1;i>=0;i--){
        // Once both paths have joined the same outgoing direction, ordinary
        // leader following owns their gap. A queued car beyond the completed
        // turn must not retain the crossing and starve the perpendicular road.
        if(a.some(p=>p.dx*b[i].dx+p.dz*b[i].dz<.9&&overlap(p,b[i]))){last=b[i].progress+1;break}
      }
      cache.set(b,last)
    }
    let progress=wrap(claim.car.s-claim.event.enter,claim.car.route.length)
    if(progress>claim.car.route.length/2)progress-=claim.car.route.length
    return progress>cache.get(b)
  }
  const samePath=(a,b)=>{
    const a0=settlementRouteAt(a.car.route,a.event.enter,{}),a1=settlementRouteAt(a.car.route,a.event.exit,{})
    const b0=settlementRouteAt(b.car.route,b.event.enter,{}),b1=settlementRouteAt(b.car.route,b.event.exit,{})
    return Math.hypot(a0.x-b0.x,a0.z-b0.z)<1.3&&Math.hypot(a1.x-b1.x,a1.z-b1.z)<1.3&&Math.cos(a0.yaw-b0.yaw)>.99&&Math.cos(a1.yaw-b1.yaw)>.99
  }
  for(const [id,queue] of near){
    const claims=owners.get(id)||[]
    const eligible=queue.filter(at=>(at.green||at.past)&&(at.past||(at.stop?wrap(at.stop.s-at.car.s,at.car.route.length):at.ahead)<22)).sort((a,b)=>Number(b.past)-Number(a.past)||a.since-b.since||(a.inside?-a.progress:a.ahead)-(b.inside?-b.progress:b.ahead)||a.index-b.index)
    for(const at of eligible){
      if(claims.some(claim=>claim.car===at.car))continue
      // Drain the current platoon when an older conflicting approach is due;
      // younger same-path cars may not continuously starve that waiting turn.
      if(!claims.every(claim=>samePath(at,claim)||clearedConflict(at,claim)))break
      claims.push({car:at.car,event:at.event,entered:at.inside})
    }
    if(claims.length)owners.set(id,claims)
    for(const at of queue){
      if(claims.some(claim=>claim.car===at.car)||!claims.length&&!at.green&&!at.past)continue
      const hold=at.stop?wrap(at.stop.s-at.car.s,at.car.route.length):at.ahead
      const distance=at.past?0:Math.max(0,hold-at.car.len/2-.8)
      blocked.set(at.car,Math.min(blocked.get(at.car)??Infinity,distance))
    }
  }
  return blocked
}
export function stepSettlementTraffic(flow,dt){
  flow.time+=dt
  const poses=flow.vehicles.map(car=>settlementRouteAt(car.route,car.s,{}))
  const crossingStops=crossingReservations(flow)
  const updates=[]
  for(const [carIndex,car] of flow.vehicles.entries()){
    const p=poses[carIndex]
    let preview
    let target=Math.min(car.v0,curveSpeedAt(car.route,car.s)),gap=Infinity,leaderSpeed=0
    if(crossingStops.has(car))target=Math.min(target,Math.sqrt(2*2.8*crossingStops.get(car)))
    for(const stop of car.route.stops){
      const lineAhead=wrap(stop.s-car.s,car.route.length)
      // Descriptors locate the paint, not the vehicle centre. Subtract rigid
      // body length in world metres only after selecting an upcoming line;
      // wrapping that subtraction would miss a nose already at a red line.
      if(lineAhead<55&&lightState(flow.time,stop.m,stop.n,stop.axis)!=='green'){
        const before=Math.max(0,lineAhead-car.len/2-.5)
        target=Math.min(target,Math.sqrt(Math.max(0,2*3*(before-.03))))
      }
    }
    for(let i=0;i<flow.vehicles.length;i++){
      const next=flow.vehicles[i];if(next===car)continue
      if(next.route===car.route){
        const ahead=wrap(next.s-car.s,car.route.length),space=ahead-(next.len+car.len)/2-4
        if(space<gap){gap=space;leaderSpeed=next.v}
      }
      else{
        const q=poses[i]
        if((q.x-p.x)**2+(q.z-p.z)**2>55*55)continue
        preview??=Array.from({length:16},(_,k)=>previewAt(car.route,car.s+k*3))
        const qdx=Math.cos(q.yaw),qdz=-Math.sin(q.yaw)
        for(let k=0;k<preview.length-1;k++){
          const a=preview[k],b=preview[k+1],vx=b.x-a.x,vz=b.z-a.z,t=Math.max(0,Math.min(1,((q.x-a.x)*vx+(q.z-a.z)*vz)/(vx*vx+vz*vz)))
          const across=(q.x-a.x-t*vx)**2+(q.z-a.z-t*vz)**2,dot=qdx*(a.dx+(b.dx-a.dx)*t)+qdz*(a.dz+(b.dz-a.dz)*t),ahead=(k+t)*3
          if(ahead>0&&across<1.3*1.3&&dot>.93){
            const space=ahead-(next.len+car.len)/2-4
            if(space<gap){gap=space;leaderSpeed=next.v}
          }
        }
      }
    }
    // Match a moving leader instead of treating every queued car as a fixed
    // obstacle. The braking envelope retains the same physical standstill gap.
    target=Math.min(target,Math.max(0,leaderSpeed+gap*1.2),Math.sqrt(Math.max(0,leaderSpeed*leaderSpeed+2*3*Math.max(0,gap))))
    const v=car.v+Math.max(-BRAKING*dt,Math.min(1.6*dt,target-car.v))
    // The four-metre following allowance is a target spacing, not a wall in
    // front of a moving car. Only the final metre is a hard body-clearance cap.
    updates.push({v:Math.max(0,v),advance:Math.min(Math.max(0,v)*dt,Math.max(0,gap+3)),brake:target<car.v-.2?1:0})
  }
  flow.vehicles.forEach((car,i)=>{const update=updates[i];car.v=update.v;car.brake=update.brake;car.s=wrap(car.s+update.advance,car.route.length)})
}
