import { Link } from 'react-router-dom'

function FooterIcon({name}){
  const common={viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.6',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true',focusable:'false'}
  if(name==='mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m5 8 7 5 7-5"/></svg>
  if(name==='experience') return <svg {...common}><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"/><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 11.5c3.2 1.4 6.2 2.1 9 2.1s5.8-.7 9-2.1"/><path d="M10 12h4"/></svg>
  if(name==='location') return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M14.6 9.3a3.8 3.8 0 1 0 0 5.4"/></svg>
}

export default function Footer(){
  return <footer className="footer">
    <div className="footer-cta">
      <span className="kicker">WHITE-LABEL UI DESIGN + FRONTEND PRODUCTION</span>
      <h2>Have a brief in <em>mind?</em></h2>
      <Link className="pill pill--primary" to="/contact/">Start a paid pilot <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="footer-meta" aria-label="Contact and profile details">
      <div className="footer-meta__item"><FooterIcon name="mail"/><a href="mailto:brief@usmankhairdin.com">brief@usmankhairdin.com</a></div>
      <div className="footer-meta__item"><FooterIcon name="experience"/><span>16+ years · Product design · responsive frontend</span></div>
      <div className="footer-meta__item"><FooterIcon name="location"/><span>Lahore, Pakistan · Working globally</span></div>
      <div className="footer-meta__item"><FooterIcon name="copyright"/><span>© 2026 Usman Khair Din</span></div>
    </div>
  </footer>
}
