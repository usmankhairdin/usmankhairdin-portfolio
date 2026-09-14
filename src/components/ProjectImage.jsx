import { useEffect, useMemo, useState } from 'react'

export default function ProjectImage({ project, variant = 'desktop', className = '', alt, eager = false }) {
  const sources = useMemo(() => {
    const list = project.screenshots?.[variant]
    if (Array.isArray(list) && list.length) return list
    return [project.poster]
  }, [project, variant])

  const [sourceIndex, setSourceIndex] = useState(0)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
    setRefresh(0)
  }, [project.slug, variant])

  useEffect(() => {
    if (sourceIndex !== 0 || !sources[0]?.includes('s.wordpress.com/mshots/')) return
    const first = window.setTimeout(() => setRefresh(1), 3200)
    const second = window.setTimeout(() => setRefresh(2), 8200)
    return () => { window.clearTimeout(first); window.clearTimeout(second) }
  }, [project.slug, variant, sourceIndex, sources])

  const baseSource = sources[Math.min(sourceIndex, sources.length - 1)]
  const source = sourceIndex === 0 && refresh > 0 && baseSource.includes('s.wordpress.com/mshots/')
    ? `${baseSource}&_refresh=${refresh}`
    : baseSource

  const fallback = () => {
    setRefresh(0)
    setSourceIndex(index => Math.min(index + 1, sources.length - 1))
  }

  return <img
    key={`${project.slug}-${variant}-${sourceIndex}-${refresh}`}
    className={className}
    src={source}
    alt={alt || `${project.title} project preview`}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
    referrerPolicy="no-referrer"
    onError={fallback}
  />
}
