import './SectionIntro.css'

function classes(...values) {
  return values.filter(Boolean).join(' ')
}

export default function SectionIntro({
  eyebrow,
  title,
  intro,
  introClassName,
  className,
  children,
}) {
  return <div className={classes(className, 'route-section-intro')}>
    {eyebrow && <span className="kicker">{eyebrow}</span>}
    <div className="route-section-intro__copy">
      <h2>{title}</h2>
      <p className={introClassName}>{intro}</p>
    </div>
    {children}
  </div>
}
