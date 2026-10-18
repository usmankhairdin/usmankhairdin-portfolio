import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CITY_Y } from './cityPlan.js'
import { nightSkyUniforms } from '../experience/nightSkyUniforms.js'
import { createIslandTreePlan, selectIslandTreeDetail, selectIslandTreeResidency, TREE_TRIANGLE_BUDGET } from './islandTreePlan.js'
import { ISLAND_TREE_SHAPE_GLSL } from './islandTreeShape.js'
import { FOREST_MODEL_URL, configureForestLoader } from './forestAsset.js'

const noRaycast=()=>null
function treeMaterial(source,variant){
  const material=source.clone(),leaves=source.name.includes('leaves')
  material.transparent=false;material.opacity=1;material.depthWrite=true
  material.alphaTest=leaves?.2:0;material.alphaToCoverage=leaves
  material.side=leaves?THREE.DoubleSide:THREE.FrontSide
  material.fog=false;material.roughness=.96;material.metalness=0
  material.onBeforeCompile=shader=>{
    const shape=`islandTreeLocalPoint(transformed,${variant.profile.toFixed(1)},length(instanceMatrix[1].xyz),${(variant.radialScale??1).toFixed(8)})`
    shader.vertexShader=ISLAND_TREE_SHAPE_GLSL+'\n'+shader.vertexShader
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\ntransformed=${shape};`)
    shader.uniforms.uMoonDirection=nightSkyUniforms.uMoonDirection
    shader.fragmentShader=`uniform vec3 uMoonDirection;\n${shader.fragmentShader}`
    shader.fragmentShader=shader.fragmentShader
      .replace('#include <lights_fragment_begin>',`
        vec3 geometryNormal=normal;
        vec3 geometryViewDir=normalize(vViewPosition);
        vec3 treeNormal=inverseTransformDirection(normal,viewMatrix);
        float moon=max(dot(treeNormal,normalize(uMoonDirection)),0.);
        float sky=.5+.5*treeNormal.y;
        vec3 irradiance=vec3(.10,.14,.15)+vec3(.13,.18,.20)*moon+vec3(.03,.05,.04)*sky;
        ${leaves?'irradiance+=vec3(.025,.045,.018)*max(dot(-treeNormal,normalize(uMoonDirection)),0.);':''}
        reflectedLight.directDiffuse=material.diffuseColor*irradiance;
        reflectedLight.directSpecular=vec3(0.);
      `)
      .replace('#include <lights_fragment_maps>','')
      .replace('#include <lights_fragment_end>','')
      .replace('#include <opaque_fragment>',`
        float treeHaze=min(1.-exp(-length(vViewPosition)*.00085),.88);
        outgoingLight=mix(outgoingLight,vec3(.007,.011,.017),treeHaze);
        #include <opaque_fragment>`)
  }
  material.customProgramCacheKey=()=>`native-ukd-tree-${leaves?'leaves':'wood'}-${variant.profile}-${variant.radialScale??1}-5`
  return material
}

function createTreeFleet(model,trees){
  const group=new THREE.Group(),materials=new Map(),buckets=new Map(),meshes=[]
  group.name='ukd-island-planting'
  const variants=model.parser.json.extras.variants,costs=variants.map(v=>v.triangles)
  const capacities=variants.map(v=>trees.filter(t=>t.crown===v.id).length)
  const materialFor=(source,variant)=>{const key=`${source.uuid}:${variant.id}`;if(!materials.has(key))materials.set(key,treeMaterial(source,variant));return materials.get(key)}
  for(const variant of variants)for(let lod=0;lod<variant.meshes.length;lod++){
    const capacity=Math.max(1,capacities[variant.id])
    const matrix=new THREE.InstancedBufferAttribute(new Float32Array(capacity*16),16)
    const color=new THREE.InstancedBufferAttribute(new Float32Array(capacity*3),3)
    matrix.setUsage(THREE.DynamicDrawUsage);color.setUsage(THREE.DynamicDrawUsage)
    const name=model.parser.json.nodes.find(n=>n.mesh===variant.meshes[lod]).name
    const source=model.scene.getObjectByName(name),parts=[]
    if(!source)throw new Error(`UKD tree source missing: ${name}`)
    source.traverse(piece=>{
      if(!piece.isMesh)return
      const mesh=new THREE.InstancedMesh(piece.geometry,materialFor(piece.material,variant),capacity)
      mesh.name=`island-trees-${variant.id}-${lod}-${piece.material.name}`
      mesh.instanceMatrix=matrix;mesh.instanceColor=color;mesh.count=0
      mesh.frustumCulled=false;mesh.raycast=noRaycast
      mesh.castShadow=false;mesh.receiveShadow=false
      meshes.push(mesh);parts.push(mesh);group.add(mesh)
    })
    buckets.set(`${variant.id}:${lod+1}`,{matrix,color,parts,count:0})
  }
  const matrices=new Float32Array(trees.length*16),colors=new Float32Array(trees.length*3)
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),position=new THREE.Vector3(),scale=new THREE.Vector3(),tint=new THREE.Color()
  const bounds=trees.map((t,i)=>{
    position.set(t.x,t.y,t.z);scale.set(t.h*t.width,t.h,t.h*t.width);rotation.setFromAxisAngle(up,t.yaw)
    matrix.compose(position,rotation,scale).toArray(matrices,i*16)
    tint.setRGB(.79+t.tint*.20,.86+t.tint*.14,.72+t.tint*.23).toArray(colors,i*3)
    return new THREE.Box3(new THREE.Vector3(t.x-t.radius-.5,t.y-.5,t.z-t.radius-.5),new THREE.Vector3(t.x+t.radius+.5,t.y+t.h+.5,t.z+t.radius+.5))
  })
  const projection=new THREE.Matrix4(),last=new THREE.Matrix4(),inverse=new THREE.Matrix4(),eye=new THREE.Vector3(),frustum=new THREE.Frustum()
  const visible=new Uint8Array(trees.length)
  const lastEye=new THREE.Vector3(Infinity,Infinity,Infinity),residentEye=lastEye.clone()
  let state=new Uint8Array(trees.length),resident=new Uint8Array(trees.length),initialized=false
  const update=(camera,rootMatrix)=>{
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(rootMatrix)
    if(initialized&&last.equals(projection))return
    eye.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(inverse.copy(rootMatrix).invert())
    let sameOrientation=initialized
    for(let i=0;i<12;i++)if(projection.elements[i]!==last.elements[i])sameOrientation=false
    // Rotation/projection changes always update immediately. Small translation
    // alone uses a .2m margin, covered by the conservative half-metre bounds.
    if(sameOrientation&&eye.distanceToSquared(lastEye)<.04)return
    last.copy(projection);lastEye.copy(eye);frustum.setFromProjectionMatrix(projection)
    if(!initialized||eye.distanceToSquared(residentEye)>=.04){
      resident=selectIslandTreeResidency(trees,eye,costs,resident)
      residentEye.copy(eye)
    }
    for(let i=0;i<trees.length;i++)visible[i]=frustum.intersectsBox(bounds[i])?1:0
    const next=selectIslandTreeDetail(trees,eye,visible,costs,state,TREE_TRIANGLE_BUDGET,resident)
    if(initialized&&next.every((value,i)=>value===state[i]))return
    state=next;initialized=true
    for(const bucket of buckets.values())bucket.count=0
    let triangles=0,activeTrees=0
    for(let i=0;i<trees.length;i++){
      if(!state[i])continue
      const bucket=buckets.get(`${trees[i].crown}:${state[i]}`),offset=bucket.count++
      bucket.matrix.array.set(matrices.subarray(i*16,i*16+16),offset*16)
      bucket.color.array.set(colors.subarray(i*3,i*3+3),offset*3)
      triangles+=costs[trees[i].crown][state[i]-1];activeTrees++
    }
    for(const bucket of buckets.values()){
      bucket.parts.forEach(mesh=>{mesh.count=bucket.count})
      for(const [attribute,width] of [[bucket.matrix,16],[bucket.color,3]]){
        attribute.clearUpdateRanges()
        if(bucket.count){attribute.addUpdateRange(0,bucket.count*width);attribute.needsUpdate=true}
      }
    }
    group.userData.planting={totalTrees:trees.length,activeTrees,triangles,budget:TREE_TRIANGLE_BUDGET}
  }
  return {group,update,dispose(){
    meshes.forEach(mesh=>mesh.dispose())
    materials.forEach(material=>material.dispose())
    group.clear()
  }}
}

export default function IslandTrees({layout,groundY=CITY_Y}){
  const model=useLoader(GLTFLoader,FOREST_MODEL_URL,configureForestLoader)
  const trees=useMemo(()=>createIslandTreePlan(layout),[layout])
  const root=useRef(),fleet=useRef()
  // Each effect setup creates its own fleet. StrictMode can dispose/replay it
  // without retaining cleared groups or mutating cached source geometry/maps.
  useEffect(()=>{
    const mounted=createTreeFleet(model,trees),parent=root.current
    parent.add(mounted.group);fleet.current=mounted
    return ()=>{if(fleet.current===mounted)fleet.current=null;parent.remove(mounted.group);mounted.dispose()}
  },[model,trees])
  useFrame(({camera})=>{
    if(!root.current?.parent?.visible||!fleet.current)return
    root.current.updateWorldMatrix(true,false);camera.updateWorldMatrix(true,false)
    fleet.current.update(camera,root.current.matrixWorld)
  })
  return <group ref={root} position={[0,groundY,0]} dispose={null}/>
}
