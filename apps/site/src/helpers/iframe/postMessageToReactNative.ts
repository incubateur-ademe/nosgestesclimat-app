/**
 * Send a message to a React Native WebView via the standard bridge API.
 *
 * React Native WebView injects `window.ReactNativeWebView.postMessage` into
 * the web page. It expects a **string**, so we JSON-stringify the payload.
 *
 * Guards:
 * - SSR safety: checks `typeof window !== 'undefined'`
 * - API existence: checks `ReactNativeWebView?.postMessage` is a function
 *
 * @see https://stackoverflow.com/questions/68334181
 */
export function postMessageToReactNative(message: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  const rnWebView = (window as any).ReactNativeWebView as
    | { postMessage: (msg: string) => void }
    | undefined

  if (rnWebView?.postMessage) {
    rnWebView.postMessage(JSON.stringify(message))
  }
}
