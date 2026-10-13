// Evaluate this function in the real page after the route has rendered.
// A heading separated into a neighbouring copy column must fail, at any width.
() => {
  const results = [...document.querySelectorAll('.route-section-intro,.route-heading-copy,.services-editorial__intro,.contact-editorial__copy,.home-work__intro,.home-capabilities .home-section__head,.about-editorial__practice-copy,.about-editorial__work-copy,.services-editorial__proof-copy,.services-editorial__toolkit,.agencies-editorial__fit-copy,.cs-head')].map((intro) => {
    const heading = intro.querySelector('h1,h2')
    const paragraph = intro.querySelector('p')
    if (!heading || !paragraph) return { title: heading?.textContent, passed: true }
    const h = heading.getBoundingClientRect(), p = paragraph.getBoundingClientRect()
    return { title: heading.textContent, passed: p.top >= h.bottom - 1, gap: p.top - h.bottom }
  })
  const failures = results.filter((result) => !result.passed)
  if (failures.length) throw new Error('Detached section intros: ' + failures.map((f) => f.title).join('; '))
  if (!results.length) throw new Error('No rendered intro groups found; wait for the route to load first.')
  return { checked: results.length, failures: 0, results }
}
