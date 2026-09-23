import { Link } from 'react-router-dom'

function classes(...values) {
  return values.filter(Boolean).join(' ')
}

export function ActionLink({
  to,
  href,
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}) {
  const actionClassName = classes(
    'pill',
    `pill--${variant}`,
    size === 'cta' && 'pill--cta',
    className,
  )

  if (to) {
    return <Link className={actionClassName} to={to} {...props}>{children}</Link>
  }

  return <a className={actionClassName} href={href} {...props}>{children}</a>
}

export function TextCTA({ to, href, className, children, ...props }) {
  const actionClassName = classes('text-cta', className)

  if (to) {
    return <Link className={actionClassName} to={to} {...props}>{children}</Link>
  }

  return <a className={actionClassName} href={href} {...props}>{children}</a>
}
