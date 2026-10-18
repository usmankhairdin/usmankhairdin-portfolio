// One world-space field gives housing, planting and the ground the same broad
// woodland fingers. It intentionally has no dependency on the street grid.
const corridors=[
  {axis:'z',offset:-210,a:100,period:310,phase:.6,b:28,detail:140,detailPhase:1.8,width:105,swell:18,widthPeriod:220,widthPhase:.4},
  {axis:'z',offset:315,a:95,period:340,phase:-1.1,b:35,detail:145,detailPhase:.1,width:98,swell:22,widthPeriod:260,widthPhase:.8},
  {axis:'x',offset:-150,a:130,period:360,phase:.9,b:35,detail:150,detailPhase:-.3,width:112,swell:22,widthPeriod:280,widthPhase:.3},
]
const smoothstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}

export function settlementWoodlandWeight(x,z){
  let weight=.1+.1*(.5+.5*Math.sin(x/230+Math.cos(z/310))*Math.cos(z/270-x/470))
  for(const c of corridors){
    const t=c.axis==='z'?z:x,across=c.axis==='z'?x:z
    const center=c.offset+c.a*Math.sin(t/c.period+c.phase)+c.b*Math.sin(t/c.detail+c.detailPhase)
    const width=c.width+c.swell*Math.sin(t/c.widthPeriod+c.widthPhase)
    weight=Math.max(weight,1-smoothstep(width*.36,width,Math.abs(across-center)))
  }
  return weight
}

const n=v=>Number(v).toFixed(8)
export const SETTLEMENT_ECOLOGY_GLSL=`
  float settlementWoodlandWeight(vec2 p){
    float weight=.1+.1*(.5+.5*sin(p.x/230.+cos(p.y/310.))*cos(p.y/270.-p.x/470.));
    ${corridors.map(c=>{
      const t=c.axis==='z'?'p.y':'p.x',across=c.axis==='z'?'p.x':'p.y'
      return `{float centre=${n(c.offset)}+${n(c.a)}*sin(${t}/${n(c.period)}+${n(c.phase)})+${n(c.b)}*sin(${t}/${n(c.detail)}+${n(c.detailPhase)});
      float width=${n(c.width)}+${n(c.swell)}*sin(${t}/${n(c.widthPeriod)}+${n(c.widthPhase)});
      weight=max(weight,1.-smoothstep(width*.36,width,abs(${across}-centre)));}`
    }).join('\n')}
    return weight;
  }
`
