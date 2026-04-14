/**
 * The **`window.requestIdleCallback()`** method queues a function to be called during a browser's idle periods.
 *
 * As it's not implemented in Safari, we provide a fallback to setTimeout.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)
 */
export function requestIdleCallback(fn: IdleRequestCallback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(fn)
    return
  }
  setTimeout(fn, 0)
  return
}
