import {useLoader} from '@react-three/fiber'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {configureForestLoader} from '../rooms/forestAsset.js'
import {corridorTextureQuality} from './corridorMaterials.js'
import {sceneAssetPlan} from './sceneAssetPlan.js'

const assets=sceneAssetPlan(corridorTextureQuality())
// Dispatch every group immediately. The gate below consumes these exact cache
// entries before expensive procedural geometry/material construction can retry.
const requests=[
 ...['rooms','forest','city','helicopter','airport'].map(key=>({loader:GLTFLoader,input:assets[key],configure:key==='forest'?configureForestLoader:undefined})),
 ...['corridor','roomMaps','sky','coast','beach','facade','portrait','laptop'].map(key=>({loader:THREE.TextureLoader,input:assets[key]})),
 ...[...assets.lightmaps,...assets.screens].map(input=>({loader:THREE.TextureLoader,input})),
 {loader:THREE.FileLoader,input:assets.logo},
]
for(const request of requests)useLoader.preload(request.loader,request.input,request.configure)

export default function SceneAssetGate({children,at=0}){
 const request=requests[at]
 useLoader(request.loader,request.input,request.configure)
 // A small boundary per cache key keeps hook order stable for any number of
 // project screens, and the expensive world is rendered only at the last one.
 return at===requests.length-1?children:<SceneAssetGate at={at+1}>{children}</SceneAssetGate>
}
