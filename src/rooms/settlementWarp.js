// A radial twist changes whole neighborhood headings; gentle shears keep its
// arcs asymmetric. Each stage has an exact inverse and determinant one. The
// global maximum stretch is below 1.56, including both stages, so the shared
// 1.6 footprint-clearance bound remains conservative everywhere.
const profiles = [
  [[12, 340, .3], [5, 105, 1.2]],
  [[10, 390, -.7], [5, 95, .5]],
  [[5, 250, -1.1], [3, 145, .2]],
]
const twist={x:80,z:-80,radius:430,angle:.95,rotation:.18}
const value = (profile, t) => profile.reduce((sum, [a, scale, phase]) => sum + a * Math.sin(t / scale + phase), 0)
const derivative = (profile, t) => profile.reduce((sum, [a, scale, phase]) => sum + a / scale * Math.cos(t / scale + phase), 0)
function twistPoint(x,z,direction,out){
  const dx=x-twist.x,dz=z-twist.z,angle=direction*(twist.rotation+twist.angle*Math.exp(-(dx*dx+dz*dz)/(twist.radius*twist.radius))),c=Math.cos(angle),s=Math.sin(angle)
  out.x=twist.x+c*dx-s*dz;out.z=twist.z+s*dx+c*dz
  return out
}

export function settlementWarpPoint(x, z, out = {}) {
  const a = x + value(profiles[0], z), b = z + value(profiles[1], a)
  return twistPoint(a+value(profiles[2],b),b,1,out)
}
export function settlementUnwarpPoint(x, z, out = {}) {
  const p=twistPoint(x,z,-1,out)
  const a = p.x - value(profiles[2], p.z), b = p.z - value(profiles[1], a)
  out.x = a - value(profiles[0], b); out.z = b
  return out
}
export function settlementWarpJacobian(x, z, out = {}) {
  const a = x + value(profiles[0], z), b = z + value(profiles[1], a)
  const f = derivative(profiles[0], z), g = derivative(profiles[1], a), h = derivative(profiles[2], b)
  const xx=1+h*g,xz=f+h*(1+g*f),zx=g,zz=1+g*f
  const dx=a+value(profiles[2],b)-twist.x,dz=b-twist.z,r2=twist.radius*twist.radius,angle=twist.angle*Math.exp(-(dx*dx+dz*dz)/r2),c=Math.cos(angle+twist.rotation),s=Math.sin(angle+twist.rotation)
  const gx=-2*angle*dx/r2,gz=-2*angle*dz/r2
  const tx=c*(1-dz*gx)-s*dx*gx,tz=-c*dz*gz-s*(1+dx*gz)
  const ux=s*(1-dz*gx)+c*dx*gx,uz=-s*dz*gz+c*(1+dx*gz)
  out.xx=tx*xx+tz*zx;out.xz=tx*xz+tz*zz
  out.zx=ux*xx+uz*zx;out.zz=ux*xz+uz*zz
  return out
}
export function settlementWarpDirection(x, z, dx, dz, out = {}) {
  const j = settlementWarpJacobian(x, z)
  out.x = j.xx * dx + j.xz * dz; out.z = j.zx * dx + j.zz * dz
  return out
}
// Three.js positive yaw turns +x towards -z. Polar rotation keeps each entire
// building rigid rather than shearing its walls, roof and architectural kit.
export function settlementWarpYaw(x, z) {
  const j = settlementWarpJacobian(x, z)
  return Math.atan2(j.xz - j.zx, j.xx + j.zz)
}
const glslProfile = profile => profile.map(([a, scale, phase]) => `${a.toFixed(8)}*sin(t/${scale.toFixed(8)}+${phase.toFixed(8)})`).join('+')
export const SETTLEMENT_WARP_GLSL = `
  float settledWarpF(float t){return ${glslProfile(profiles[0])};}
  float settledWarpG(float t){return ${glslProfile(profiles[1])};}
  float settledWarpH(float t){return ${glslProfile(profiles[2])};}
  vec2 settledTwist(vec2 p,float direction){vec2 d=p-vec2(${twist.x.toFixed(8)},${twist.z.toFixed(8)});float a=direction*(${twist.rotation.toFixed(8)}+${twist.angle.toFixed(8)}*exp(-dot(d,d)/${(twist.radius*twist.radius).toFixed(8)})),c=cos(a),s=sin(a);return vec2(${twist.x.toFixed(8)},${twist.z.toFixed(8)})+vec2(c*d.x-s*d.y,s*d.x+c*d.y);}
  vec2 settledWorldPoint(vec2 p){float a=p.x+settledWarpF(p.y);float b=p.y+settledWarpG(a);return settledTwist(vec2(a+settledWarpH(b),b),1.);}
  vec2 settledSourcePoint(vec2 p){p=settledTwist(p,-1.);float a=p.x-settledWarpH(p.y);float b=p.y-settledWarpG(a);return vec2(a-settledWarpF(b),b);}
`
