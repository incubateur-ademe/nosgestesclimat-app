import { savedCookieState } from './cookieStateStore'

export type GoogleTagCookieState = 'accepted' | 'refused'

export class GoogleTagManager {
  constructor() {
    this.update(savedCookieState.googleTag)
  }
  update(cookieState: GoogleTagCookieState) {
    if (typeof window === 'undefined') return

    switch (cookieState) {
      case 'accepted':
        window.gtag?.('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        })
        break
      case 'refused':
        window.gtag?.('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })
        break
      default:
        cookieState satisfies never
    }
  }
}
