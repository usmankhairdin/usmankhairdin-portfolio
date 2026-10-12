import './GroundedSculpture.css'

// Web editorial artwork must include its own physically attached floor shadow.
// Keep the object and shadow still; animate only the surface illumination.
export default function GroundedSculpture({ src, maskSrc = src, className = '', surfaceLightOnly = false }) {
  return <div className={`grounded-sculpture ${surfaceLightOnly ? 'grounded-sculpture--surface-light' : ''} ${className}`} data-editorial-loop aria-hidden="true" style={{ '--sculpture-image': `url("${maskSrc}")` }}>
    <img src={src} width="1400" height="933" alt="" fetchPriority="high" decoding="async" draggable="false" />
    <div className="grounded-sculpture__light" />
  </div>
}
