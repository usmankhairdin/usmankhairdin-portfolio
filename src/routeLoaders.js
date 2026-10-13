export const routeLoaders = {
  home: () => import('./experience/HomeExperience.jsx'),
  homeWeb: () => import('./pages/HomeWeb.jsx'),
  work: () => import('./pages/Work.jsx'),
  project: () => import('./pages/Project.jsx'),
  about: () => import('./pages/About.jsx'),
  services: () => import('./pages/Services.jsx'),
  agencies: () => import('./pages/Agencies.jsx'),
  contact: () => import('./pages/Contact.jsx'),
  designSystem: () => import('./pages/DesignSystem.jsx'),
  personalPortfolioWeb: () => import('./pages/PersonalPortfolioWeb.jsx'),
  personalPortfolio3d: () => import('./pages/PersonalPortfolio3D.jsx'),
}

// Browser module caching makes repeat calls free; hover/focus turns navigation
// into an early, non-blocking fetch without changing route behavior.
export function preloadRoute(route) {
  const load = routeLoaders[route]
  // Preloading is best-effort. Navigation owns the visible retry/error path,
  // so a transient speculative fetch must not become an unhandled rejection.
  if (load) void load().catch(() => {})
}

// The Web Experience's own homepage. '/' is the Corridor (the immersive entrance), so the
// website's home lives here; the Corridor's terrace sign and the Web header both lead to it.
export const WEB_HOME = '/web/'
