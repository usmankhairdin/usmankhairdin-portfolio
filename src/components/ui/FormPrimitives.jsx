function classes(...values) {
  return values.filter(Boolean).join(' ')
}

export function FormField({ label, className, children }) {
  return <label className={className}>
    <span>{label}</span>
    {children}
  </label>
}

export function FormStatus({ status, children }) {
  if (!children) return null

  return <p
    className={classes('form-status', `form-status--${status}`)}
    role="status"
    aria-live="polite"
  >
    {children}
  </p>
}
