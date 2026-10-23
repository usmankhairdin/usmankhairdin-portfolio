import { projects, projectAsset } from '../data/projects.js'

// Three existing bays, two exhibits per bay. Keep the room architecture fixed.
const exhibitOrder = ['forme', 'meridian', 'nexora', 'carthevia', 'forma', 'avenlo']
const roomCaptures = new Set(['forma', 'veyravael'])
export const workRoomProjects = exhibitOrder.map(slug => {
  const project = projects.find(item => item.slug === slug)
  if (!project) throw new Error('Missing Work Room project: ' + slug)
  return {
    ...project,
    screenUrl: roomCaptures.has(slug) ? '/assets/rooms/work/' + slug + '.webp' : projectAsset(slug, 'showcase-1x.webp'),
    projectLink: project.liveUrl,
    // Same-origin copies work both in the local corridor and after deployment.
    embedUrl: '/portfolio/' + slug + '/',
  }
})
