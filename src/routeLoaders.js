export const routeLoaders = {
  home: () => import('./experience/HomeExperience.jsx'),
  work: () => import('./pages/Work.jsx'),
  project: () => import('./pages/Project.jsx'),
  about: () => import('./pages/About.jsx'),
  services: () => import('./pages/Services.jsx'),
  agencies: () => import('./pages/Agencies.jsx'),
  contact: () => import('./pages/Contact.jsx'),
}

// Browser module caching makes repeat calls free; hover/focus turns navigation
// into an early, non-blocking fetch without changing route behavior.
export function preloadRoute(route) {
  const load = routeLoaders[route]
  // Preloading is best-effort. Navigation owns the visible retry/error path,
  // so a transient speculative fetch must not become an unhandled rejection.
  if (load) void load().catch(() => {})
}
