import logger from '@/logger/logger.browser'
import { toError } from '@nosgestesclimat/core/lib/to-error'

/** Sends a message to the integrator (parent window and/or React Native
 * WebView). SSR-safe, guards API existence, catches failures. */
export function postMessageToIntegrator(message: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.parent.postMessage(message, '*')
  } catch (error) {
    logger.error(toError(error), {
      scope: 'site.interaction.postMessageToIntegrator',
    })
  }

  try {
    const rnWebView = (
      window as { ReactNativeWebView?: { postMessage: (msg: string) => void } }
    ).ReactNativeWebView

    if (rnWebView?.postMessage) {
      rnWebView.postMessage(JSON.stringify(message))
    }
  } catch (error) {
    logger.error(toError(error), {
      scope: 'site.interaction.postMessageToIntegrator',
    })
  }
}
