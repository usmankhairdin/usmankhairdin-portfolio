function classes(...values) {
  return values.filter(Boolean).join(' ')
}

export default function MetaActionRow({
  icon,
  children,
  href,
  external = false,
  ariaLabel,
  className,
}) {
  const rowClassName = classes(
    'footer-meta__item',
    href && 'footer-meta__item--action',
    className,
  )
  const content = <>{icon}<span>{children}</span></>

  if (href) {
    return <a
      className={rowClassName}
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  }

  return <div className={rowClassName}>{content}</div>
}
