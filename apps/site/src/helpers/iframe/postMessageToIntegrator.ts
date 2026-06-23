import { captureException } from '@sentry/nextjs'

/**
 * Send a message to the integrator (parent window and/or React Native WebView).
 *
 * - Sends to `window.parent.postMessage(message, '*')`
 * - Also sends to `window.ReactNativeWebView.postMessage(JSON.stringify(message))`
 *   if available (React Native WebView bridge).
 *
 * Guards:
 * - SSR safety: checks `typeof window !== 'undefined'`
 * - API existence: checks `ReactNativeWebView?.postMessage` is a function
 * - try/catch to avoid crashes
 *
 * @see https://stackoverflow.com/questions/68334181
 */
export function postMessageToIntegrator(message: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.parent.postMessage(message, '*')
  } catch (error) {
    captureException(error)
  }

  try {
    const rnWebView = (
      window as { ReactNativeWebView?: { postMessage: (msg: string) => void } }
    ).ReactNativeWebView

    if (rnWebView?.postMessage) {
      rnWebView.postMessage(JSON.stringify(message))
    }
  } catch (error) {
    captureException(error)
  }
}
