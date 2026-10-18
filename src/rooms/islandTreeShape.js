const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n))
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t)}

// The six crown forms share the two source scans. Deformation is common to
// bark, branches and foliage, so forks never detach from their own crown.
export function islandTreeLocalPoint(point,profile,height=30,radialScale=1){
  let {x,y,z}=point
  const t=clamp(y),branch=t*t*(3-2*t)
  if(profile===1){x=x*.81+.16*t*t;z=z*1.06-.055*branch;y=y<0?y:Math.pow(t,.9)}
  if(profile===2){x=x*1.17+.065*Math.sin(t*5.4)*branch;z=z*.88+.09*branch;y=y*(.93+.07*Math.cos(x*3.1))}
  const young=1-smooth((height-7)/9)
  y-=young*.13*Math.sin(clamp(y)*Math.PI)
  return {x:x*radialScale,y,z:z*radialScale}
}

export const ISLAND_TREE_SHAPE_GLSL=`
  vec3 islandTreeLocalPoint(vec3 point,float profile,float height,float radialScale){
    vec3 p=point;
    float t=clamp(p.y,0.,1.),branch=t*t*(3.-2.*t);
    if(profile>.5&&profile<1.5){p.x=p.x*.81+.16*t*t;p.z=p.z*1.06-.055*branch;p.y=p.y<0.?p.y:pow(t,.9);}
    if(profile>1.5){p.x=p.x*1.17+.065*sin(t*5.4)*branch;p.z=p.z*.88+.09*branch;p.y*=.93+.07*cos(p.x*3.1);}
    float young=1.-smoothstep(7.,16.,height);
    p.y-=young*.13*sin(clamp(p.y,0.,1.)*3.141592653589793);
    p.xz*=radialScale;
    return p;
  }
`
