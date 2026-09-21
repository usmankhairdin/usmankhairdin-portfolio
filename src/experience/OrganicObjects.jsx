import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export function BotanicalLeaf({ position=[0,0,0], rotation=[0,0,0], length=.42, width=.18, color='#708067' }) {
  const geometry=useMemo(()=>{
    const half=length*.5
    const shape=new THREE.Shape()
    shape.moveTo(0,-half)
    shape.bezierCurveTo(width*.68,-half*.46,width*.62,half*.40,0,half)
    shape.bezierCurveTo(-width*.62,half*.40,-width*.68,-half*.46,0,-half)
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.006,curveSegments:16})
    geo.translate(0,0,-.006)
    geo.computeVertexNormals()
    return geo
  },[length,width])

  useEffect(()=>()=>geometry.dispose(),[geometry])

  return <mesh geometry={geometry} position={position} rotation={rotation}>
    <meshPhysicalMaterial color={color} roughness={.72} metalness={.015} clearcoat={.10} clearcoatRoughness={.62} side={THREE.DoubleSide}/>
  </mesh>
}
