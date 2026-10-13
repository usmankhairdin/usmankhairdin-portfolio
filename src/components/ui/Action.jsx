import { Children, cloneElement, isValidElement } from 'react'
import { Link } from 'react-router-dom'

function classes(...values) {
  return values.filter(Boolean).join(' ')
}

const arrowMotion = {
  '→': ['3px', '0px'], '↗': ['3px', '-3px'], '↓': ['0px', '3px'],
  '←': ['-3px', '0px'], '↑': ['0px', '-3px'], '↘': ['3px', '3px'],
  '↙': ['-3px', '3px'], '↖': ['-3px', '-3px'],
}

function directionalArrows(children) {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || typeof child.props.children !== 'string') return child
    const motion = arrowMotion[child.props.children.trim()]
    if (!motion) return child
    return cloneElement(child, {
      'data-action-arrow': true,
      style: { ...child.props.style, '--action-arrow-x': motion[0], '--action-arrow-y': motion[1] },
    })
  })
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
  const content = directionalArrows(children)

  if (to) {
    return <Link className={actionClassName} to={to} {...props}>{content}</Link>
  }

  return <a className={actionClassName} href={href} {...props}>{content}</a>
}

export function TextCTA({ to, href, className, children, ...props }) {
  const actionClassName = classes('text-cta', className)

  if (to) {
    return <Link className={actionClassName} to={to} {...props}>{children}</Link>
  }

  return <a className={actionClassName} href={href} {...props}>{children}</a>
}
