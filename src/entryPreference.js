const COMPACT_QUERY = '(max-width: 760px)'
const TOUCH_QUERY = '(pointer: coarse)'

export const shouldUseWebExperience = ({width, coarsePointer}) => width <= 760 || coarsePointer
export const entryPreloadKey = (route, webOnly) => route === 'home' && webOnly ? 'homeWeb' : route
export const prefersWebExperience = () => typeof window !== 'undefined' && shouldUseWebExperience({
  width: window.innerWidth,
  coarsePointer: window.matchMedia(TOUCH_QUERY).matches,
})
export function subscribeEntryPreference(listener) {
  const queries = [COMPACT_QUERY, TOUCH_QUERY].map(query => window.matchMedia(query))
  queries.forEach(query => query.addEventListener('change', listener))
  return () => queries.forEach(query => query.removeEventListener('change', listener))
}
