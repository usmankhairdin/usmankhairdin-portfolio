import { projectAsset } from '../data/projects.js'

// Local screenshot sources shared by the vertical Work presentations.
export const showcaseImage = (project) => {
  const asset = (file) => projectAsset(project.slug, file)
  const [small, large] = project.media?.showcaseWidths || [1440, 2880]
  return {
    src: asset('showcase-1x.webp'),
    srcSet: small === large ? `${asset('showcase.webp')} ${large}w` : `${asset('showcase-1x.webp')} ${small}w, ${asset('showcase.webp')} ${large}w`,
    fallback: project.media?.preview?.[0] || project.poster,
  }
}
