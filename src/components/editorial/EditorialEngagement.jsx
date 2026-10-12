import { Link } from 'react-router-dom'
import './EditorialEngagement.css'

export function EditorialLink({ to, children, className = '' }) {
  return <Link to={to} className={`editorial-link ${className}`}>
    <span>{children}</span><span aria-hidden="true">↗</span>
  </Link>
}

// Shared by the approved editorial Web pages, not the immersive rooms.
export default function EditorialEngagement() {
  return <section className="editorial-engagement" aria-label="Ways to work together">
    <div className="editorial-engagement__layout" data-editorial-reveal>
      <div className="editorial-engagement__item">
        <span className="editorial-engagement__icon editorial-engagement__icon--project" aria-hidden="true" />
        <div><h2>Have a project in mind?</h2><EditorialLink to="/contact/">Discuss a project</EditorialLink></div>
      </div>
      <div className="editorial-engagement__item">
        <span className="editorial-engagement__icon editorial-engagement__icon--partner" aria-hidden="true" />
        <div><h2>Need a production partner?</h2><EditorialLink to="/for-agencies/">For agencies</EditorialLink></div>
      </div>
    </div>
  </section>
}
