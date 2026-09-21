import { useEffect, useMemo, useState } from 'react'

export default function ProjectImage({ project, variant = 'preview', className = '', alt = '', eager = false }) {
  const sources = useMemo(() => {
    const list = project.media?.[variant]
    if (Array.isArray(list) && list.length) return list
    return [project.poster]
  }, [project, variant])

  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [project.slug, variant])

  const source = sources[Math.min(sourceIndex, sources.length - 1)]
  const fallback = () => setSourceIndex(index => Math.min(index + 1, sources.length - 1))

  return <img
    key={`${project.slug}-${variant}-${sourceIndex}`}
    className={className}
    src={source}
    alt={alt || project.mediaAlt?.[variant] || `${project.title} project preview`}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
    referrerPolicy="no-referrer"
    onError={fallback}
  />
}
