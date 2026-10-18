import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { AIRPORT_APRON_LIGHT_XS } from './airportPlan.js'

// Geometry is authored in metres in the airport's canonical frame. Wall,
// glazing and internal structure are separate; there is no filled hangar box.
export function buildAirportArchitecture() {
  const groups=new Map()
  function add(role,g){
    const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i)
      const top=Math.abs(n.getY(i))>.7,side=Math.abs(n.getX(i))>.7
      uv.setXY(i,(top?x:side?z:x)/5,(top?z:y)/5)
    }
    if(!groups.has(role))groups.set(role,[])
    groups.get(role).push(g)
  }
  function box(role,x,y,z,w,h,d,rx=0,rz=0){
    const g=new THREE.BoxGeometry(w,h,d)
    g.rotateX(rx);g.rotateZ(rz);g.translate(x,y+h/2,z);add(role,g)
  }
  function beam(role,a,b,width=.12){
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av)
    const g=new THREE.BoxGeometry(width,delta.length(),width)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()))
    g.translate(...av.add(bv).multiplyScalar(.5).toArray());add(role,g)
  }
  const terminal={x:-730,z:602}
  box('concrete',terminal.x,.18,terminal.z,69,.45,20)
  box('wall',-759,.63,602,10,4.35,19)
  box('wall',-701,.63,602,10,4.75,19)
  box('interior',-730,.65,602,48,.12,18.5)
  box('ceiling',-730,4.65,602,49,.18,19.5)
  box('roof',-730,4.9,602,69.8,.3,21.2)
  // Deep roof edge, parapet caps, individual standing seams and rain gutters.
  for(const z of [591.45,612.55])box('metal',-730,4.98,z,70,.38,.25)
  for(let x=-763;x<=-697;x+=2.2)box('metal',x,5.2,602,.045,.055,20.8)
  for(const x of [-764.2,-695.8])box('metal',x,.75,610.8,.13,4.4,.13)
  for(const z of [592.45,611.55]){
    for(let x=-752;x<-707;x+=3.75){
      box('glass',x+1.75,.9,z,3.45,3.5,.075)
      box('metal',x,.7,z,.13,4,.19)
      box('metal',x+1.75,2.1,z,3.5,.07,.13)
    }
    for(const y of [.78,4.48])box('metal',-730,y,z,46,.13,.21)
  }
  // Recessed lounge details visible behind the glass at both elevations.
  for(const x of [-745,-735,-725,-715]){
    box('seat',x,1.05,604,4.4,.14,.65)
    box('seat',x,1.2,604.35,4.4,.55,.1)
    for(const dx of [-1.7,1.7])box('metal',x+dx,.78,604,.08,.3,.5)
  }
  box('wall',-710,.8,598,6,1.1,1.1)
  for(const x of [-742,-730,-718])box('warmLens',x,4.43,602,6,.045,.2)
  for(const z of [589.3,614]){
    box('roof',-730,3.72,z,44,.23,4.5)
    box('ceiling',-730,3.68,z,43,.06,4.25)
    for(const x of [-750,-737,-724,-711]){
      box('metal',x,.63,z+(z>602?1.5:-1.5),.17,3.2,.17)
      box('warmLens',x,3.64,z,2.4,.04,.12)
    }
  }
  // Rooftop mechanical equipment: screened air handlers and exhaust vents.
  for(const x of [-751,-742]){
    box('equipment',x,5.22,601,4.7,1.05,2.4)
    for(let dx=-2;dx<=2;dx+=.4)box('metal',x+dx,5.37,602.23,.08,.7,.06)
  }
  for(const x of [-704,-699])box('metal',x,5.23,604,.35,.8,.35)

  // Maintenance hangar: masonry curb, corrugated sidewalls, gable roof,
  // exposed portal frames, open bifold door and a genuinely recessed bay.
  const hx=-844,hz=626
  box('concrete',hx,.18,hz,31,.24,29)
  box('hangarWall',hx-14.8,.42,hz,.28,7.4,28)
  box('hangarWall',hx+14.8,.42,hz,.28,7.4,28)
  box('hangarWall',hx,.42,hz-13.85,29.8,7.4,.3)
  for(let z=612.5;z<640;z+=.7)for(const side of [-1,1])box('hangarWall',hx+side*14.98,.52,z,.07,7.15,.12)
  for(let x=hx-14.4;x<hx+14.5;x+=.7)box('hangarWall',x,.52,612.0,.1,7.15,.07)
  const slope=Math.atan2(2.8,15),panel=Math.hypot(15,2.8)
  for(const side of [-1,1]){
    box('hangarRoof',hx+side*7.5,9.1,hz,panel,.18,30.2,0,-side*slope)
    for(let z=611.3;z<641;z+=.65)box('metal',hx+side*7.5,9.22,z,panel,.055,.045,0,-side*slope)
    box('metal',hx+side*15.25,7.65,hz,.22,.22,30.4)
  }
  box('metal',hx,10.54,hz,.28,.16,30.3)
  for(const z of [612.6,619,626,633,639.5]){
    for(const side of [-1,1]){
      beam('structure',[hx+side*14.5,.45,z],[hx+side*14.5,7.8,z],.2)
      beam('structure',[hx+side*14.5,7.8,z],[hx,10.5,z],.2)
      beam('structure',[hx+side*14.5,7.8,z],[hx+side*7.2,7.8,z],.12)
      beam('structure',[hx+side*7.2,7.8,z],[hx,10.5,z],.1)
    }
  }
  // Raised door leaves form a shallow awning, instead of blocking the bay.
  box('hangarWall',hx,7.9,641.15,27.4,1.4,.18,Math.PI*.37)
  for(let x=hx-13.5;x<=hx+13.5;x+=2.7)beam('metal',[x,7.8,640],[x,8.35,642.7],.08)
  for(const x of [hx-14.4,hx+14.4])box('metal',x,.42,640.2,.3,7.4,.38)
  box('equipment',hx-10,.42,614,5,1.5,.9)
  box('seat',hx+10,.42,615,3,2.2,1)
  for(const x of [hx-7,hx+7])box('warmLens',x,8.45,624,7,.06,.18)
  for(const z of [620,633]){
    box('metal',-828.8,6.7,z,.7,.17,.5)
    box('warmLens',-828.45,6.64,z,.15,.08,.4)
  }
  for(const x of [hx-15.5,hx+15.5]){
    box('bollard',x,.42,641,.18,1,.18)
    box('metal',x,.77,641,.19,.18,.19)
  }
  // Tower's slim core, external landings, stairs and projecting glazed cab.
  box('wall',-668,.18,602,5.4,10.4,5.4)
  box('concrete',-668,10.25,602,9,.24,9)
  box('ceiling',-668,12.75,602,9,.28,9)
  for(const x of [-671.4,-664.6]){
    box('glass',x,10.55,602,.08,2.15,6.8)
    for(const z of [598.6,605.4])box('metal',x,10.5,z,.12,2.4,.12)
  }
  for(const z of [598.6,605.4])box('glass',-668,10.55,z,6.8,2.15,.08)
  for(const z of [597.65,606.35]){
    box('metal',-668,10.55,z,9,.06,.06)
    for(let x=-672;x<=-664;x+=2)box('metal',x,10.3,z,.06,1,.06)
  }
  for(let i=0;i<20;i++)box('metal',-672.1,.18+i*.25,599+i*.29,1.1,.07,.34)
  box('metal',-672.1,5.05,605,1.4,.12,1.8)
  for(let i=0;i<21;i++)box('metal',-673.5,5.18+i*.25,605-i*.29,1.1,.07,.34)
  box('metal',-672.9,10.25,598.8,2.3,.12,1.2)
  beam('metal',[-672.7,1.25,599],[-672.7,6.1,604.6],.055)
  beam('metal',[-674.1,6.2,605],[-674.1,11.3,599.2],.055)
  box('metal',-668,13.03,602,.12,2.4,.12)
  box('redLens',-668,15.43,602,.18,.14,.18)

  // Apron flood mast heads have visible luminous panels, with no world lights.
  for(const x of AIRPORT_APRON_LIGHT_XS){
    box('metal',x,.18,618,.2,11.8,.2)
    box('metal',x,11.7,619,.18,.18,2.3)
    box('warmLens',x,11.74,620,.9,.08,.6,.35)
    box('equipment',x,0.2,618,.6,.9,.5)
  }
  return [...groups].map(([role,list])=>{
    const geometry=mergeGeometries(list);list.forEach(g=>g.dispose());return {role,geometry}
  })
}
