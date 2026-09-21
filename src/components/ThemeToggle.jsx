import { useTheme } from '../theme/ThemeProvider.jsx'

/**
 * Circular Web theme control. Shows the theme it will switch TO (moon in light, sun in dark) and cross-fades the two
 * glyphs with a small rotation — no spinning. Rendered only by the Web header; the immersive HUD never mounts it.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return <button
    type="button"
    className="hdr-btn hdr-theme"
    data-theme-current={theme}
    aria-label={`Switch to ${next} theme`}
    title={`Switch to ${next} theme`}
    onClick={toggleTheme}
  >
    <svg className="hdr-theme__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.35 5.35l1.65 1.65M17 17l1.65 1.65M18.65 5.35 17 7M7 17l-1.65 1.65" />
    </svg>
    <svg className="hdr-theme__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" />
    </svg>
  </button>
}
