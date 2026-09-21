export const routeLoaders = {
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
  if (load) void load()
}
