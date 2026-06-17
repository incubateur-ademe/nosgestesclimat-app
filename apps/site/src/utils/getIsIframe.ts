export function getIsIframe(localIsIframeState: boolean): boolean {
  if (typeof window === 'undefined') return false

  try {
    if (window.self !== window.top) return true
  } catch {
    return true
  }

  // Fallback for environments where window.top === window.self
  // but the page is embedded (e.g. native WebViews)
  return localIsIframeState
}
