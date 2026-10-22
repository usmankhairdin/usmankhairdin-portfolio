import { projects, projectAsset } from '../data/projects.js'

const exhibit=slug=>{
  const project=projects.find(p=>p.slug===slug)
  return {...project,screenUrl:projectAsset(slug,'showcase-1x.webp'),projectLink:project.liveUrl}
}

// One shared editorial sequence. Adjacent entries face each other in the room.
// Rantle sends X-Frame-Options:SAMEORIGIN and retains its capture + real link.
const roomCaptures=new Set(['sanaira','forma','veyravael'])
export const workRoomProjects=projects.filter(project=>project.workRoom!==false).map(project=>({
  ...exhibit(project.slug),
  ...(roomCaptures.has(project.slug)?{screenUrl:`/assets/rooms/work/${project.slug}.webp`}:{}),
  ...(project.slug==='rantle'?{}:{embedUrl:project.liveUrl}),
}))
