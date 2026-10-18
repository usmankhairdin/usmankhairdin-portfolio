import { BLOCK, GLASS_Z, avenueOf, streetOf } from './cityPlan.js'
import { islandDistance } from './islandLand.js'
import { GALLERY_PLOT, GALLERY_SITE, galleryPlotContains, gallerySeaViewContains } from './gallerySite.js'
import { AIRPORT_OFFSET, AIRPORT_SITE, AIRPORT_YAW, isAirportReserved } from './airportPlan.js'
import { SETTLEMENT_WARP_GLSL, settlementWarpPoint, settlementUnwarpPoint, settlementWarpDirection } from './settlementWarp.js'
export { settlementWarpPoint, settlementUnwarpPoint, settlementWarpDirection, settlementWarpJacobian, settlementWarpYaw } from './settlementWarp.js'

export const SETTLEMENT_GRID = Object.freeze({ size: 32, min: -16, originZ: GLASS_Z - 24 })
const clamp = x => Math.max(0, Math.min(1, x))
export const landscapeHash = (x, z, s = 0) => { const a = Math.sin(x * 127.1 + z * 311.7 + s * 71.3) * 43758.5453; return a - Math.floor(a) }
const smoothstep=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
// Seeded district patches and bent, unequal residential arms determine the
// silhouette. Their empty wedges are connected forest, not a circular fringe.
const districts=[
  [-15,-80,340,280,.25,1.85],[165,-5,250,220,-.3,1.4],
  [-230,80,215,130,-.28,.76],[-440,180,190,115,.25,.6],
  [-490,120,200,130,-.28,.62],[385,-230,220,130,-.35,.68],
  [205,315,155,205,.45,.69],[365,600,180,125,.7,.58],
  [465,700,120,80,.4,.42],
  [-115,-715,115,125,-.35,.55],[285,-715,105,130,.25,.55],
].map(([x,z,rx,rz,angle,weight],i)=>({x:x+(landscapeHash(i,19,812)-.5)*32,z:z+(landscapeHash(i,23,814)-.5)*32,rx:rx*(.92+.16*landscapeHash(i,3,817)),rz:rz*(.92+.16*landscapeHash(i,5,819)),angle:angle+(landscapeHash(i,8,821)-.5)*.15,weight}))
const arms=[
  [[-70,-90,150,.76],[-155,-210,145,.73],[-230,-300,140,.65],[-265,-415,95,.5],[-235,-560,100,.47],[-115,-715,95,.48]],
  [[-100,30,145,.77],[-280,130,145,.7],[-450,210,100,.58],[-630,95,75,.4]],
  [[140,-110,145,.9],[285,-165,145,.78],[420,-230,125,.66],[575,-310,75,.46]],
  [[120,20,165,.86],[200,200,140,.76],[175,395,130,.65],[345,565,115,.6],[450,700,75,.45]],
  [[385,-230,125,.65],[385,-425,100,.57],[335,-570,105,.5],[285,-715,100,.48]],
].map((points,arm)=>points.map(([x,z,width,weight],i)=>({x:x+(landscapeHash(arm,i,831)-.5)*36,z:z+(landscapeHash(arm,i,839)-.5)*36,width:width*(.94+.12*landscapeHash(arm,i,843)),weight})))
const connectors=arms.flatMap(points=>points.slice(1).map((b,i)=>({a:points[i],b})))
const forestIndents=[{x:380,z:170,rx:140,rz:100,weight:.25},{x:-165,z:330,rx:125,rz:115,weight:.22}]
function districtField(x,z){
  let value=0
  for(const d of districts){const c=Math.cos(d.angle),s=Math.sin(d.angle),dx=x-d.x,dz=z-d.z,u=(c*dx+s*dz)/d.rx,v=(-s*dx+c*dz)/d.rz;value=Math.max(value,d.weight*Math.exp(-u*u-v*v))}
  for(const {a,b}of connectors){
    const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)),width=a.width+(b.width-a.width)*t
    const px=x-a.x-dx*t,pz=z-a.z-dz*t
    value=Math.max(value,(a.weight+(b.weight-a.weight)*t)*Math.exp(-(px*px+pz*pz)/(width*width)))
  }
  for(const p of forestIndents)value-=p.weight*Math.exp(-(((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2))
  return Math.max(0,value)
}
export function settlementDensity(x, z) {
  return clamp(districtField(x,z)*smoothstep(250,430,-islandDistance(x,z)))
}
let cells, blocks, segments, roadMap, lamps, junctions
const key = (m, n, axis) => `${m},${n},${axis}`
export function settlementCells() {
  if (cells) return cells
  cells = new Map()
  for (let m = -11; m < 13; m++) for (let n = -11; n < 12; n++) {
    const sourceX = (m + .5) * BLOCK, sourceZ = SETTLEMENT_GRID.originZ - (n + .5) * BLOCK
    const { x, z } = settlementWarpPoint(sourceX, sourceZ), density = settlementDensity(x, z)
    if (density < .26 || islandDistance(x, z) > -290 || isAirportReserved(x, z, 62)) continue
    if (galleryPlotContains(x, z, 64) || gallerySeaViewContains(x, z, 58)) continue
    const park = density < .83 && landscapeHash(m, n, 19) > .87
    cells.set(`${m},${n}`, { m, n, x, z, sourceX, sourceZ, density, park })
  }
  return cells
}
export function settlementCellAt(x, z) {
  const p = settlementUnwarpPoint(x, z)
  return settlementCells().get(`${Math.floor(p.x / BLOCK)},${Math.floor((SETTLEMENT_GRID.originZ - p.z) / BLOCK)}`)
}
// Stable, irregularly sized neighborhoods remove internal streets before any
// renderer or vehicle sees the plan. Through avenues remain connected.
const avenueSpines = new Set([0]), streetSpines = new Set([0])
export function settlementBlocks() {
  if (blocks) return blocks
  blocks = []
  const claimed = new Set(), all = settlementCells()
  const choices = [[4, 1], [1, 4], [3, 1], [1, 3], [2, 2], [2, 1], [1, 2], [1, 1]]
  // Grow into unclaimed space from one frontier. Random anchor order strands
  // single cells between earlier merges and recreates the box lattice.
  const candidates = [...all.values()].sort((a,b)=>a.n-b.n||a.m-b.m)
  for (const c of candidates) {
    if (claimed.has(`${c.m},${c.n}`)) continue
    const offset = landscapeHash(Math.floor(c.m/3),Math.floor(c.n/3),109)>.5?0:1
    for (let i = 0; i < choices.length; i++) {
      const [cols, rows] = choices[(i + offset) % choices.length], members = []
      let fits = true
      for (let m = c.m; m < c.m + cols; m++) for (let n = c.n; n < c.n + rows; n++) {
        const entry = all.get(`${m},${n}`)
        if (!entry || claimed.has(`${m},${n}`) || m > c.m && avenueSpines.has(m) || n > c.n && streetSpines.has(n)) fits = false
        if (entry) members.push(entry)
      }
      if (!fits) continue
      const block = { id: `block:${c.m}:${c.n}`, m0: c.m, n0: c.n, cols, rows, cells: members }
      for (const entry of members) { claimed.add(`${entry.m},${entry.n}`); entry.block = block.id }
      blocks.push(block); break
    }
  }
  return blocks
}
function roadSafe(x, z, radius) {
  return islandDistance(x, z) + radius < -224 && !galleryPlotContains(x, z, radius + 12) && !gallerySeaViewContains(x, z, radius + 5) && !isAirportReserved(x, z, radius + 8)
}
function trimUnsupportedRoadEnds(map) {
  const incident=new Map(),ends=new Map()
  for(const s of map.values()){
    const vertices=[`${s.m},${s.n}`,`${s.m+(s.axis==='x'?1:0)},${s.n+(s.axis==='z'?1:0)}`]
    ends.set(s.id,vertices)
    for(const v of vertices){if(!incident.has(v))incident.set(v,new Set());incident.get(v).add(s.id)}
  }
  const leaves=[...incident.keys()].filter(v=>incident.get(v).size===1)
  while(leaves.length){
    const v=leaves.pop(),at=incident.get(v)
    if(at.size!==1)continue
    const id=at.values().next().value
    map.delete(id)
    for(const end of ends.get(id)){const edges=incident.get(end);edges.delete(id);if(edges.size===1)leaves.push(end)}
  }
}
function retainConnectedDistrict(map){
  const incident=new Map(),unseen=new Set(map.keys()),components=[]
  for(const s of map.values())for(const v of [`${s.m},${s.n}`,`${s.m+(s.axis==='x'?1:0)},${s.n+(s.axis==='z'?1:0)}`]){
    if(!incident.has(v))incident.set(v,[])
    incident.get(v).push(s.id)
  }
  while(unseen.size){
    const pending=[unseen.values().next().value],component=[]
    while(pending.length){
      const id=pending.pop()
      if(!unseen.delete(id))continue
      component.push(id)
      const s=map.get(id)
      for(const v of [`${s.m},${s.n}`,`${s.m+(s.axis==='x'?1:0)},${s.n+(s.axis==='z'?1:0)}`])pending.push(...incident.get(v))
    }
    components.push(component)
  }
  const main=components.sort((a,b)=>b.length-a.length)[0]||[],retained=new Set(main)
  // Reservation cuts can leave a tiny closed street island after stub pruning.
  // Those clearings stay green instead of painting a disconnected road loop.
  for(const id of map.keys())if(!retained.has(id))map.delete(id)
}
export function settlementRoadSegments() {
  if (segments) return segments
  settlementBlocks()
  const plan = settlementCells(), candidates = new Map(), oz = SETTLEMENT_GRID.originZ
  for (const c of plan.values()) for (const [m, n, axis, neighbor] of [
    [c.m, c.n, 'z', plan.get(`${c.m - 1},${c.n}`)], [c.m + 1, c.n, 'z', plan.get(`${c.m + 1},${c.n}`)],
    [c.m, c.n, 'x', plan.get(`${c.m},${c.n - 1}`)], [c.m, c.n + 1, 'x', plan.get(`${c.m},${c.n + 1}`)],
  ]) {
    if (neighbor?.block === c.block) continue
    const id = key(m, n, axis), sourceX0 = m * BLOCK, sourceZ0 = oz - n * BLOCK
    const sourceX1 = sourceX0 + (axis === 'x' ? BLOCK : 0), sourceZ1 = sourceZ0 - (axis === 'z' ? BLOCK : 0)
    const centre = settlementWarpPoint((sourceX0 + sourceX1) / 2, (sourceZ0 + sourceZ1) / 2), density = settlementDensity(centre.x, centre.z)
    let half = axis === 'x' ? streetOf(n).half : avenueOf(m).half
    if (density < .55) half = 3.7 + Math.max(0, density - .2) * 5
    // Store exactly the width represented in the shared byte texture.
    half = Math.round(half / 16 * 255) / 255 * 16
    const points = Array.from({ length: 33 }, (_, i) => settlementWarpPoint(sourceX0 + (sourceX1 - sourceX0) * i / 32, sourceZ0 + (sourceZ1 - sourceZ0) * i / 32))
    if (points.some(p => !roadSafe(p.x, p.z, half * 1.55 + 2))) continue
    const length = points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.z - points[i].z), 0)
    candidates.set(id, { id, m, n, axis, half, density, sourceX0, sourceZ0, sourceX1, sourceZ1, x0: points[0].x, z0: points[0].z, x1: points.at(-1).x, z1: points.at(-1).z, points, length })
  }
  // Reserved land can cut a perimeter after the block merge. Peel its orphaned
  // approach back to a real junction so no square street slab ends in a grove.
  trimUnsupportedRoadEnds(candidates)
  retainConnectedDistrict(candidates)
  segments = [...candidates.values()]
  roadMap = candidates
  return segments
}
export function settlementRoadExists(m, n, axis) { settlementRoadSegments(); return roadMap.has(key(m, n, axis)) }
export function settlementSourceRoadAt(x, z, padding = 0) {
  settlementRoadSegments()
  if (padding > 0) return segments.some(s => x >= Math.min(s.sourceX0, s.sourceX1) - s.half - padding && x <= Math.max(s.sourceX0, s.sourceX1) + s.half + padding && z >= Math.min(s.sourceZ0, s.sourceZ1) - s.half - padding && z <= Math.max(s.sourceZ0, s.sourceZ1) + s.half + padding)
  const avenue = roadMap.get(key(Math.floor(x / BLOCK + .5), Math.floor((SETTLEMENT_GRID.originZ - z) / BLOCK), 'z'))
  const street = roadMap.get(key(Math.floor(x / BLOCK), Math.floor((SETTLEMENT_GRID.originZ - z) / BLOCK + .5), 'x'))
  return Boolean(avenue && Math.abs(x - avenue.sourceX0) <= avenue.half || street && Math.abs(z - street.sourceZ0) <= street.half)
}
export function settlementRoadAt(x, z, padding = 0) {
  const p = settlementUnwarpPoint(x, z)
  // A conservative inverse metric protects circular canopies/footprints even
  // on the most compressed shoulder; zero padding exactly matches the shader.
  return settlementSourceRoadAt(p.x, p.z, Math.max(0, padding) * 1.6)
}
export function settlementJunctions() {
  if (junctions) return junctions
  settlementRoadSegments()
  const vertices = new Map()
  for (const s of segments) for (const [m, n] of [[s.m, s.n], [s.m + (s.axis === 'x' ? 1 : 0), s.n + (s.axis === 'z' ? 1 : 0)]]) vertices.set(`${m},${n}`, { m, n })
  junctions = [...vertices.values()].map(({ m, n }) => {
    const east = roadMap.get(key(m, n, 'x')), west = roadMap.get(key(m - 1, n, 'x')), south = roadMap.get(key(m, n, 'z')), north = roadMap.get(key(m, n - 1, 'z'))
    const sourceX = m * BLOCK, sourceZ = SETTLEMENT_GRID.originZ - n * BLOCK
    return { id: `${m}:${n}`, m, n, sourceX, sourceZ, ...settlementWarpPoint(sourceX, sourceZ), east: !!east, west: !!west, north: !!north, south: !!south, degree: [east, west, north, south].filter(Boolean).length, avenueHalf: Math.max(north?.half || 0, south?.half || 0), streetHalf: Math.max(east?.half || 0, west?.half || 0) }
  })
  return junctions
}
function lampSafe(x, z) { return !galleryPlotContains(x, z, 12) && !gallerySeaViewContains(x, z, 0) && !isAirportReserved(x, z, 10) }
export function settlementLampPlan() {
  if (lamps) return lamps
  lamps = []
  for (const s of settlementRoadSegments()) {
    const dense = s.half > 6.5, side = (s.m + s.n) % 2 ? 1 : -1
    for (const along of dense ? [20, 60] : [40]) for (const sign of dense ? [-1, 1] : [side]) {
      const sourceX = s.sourceX0 + (s.axis === 'x' ? along : sign * (s.half + .7)), sourceZ = s.sourceZ0 + (s.axis === 'z' ? -along : sign * (s.half + .7))
      const p = settlementWarpPoint(sourceX, sourceZ), tangent = settlementWarpDirection(sourceX, sourceZ, s.axis === 'x' ? 1 : 0, s.axis === 'z' ? -1 : 0)
      if (lampSafe(p.x, p.z)) lamps.push({ ...p, sourceX, sourceZ, tangent, yaw: Math.atan2(-tangent.z, tangent.x), warm: s.axis === 'x', roadId: s.id })
    }
  }
  return lamps
}
export function settlementRoadMask() {
  const { size, min } = SETTLEMENT_GRID, data = new Uint8Array(size * size * 4)
  for (const s of settlementRoadSegments()) {
    const at = ((s.n - min) * size + s.m - min) * 4
    if (at >= 0 && at < data.length) { data[at + (s.axis === 'z' ? 0 : 1)] = 255; data[at + (s.axis === 'z' ? 2 : 3)] = Math.round(s.half / 16 * 255) }
  }
  return data
}
const number=value=>Number(value).toFixed(8)
const DENSITY_GLSL=`
  float settledDensity(vec2 p){float density=0.;
    ${districts.map(d=>`{vec2 delta=p-vec2(${number(d.x)},${number(d.z)});vec2 q=vec2((${number(Math.cos(d.angle))})*delta.x+(${number(Math.sin(d.angle))})*delta.y,-(${number(Math.sin(d.angle))})*delta.x+(${number(Math.cos(d.angle))})*delta.y)/vec2(${number(d.rx)},${number(d.rz)});density=max(density,${number(d.weight)}*exp(-dot(q,q)));}`).join('\n')}
    ${connectors.map(({a,b})=>`{vec2 delta=p-vec2(${number(a.x)},${number(a.z)}),axis=vec2(${number(b.x-a.x)},${number(b.z-a.z)});float t=clamp(dot(delta,axis)/dot(axis,axis),0.,1.),width=mix(${number(a.width)},${number(b.width)},t);delta-=axis*t;density=max(density,mix(${number(a.weight)},${number(b.weight)},t)*exp(-dot(delta,delta)/(width*width)));}`).join('\n')}
    ${forestIndents.map(p=>`{vec2 q=(p-vec2(${number(p.x)},${number(p.z)}))/vec2(${number(p.rx)},${number(p.rz)});density-=${number(p.weight)}*exp(-dot(q,q));}`).join('\n')}
    return clamp(density*smoothstep(250.,430.,-islandDistance(p)),0.,1.);
  }
`
export const SETTLEMENT_GLSL = `
  uniform sampler2D uSettlement;
  ${SETTLEMENT_WARP_GLSL}
  vec4 settledCell(vec2 cell){if(any(lessThan(cell,vec2(-16.)))||any(greaterThanEqual(cell,vec2(16.))))return vec4(0.);return texture2D(uSettlement,(cell+vec2(16.5))/32.0);}
  bool settledAvenue(vec2 world){vec2 p=settledSourcePoint(world);return settledCell(vec2(floor(p.x/80.+.5),floor((${SETTLEMENT_GRID.originZ.toFixed(8)}-p.y)/80.))).r>.5;}
  bool settledStreet(vec2 world){vec2 p=settledSourcePoint(world);return settledCell(vec2(floor(p.x/80.),floor((${SETTLEMENT_GRID.originZ.toFixed(8)}-p.y)/80.+.5))).g>.5;}
  float settledAvenueHalf(vec2 world){vec2 p=settledSourcePoint(world);return settledCell(vec2(floor(p.x/80.+.5),floor((${SETTLEMENT_GRID.originZ.toFixed(8)}-p.y)/80.))).b*16.;}
  float settledStreetHalf(vec2 world){vec2 p=settledSourcePoint(world);return settledCell(vec2(floor(p.x/80.),floor((${SETTLEMENT_GRID.originZ.toFixed(8)}-p.y)/80.+.5))).a*16.;}
  vec2 settledJunctionHalves(vec2 world){
    vec2 p=settledSourcePoint(world),cell=vec2(floor(p.x/80.+.5),floor((${SETTLEMENT_GRID.originZ.toFixed(8)}-p.y)/80.+.5));
    vec4 eastSouth=settledCell(cell),west=settledCell(cell-vec2(1.,0.)),north=settledCell(cell-vec2(0.,1.));
    return vec2(max(eastSouth.r>.5?eastSouth.b:0.,north.r>.5?north.b:0.),max(eastSouth.g>.5?eastSouth.a:0.,west.g>.5?west.a:0.))*16.;
  }
  ${DENSITY_GLSL}
  bool settledLampSafe(vec2 p){
    if(p.x>${(GALLERY_PLOT.x0 - 12).toFixed(8)}&&p.x<${(GALLERY_PLOT.x1 + 12).toFixed(8)}&&p.y>${(GALLERY_PLOT.z0 - 12).toFixed(8)}&&p.y<${(GALLERY_PLOT.z1 + 12).toFixed(8)})return false;
    if(abs(p.x-${GALLERY_SITE.x.toFixed(8)})<140.&&p.y<${GALLERY_PLOT.z0.toFixed(8)})return false;
    vec2 d=p-vec2(${AIRPORT_OFFSET[0].toFixed(8)},${AIRPORT_OFFSET[2].toFixed(8)});vec2 a=vec2(${Math.cos(AIRPORT_YAW).toFixed(8)}*d.x-${Math.sin(AIRPORT_YAW).toFixed(8)}*d.y,${Math.sin(AIRPORT_YAW).toFixed(8)}*d.x+${Math.cos(AIRPORT_YAW).toFixed(8)}*d.y);
    return !(a.x>${(AIRPORT_SITE.minX - 10).toFixed(8)}&&a.x<${(AIRPORT_SITE.maxX + 10).toFixed(8)}&&a.y>${(AIRPORT_SITE.minZ - 10).toFixed(8)}&&a.y<${(AIRPORT_SITE.maxZ + 10).toFixed(8)});
  }
  float plannedLamp(vec2 delta){return 9./pow(81.+dot(delta,delta),1.5)*62.;}
  vec3 plannedStreetLighting(vec2 world){
    vec2 p=settledSourcePoint(world);vec3 lit=vec3(0.);float oz=${SETTLEMENT_GRID.originZ.toFixed(8)};
    for(int axis=0;axis<2;axis++)for(int k=-1;k<=1;k++){
      vec2 cell=axis==0?vec2(floor(p.x/80.+.5),floor((oz-p.y)/80.)+float(k)):vec2(floor(p.x/80.)+float(k),floor((oz-p.y)/80.+.5));
      vec4 info=settledCell(cell);float roadEnabled=axis==0?info.r:info.g,halfW=(axis==0?info.b:info.a)*16.;if(roadEnabled<.5)continue;
      bool dense=halfW>6.5;float side=mod(cell.x+cell.y,2.)>0.?1.:-1.;
      for(int a=0;a<2;a++)for(int b=0;b<2;b++){
        if(!dense&&(a>0||b>0))continue;
        float along=dense?(a==0?20.:60.):40.,signSide=dense?(b==0?-1.:1.):side;
        vec2 sourceLamp=axis==0?vec2(cell.x*80.+signSide*(halfW+.7),oz-cell.y*80.-along):vec2(cell.x*80.+along,oz-cell.y*80.+signSide*(halfW+.7));
        vec2 lamp=settledWorldPoint(sourceLamp);if(settledLampSafe(lamp))lit+=(axis==0?vec3(1.,.93,.84):vec3(1.,.7,.42))*plannedLamp(world-lamp);
      }
    }
    return lit;
  }
`
