import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import destinationFont from './destination-font.json'
import { PALETTE as C, Profile, Plate } from './GalleryFabrication.jsx'

// Solid cut ribbons have width and thickness; they are not cylindrical tubes.
export function Inlay({ points, width=.055, depth=.018, color=C.brass, position=[0,0,0] }) {
  const key=JSON.stringify(points)
  const outline=useMemo(()=>{
    const curve=new THREE.CatmullRomCurve3(JSON.parse(key).map(([x,y])=>new THREE.Vector3(x,y,0)),false,'centripetal')
    const edges=[[],[]]
    for(let i=0;i<=48;i++) {
      const p=curve.getPoint(i/48),v=curve.getTangent(i/48)
      edges[0].push([p.x-v.y*width/2,p.y+v.x*width/2])
      edges[1].push([p.x+v.y*width/2,p.y-v.x*width/2])
    }
    return [...edges[0],...edges[1].reverse()]
  },[key,width])
  return <Profile outline={outline} depth={depth} bevel={.002} smoothEdges color={color} metalness={color===C.brass?.58:.08} position={position}/>
}

export function Loom() {
  return <>
    <Profile outline={[[-1.26,-.67],[.86,-.67],[1.26,-.27],[1.26,.67],[-.83,.67],[-1.26,.30]]}
      holes={[[[-.90,-.43],[-.29,-.43],[-.29,.39],[-.90,.39]],[[.02,-.43],[.90,-.43],[.90,-.16],[.02,-.16]],[[.02,.06],[.90,.06],[.90,.39],[.02,.39]]]}
      depth={.08} color={C.ivory}/>
    <Inlay points={[[-1.12,.53],[-.65,.53],[.05,.53],[1.06,.53]]} width={.035} position={[0,0,.092]}/>
    <Inlay points={[[-.76,-.36],[-.58,-.02],[-.32,.07],[.12,.22],[.58,.22],[1.03,.22]]} width={.075} color={C.blue} depth={.04} position={[0,0,.095]}/>
    <Plate w={.14} h={.86} depth={.16} color={C.wood} position={[-.16,-.07,-.025]}/>
  </>
}

export function Dovetail({rightColor=C.blue}) {
  return <>
    <Profile outline={[[-1.1,-.62],[-.10,-.62],[-.10,-.23],[.19,-.32],[.19,.32],[-.10,.23],[-.10,.62],[-1.1,.62]]} depth={.11} color={C.wood}/>
    <Profile outline={[[1.1,-.62],[-.065,-.62],[-.065,-.275],[.23,-.365],[.23,.365],[-.065,.275],[-.065,.62],[1.1,.62]]} depth={.11} color={rightColor}/>
    <Inlay points={[[-.96,-.37],[-.54,-.37],[-.35,-.15],[-.22,0],[.48,0],[.97,0]]} width={.024} position={[0,0,.12]}/>
  </>
}

const font=new FontLoader().parse(destinationFont)
export function CastName() {
  const geometry=useMemo(()=>{
    const text=new TextGeometry('Usman Khair Din',{font,size:.49,depth:.038,curveSegments:6,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:1})
    text.computeBoundingBox()
    const box=text.boundingBox
    text.translate(-(box.min.x+box.max.x)/2,-(box.min.y+box.max.y)/2,0)
    return text
  },[])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  return <mesh name="cast-name-Usman-Khair-Din" geometry={geometry}><meshStandardMaterial color={C.ink} roughness={.38} metalness={.3}/></mesh>
}
