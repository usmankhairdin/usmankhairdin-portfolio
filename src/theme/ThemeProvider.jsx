import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/*
 * ONE central theme state for the standalone Web Experience.
 *
 * - The active theme lives on <html data-theme="light|dark">. index.html sets it before first paint (saved choice,
 *   otherwise the system preference), so there is no light/dark flash on load.
 * - The saved choice persists in localStorage and is shared across routes and tabs.
 * - The provider sits above every route, so entering the corridor and coming back never touches it: the corridor
 *   has no theme control, and the remembered Web theme is simply still there when the Web Experience returns.
 * - Only Web surfaces read the theme (see src/theme/theme.css). The 3D corridor does not: nothing is set on <html>
 *   that could reach it (no root color-scheme), the tokens are consumed only under Web wrappers.
 */
export const THEME_KEY = 'ukd-theme'
const THEME_COLORS = { light: '#f0f5fc', dark: '#0b111b' }

const ThemeContext = createContext(null)

const readSaved = () => {
  try {
    const value = window.localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch { return null }
}

function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const current = document.documentElement.getAttribute('data-theme')
    return current === 'dark' || current === 'light' ? current : (readSaved() ?? 'light')
  })

  useEffect(() => { applyTheme(theme) }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try { window.localStorage.setItem(THEME_KEY, next) } catch { /* private mode: the choice still applies for this visit */ }
  }, [])
  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  // The first visit is always light. Once a visitor explicitly chooses a theme, keep that choice
  // across routes/tabs until they change it again. System colour preference never overrides the Web default.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === THEME_KEY && (event.newValue === 'light' || event.newValue === 'dark')) setThemeState(event.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
