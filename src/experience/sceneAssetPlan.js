import {portrait} from '../data/portrait.js'
import {workRoomProjects} from '../rooms/workRoomProjects.js'
import {FOREST_MODEL_URL} from '../rooms/forestAsset.js'

// Groups match useLoader cache keys used by the material/screen components.
export function sceneAssetPlan(quality='hi'){
 const suffix=quality==='lo'?'_lo':'',maps=['albedo','orm','normal']
 const textures=sets=>sets.flatMap(set=>maps.map(map=>`/assets/corridor/textures/${set}_${map}${suffix}.webp`))
 return {
  rooms:'/assets/rooms/rooms.glb',forest:FOREST_MODEL_URL,
  city:'/assets/city/apartments/apartments-near.gltf?v=solid-3',
  helicopter:'/assets/helicopter/bell206-jetranger.glb',airport:'/assets/city/airport/cessna172-runtime.glb',
  corridor:textures(['stone_floor','walnut_fluted','travertine','plaster','bronze','oak','felt']),
  roomMaps:textures(['microcement','upholstery','wool_rug']),
  sky:['/assets/sky/milky-way-thilina-6000.jpg','/assets/sky/moon-surface.webp'],
  coast:['/assets/environment/beach-diffuse.jpg','/assets/environment/beach-normal.jpg'],
  beach:'/assets/environment/beach-diffuse.jpg',
  facade:['/assets/environment/facade-diffuse.jpg','/assets/environment/facade-normal.jpg'],
  lightmaps:['about','services','process','contact'].map(kind=>`/assets/rooms/lightmaps/lm_${kind}${suffix}.webp`),
  screens:workRoomProjects.map(project=>project.screenUrl),
  portrait:portrait.src,laptop:'/assets/rooms/laptop-contact.webp',logo:'/assets/ukd-logo.svg',
 }
}
