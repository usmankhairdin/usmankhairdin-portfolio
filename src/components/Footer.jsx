import { Link } from 'react-router-dom'

export default function Footer(){
  return <footer className="footer">
    <div>
      <span className="kicker">WHITE-LABEL UI DESIGN + FRONTEND PRODUCTION</span>
      <h2>Have a brief in <em>mind?</em></h2>
      <Link className="pill pill--lime" to="/contact/">Start a paid pilot ↗</Link>
    </div>
    <div className="footer-meta">
      <a href="mailto:usman.khairdin@gmail.com">usman.khairdin@gmail.com</a>
      <span>16+ years · UI / UX · responsive frontend</span>
      <span>Lahore, Pakistan · Working globally</span>
      <span>© 2026 Usman Khair Din</span>
    </div>
  </footer>
}
