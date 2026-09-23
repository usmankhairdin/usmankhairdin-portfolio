import { ActionLink } from './ui/Action.jsx'
import MetaActionRow from './ui/MetaActionRow.jsx'

const CONTACT_EMAIL = 'brief@usmankhairdin.com'
const PHONE_DISPLAY = '+92-321-7247317'
const PHONE_E164 = '+923217247317'
const WHATSAPP_URL = 'https://wa.me/923217247317'
const LINKEDIN_URL = 'https://pk.linkedin.com/in/usmankhairdin1'
const UPWORK_URL = 'https://www.upwork.com/freelancers/~0172c60344ca2309b3'

export function FooterIcon({ name }) {
  const lineIcon = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.7', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' }
  const brandIcon = { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' }
  let icon

  if (name === 'mail') icon = <svg {...lineIcon}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m5 8 7 5 7-5"/></svg>
  else if (name === 'call') icon = <svg {...lineIcon}><path d="M8.1 3.5 5.6 4.7c-1.1.5-1.6 1.8-1.1 2.9 2.3 5.4 6.5 9.6 11.9 11.9 1.1.5 2.4 0 2.9-1.1l1.2-2.5-4.4-2-1.1 1.7c-2.8-1.4-5.2-3.8-6.6-6.6l1.7-1.1-2-4.4Z"/></svg>
  else if (name === 'whatsapp') icon = <svg {...brandIcon}><path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.92L2 22l5.22-1.54A9.94 9.94 0 1 0 12.04 2Zm0 17.95a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.1.92.94-3.02-.2-.31a8.08 8.08 0 1 1 6.79 3.72Zm4.43-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21a7.35 7.35 0 0 1-1.36-1.69c-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.31-.75-1.8-.19-.47-.4-.41-.55-.42h-.46c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg>
  else if (name === 'linkedin') icon = <svg {...brandIcon}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>
  else if (name === 'upwork') icon = <svg {...brandIcon}><path d="M17.47 7.16c-2.14 0-3.79 1.38-4.44 3.25-1-1.5-1.75-3.29-2.18-4.81H7.54v7.06a2.11 2.11 0 0 1-4.22 0V5.6H0v7.06a5.43 5.43 0 0 0 10.86 0v-1.18c.43.82.93 1.6 1.5 2.32L10.34 22h3.4l1.38-5.65c.72.35 1.51.53 2.35.53A4.87 4.87 0 1 0 17.47 7.16Zm0 6.52c-.58 0-1.14-.18-1.65-.49l.27-1.09c.3-1.21.93-1.74 1.38-1.74a1.66 1.66 0 0 1 0 3.32Z"/></svg>
  else if (name === 'experience') icon = <svg {...lineIcon}><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"/><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 11.5c3.2 1.4 6.2 2.1 9 2.1s5.8-.7 9-2.1"/><path d="M10 12h4"/></svg>
  else if (name === 'location') icon = <svg {...lineIcon}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
  else icon = <svg {...lineIcon}><circle cx="12" cy="12" r="9"/><path d="M14.6 9.3a3.8 3.8 0 1 0 0 5.4"/></svg>

  return <span className={`footer-meta__icon footer-meta__icon--${name}`}>{icon}</span>
}

const contactActions = [
  { name: 'mail', label: 'Email', text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { name: 'call', label: 'Call', text: `Call · ${PHONE_DISPLAY}`, href: `tel:${PHONE_E164}` },
  { name: 'whatsapp', label: 'WhatsApp', text: 'WhatsApp · Message', href: WHATSAPP_URL, external: true },
  { name: 'linkedin', label: 'LinkedIn', text: 'LinkedIn · Profile', href: LINKEDIN_URL, external: true },
  ...(UPWORK_URL ? [{ name: 'upwork', label: 'Upwork', text: 'Upwork · Profile', href: UPWORK_URL, external: true }] : []),
]

export default function Footer() {
  return <footer className="footer">
    <div className="footer-cta">
      <span className="kicker">PRODUCT DESIGN + FRONTEND PRODUCTION</span>
      <h2>Have a brief in <em>mind?</em></h2>
      <ActionLink to="/contact/">Start a paid pilot <span aria-hidden="true">↗</span></ActionLink>
    </div>
    <div className="footer-info">
      <div className="footer-meta footer-meta--contact" role="group" aria-label="Contact and profile links">
        <div className="footer-meta__actions">
          {contactActions.map(({ name, label, text, href, external }) => <MetaActionRow
            icon={<FooterIcon name={name}/>}
            href={href}
            external={external}
            ariaLabel={`${label}: ${text.replace(/^.*? · /, '')}`}
            key={name}
          >{text}</MetaActionRow>)}
        </div>
      </div>
      <div className="footer-meta footer-meta--information" role="group" aria-label="Experience and location details">
        <div className="footer-meta__details">
          <MetaActionRow icon={<FooterIcon name="experience"/>}>16+ years · Design + frontend</MetaActionRow>
          <MetaActionRow icon={<FooterIcon name="location"/>}>Lahore, Pakistan · Working globally</MetaActionRow>
          <MetaActionRow icon={<FooterIcon name="copyright"/>}>© 2026 Usman Khair Din</MetaActionRow>
        </div>
      </div>
    </div>
  </footer>
}
