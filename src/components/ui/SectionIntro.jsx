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
    <span className="kicker">{eyebrow}</span>
    <h2>{title}</h2>
    <p className={introClassName}>{intro}</p>
    {children}
  </div>
}
