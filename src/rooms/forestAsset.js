import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export const FOREST_MODEL_URL='/assets/forest/island-trees.gltf?v=lossless-6'
export const configureForestLoader=loader=>loader.setMeshoptDecoder(MeshoptDecoder)
