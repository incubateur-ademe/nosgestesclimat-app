import { APP_ENV } from '@/env/app-env'
import { publicEnv } from '@/env/public'
import posthog, { type PostHogConfig } from 'posthog-js'
import { savedCookieState } from './cookieStateStore'
import {
  getIframeInformation,
  type IframeInformation,
} from './iframeInformation'
import { reapplySessionProperties } from './posthogSessionProperties'

export type PostHogCookieState = 'accepted' | 'refused' | 'do_not_track'

export class PostHog {
  private _iframeInformation: IframeInformation | null = null

  private get iframeInformation(): IframeInformation {
    this._iframeInformation ??= getIframeInformation()
    return this._iframeInformation
  }
  update(cookieState: PostHogCookieState) {
    // Set config to cookieless mode, in case we come from DNT mode on
    posthog.set_config({
      cookieless_mode: 'on_reject',
    })
    switch (cookieState) {
      case 'accepted':
        posthog.opt_in_capturing()
        break

      case 'refused':
        posthog.reset()
        posthog.opt_out_capturing()
        break

      case 'do_not_track':
        this.switchDNTOn()
        break

      default:
        cookieState satisfies never
    }
    this.registerProperties()

    // Answering the banner rebuilds the SDK session manager, which drops every
    // session property registered so far (they were not persisted yet while the
    // consent was undecided). Replay them now that the consent is known.
    reapplySessionProperties()
  }

  /**
   * Resets the PostHog identity (new anonymous `distinct_id`) on logout without
   * dropping tracking: `posthog.reset()` also clears the SDK consent marker
   * (`__ph_opt_in_out_<token>`), we re-apply it right after the reset so the user is still tracked according to his previous consent.
   */
  resetIdentity() {
    posthog.reset()
    this.update(savedCookieState.posthog)
  }

  private switchDNTOn() {
    posthog.set_config({
      // Force type because type false is not listed, but does indeed have the desired behaviour
      cookieless_mode: false as unknown as PostHogConfig['cookieless_mode'],
    })

    posthog.opt_out_capturing()
  }

  init() {
    if (!this.iframeInformation.iframe) {
      this.initPosthog()
      return
    }

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.initPosthog()
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        threshold: 0,
      }
    )

    observer.observe(document.documentElement)
  }

  private initPosthog() {
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      return
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST,
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
      cookieless_mode: 'on_reject',
      defaults: '2026-01-30',
      debug: APP_ENV !== 'production',
      person_profiles: 'identified_only',
      tracing_headers: tracingHeaders(),
      /** Unfortunatly, NextJS router.replace does not trigger `history.pushState` systematically, so we need to capture pageview with React */
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: {
        capture_copied_text: false,
        url_ignorelist: ['/simulateur/bilan'],
      },
      rageclick: false,
      logs: {
        // `browser` completes `web-server` and `worker`: the third runtime, named
        // for where it runs. Same namespace as the back end, so the whole
        // product stays retrievable as one.
        serviceName: 'browser',
        environment: APP_ENV,
        serviceVersion: process.env.NEXT_PUBLIC_APP_VERSION,
        resourceAttributes: {
          'service.namespace': 'nosgestesclimat',
          // The SDK's `environment` lands on the deprecated
          // `deployment.environment`; the back end carries
          // `deployment.environment.name`. Emit both, so one filter reads the
          // three runtimes.
          'deployment.environment.name': APP_ENV,
        },
      },

      custom_campaign_params: ['mtm_campaign', 'mtm_kwd', 'mtm_keyword'], // Enable to set query parameters as properties on the events

      loaded: () => {
        this.registerProperties()
        // Inside an iframe `posthog.init()` is deferred until the visitor
        // scrolls; trackers may already have registered session properties by
        // then, when the SDK could not store them.
        reapplySessionProperties()
      },
    })

    if (savedCookieState.posthog === 'do_not_track') {
      this.switchDNTOn()
    }
  }

  private registerProperties() {
    posthog.register(this.iframeInformation)
  }
}

/** Hosts whose requests carry PostHog identity headers, so server logs link
 * back to the person and session recording. */
function tracingHeaders(): string[] | undefined {
  const hostname = new URL(publicEnv.NEXT_PUBLIC_SITE_URL).hostname

  return hostname ? [hostname] : undefined
}
