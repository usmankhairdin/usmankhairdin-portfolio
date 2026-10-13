import './GroundedSculpture.css'

// Web editorial artwork must include its own physically attached floor shadow.
// Keep the object and shadow still; animate only the surface illumination.
// A hero's artwork loads at once; one further down a page may pass loading="lazy".
export default function GroundedSculpture({ src, maskSrc = src, className = '', surfaceLightOnly = false, loading = 'eager', onLoad }) {
  return <div className={`grounded-sculpture ${surfaceLightOnly ? 'grounded-sculpture--surface-light' : ''} ${className}`} data-editorial-loop aria-hidden="true" style={{ '--sculpture-image': `url("${maskSrc}")` }}>
    <img src={src} width="1400" height="933" alt="" loading={loading} fetchPriority={loading === 'lazy' ? 'auto' : 'high'} decoding="async" draggable="false" onLoad={onLoad} />
    <div className="grounded-sculpture__light" />
  </div>
}
