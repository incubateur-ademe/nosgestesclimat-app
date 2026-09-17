import isMobile from 'is-mobile'
import { useIsClient } from './useIsClient'

/**
 * Whether the current layout is a mobile one.
 *
 * `is-mobile` reads the user agent, which does not exist while the server
 * renders: the first render has to be the server's one, so the switch waits for
 * the client.
 */
export const useIsMobileLayout = () => {
  const isClient = useIsClient()

  return isClient && isMobile()
}
