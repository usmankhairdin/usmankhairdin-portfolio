import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Bell 206 cabin coordinates: +X is the nose; the imported shell remains at
// its authored metre scale. All equipment is inside that shell, below its roof.
export function createHelicopterCabin(makeMaterial) {
  const root=new THREE.Group()
  root.name='Bell 206 fitted cockpit and passenger cabin'
  const geometries=new Set(),materials=new Set()
  const geometry=g=>(geometries.add(g),g)
  const finish=(color,roughness=.72,metalness=0)=>{
    const source=new THREE.MeshStandardMaterial({color,roughness,metalness})
    const result=makeMaterial(source);source.dispose();materials.add(result);return result
  }
  const trim=finish('#252c35'), upholstery=finish('#34465d',.94)
  const metal=finish('#6e7c88',.42,.65), rubber=finish('#10151b',.96)
  const face=finish('#c2ccd0',.8), dial=finish('#131b23',.86), marking=finish('#e2e5dc',.8)
  const darkScreen=finish('#101a22',.18), toggle=finish('#8d9daa',.38,.5)
  const box=geometry(new THREE.BoxGeometry(1,1,1))
  const rounded=new Map()
  const add=(name,g,m,p,parent=root)=>{
    const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.position.set(...p)
    mesh.raycast=()=>null;parent.add(mesh);return mesh
  }
  const block=(name,dimensions,material,position,radius=0)=>{
    let g=box
    if(radius){
      const key=dimensions.join(',')
      if(!rounded.has(key))rounded.set(key,geometry(new RoundedBoxGeometry(...dimensions,3,radius)))
      g=rounded.get(key)
    }
    const mesh=add(name,g,material,position)
    if(!radius)mesh.scale.set(...dimensions)
    return mesh
  }
  const rod=(name,a,b,r,material)=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start)
    const mesh=add(name,geometry(new THREE.CylinderGeometry(r,r,delta.length(),8)),material,start.add(end).multiplyScalar(.5).toArray())
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize())
    return mesh
  }
  block('Textured cabin floor',[3.25,.055,1.15],rubber,[.55,.58,0])
  // Two individual front seats, with headrests, harness webbing and buckles.
  for(const z of [-.34,.34]){
    block('Pilot seat pedestal',[.38,.21,.34],trim,[1.22,.66,z],.035)
    block('Pilot contoured seat cushion',[.55,.15,.45],upholstery,[1.28,.83,z],.045)
    const back=block('Pilot seat back',[.14,.56,.45],upholstery,[1.01,1.12,z],.045)
    back.rotation.z=-.12
    block('Pilot head restraint',[.15,.18,.31],upholstery,[.96,1.47,z],.045)
    for(const side of [-1,1])rod('Shoulder harness',[1.10,1.37,z+side*.12],[1.37,.91,z+side*.045],.018,trim)
    block('Harness buckle',[.035,.047,.06],metal,[1.38,.92,z])
    // Bent cyclic grip in front of each pilot, with separate floor pivot.
    rod('Cyclic control column',[1.65,.61,z],[1.53,1.02,z],.018,metal)
    rod('Cyclic control grip',[1.53,1.02,z],[1.60,1.13,z],.027,rubber)
    block('Cyclic thumb switch',[.02,.025,.025],toggle,[1.60,1.14,z])
    for(const dz of [-.10,.10]){
      rod('Anti-torque pedal linkage',[1.91,.60,z+dz],[2.04,.69,z+dz],.012,metal)
      block('Anti-torque pedal',[.075,.025,.13],rubber,[2.04,.70,z+dz])
    }
  }
  rod('Pilot collective lever',[1.02,.67,-.58],[1.43,.92,-.58],.019,metal)
  rod('Collective throttle grip',[1.43,.92,-.58],[1.60,.94,-.58],.028,rubber)
  block('Rear passenger bench',[.66,.16,1.06],upholstery,[-.48,.80,0],.045)
  block('Rear bench back',[.14,.51,1.06],upholstery,[-.83,1.09,0],.04)
  for(const z of [-.35,0,.35])block('Rear lap belt buckle',[.05,.035,.055],metal,[-.30,.90,z])

  // The instrument binnacle faces the seats (-X). Bezel, glass, ticks and
  // needles have their own depth: they remain legible through side glazing.
  block('Instrument binnacle',[.28,.47,1.14],trim,[2.19,1.17,0],.055)
  block('Panel fascia',[.025,.39,1.04],face,[2.037,1.17,0],.018)
  const bezel=geometry(new THREE.CylinderGeometry(.073,.073,.019,24))
  const dialGeometry=geometry(new THREE.CircleGeometry(.060,24))
  const tickGeometry=geometry(new THREE.BoxGeometry(.006,.013,.004))
  const instruments=['Airspeed','Attitude','Altimeter','Vertical speed','Heading','Rotor RPM']
  for(let i=0;i<6;i++){
    const z=-.34+(i%3)*.21,y=1.28-Math.floor(i/3)*.18
    const rim=add(instruments[i]+' instrument bezel',bezel,trim,[2.013,y,z]);rim.rotation.z=Math.PI/2
    const glass=add(instruments[i]+' gauge face',dialGeometry,dial,[2.002,y,z]);glass.rotation.y=-Math.PI/2
    for(let n=0;n<12;n++){
      const angle=n*Math.PI/6
      const tick=add('Instrument scale tick',tickGeometry,marking,[1.999,y+Math.cos(angle)*.049,z+Math.sin(angle)*.049])
      tick.rotation.x=angle
    }
    const angle=[-.65,.14,1.10,-.12,-1.4,.4][i]
    rod(instruments[i]+' parked needle',[1.994,y,z],[1.994,y+Math.cos(angle)*.041,z+Math.sin(angle)*.041],.0025,marking)
  }
  block('Avionics radio stack',[.035,.31,.17],trim,[2.005,1.16,.38],.012)
  for(const y of [1.25,1.16,1.07]){
    block('Powered-off radio LCD',[.005,.042,.13],darkScreen,[1.984,y,.38])
    for(const z of [.33,.43])rod('Avionics tuning knob',[1.98,y-.031,z],[1.96,y-.031,z],.012,toggle)
  }
  block('Centre console',[.63,.26,.13],trim,[1.68,.78,0],.018)
  for(let i=0;i<6;i++)rod('Console toggle switch',[1.47+i*.07,.917,0],[1.47+i*.07,.944,.007],.006,toggle)
  for(const z of [-.60,.60]){
    rod('Interior door pull',[1.39,1.08,z],[1.60,1.08,z],.014,metal)
    rod('Door pull mounting',[1.39,1.08,z],[1.39,1.04,z],.013,metal)
    rod('Interior latch handle',[1.76,1.18,z],[1.87,1.18,z],.010,metal)
  }
  return {root,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}}
}
