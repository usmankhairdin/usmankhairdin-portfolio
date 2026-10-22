// Extract static dependency attributes from demo HTML/CSS and embedded HTML strings.
export function* literalDemoDependencies(text, {javascript = false} = {}) {
  for (const match of text.matchAll(/(?:\b(?:src|href|poster)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^'"\)]+))/g)) {
    const url = (match[1] || match[2]).trim()
    if (url.includes('${') || (javascript && /`\s*\+|\+\s*`/.test(url))) continue
    yield url
  }
}