import posthog, { type PostHogConfig } from 'posthog-js'
import { APP_ENV } from '../../../config/app-env'
import { savedCookieState } from './cookieStateStore'
import { getIframeInformation } from './iframeInformation'

export type PostHogCookieState = 'accepted' | 'refused' | 'do_not_track'

export class PostHog {
  private INTERSECTION_OBSERVER_THRESHOLD = 0.1

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
  }

  private switchDNTOn() {
    posthog.set_config({
      // Force type because type false is not listed, but does indeed have the desired behaviour
      cookieless_mode: false as unknown as PostHogConfig['cookieless_mode'],
    })
    posthog.opt_out_capturing()
  }

  init() {
    // Only initialized posthog if the document is in the viewport
    // (in case the app is in a iframe)
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
        threshold: this.INTERSECTION_OBSERVER_THRESHOLD,
      }
    )

    observer.observe(document.body)
  }

  private initPosthog() {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return
    }
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      cookieless_mode: 'on_reject',
      defaults: '2026-01-30',
      debug: APP_ENV !== 'production',
      person_profiles: 'identified_only',
      /** Unfortunatly, NextJS router.replace does not trigger `history.pushState` systematically, so we need to capture pageview with React */
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: {
        capture_copied_text: false,
        css_selector_allowlist: ['[data-track]'],
      },

      custom_campaign_params: [
        'mtm_campaign',
        'mtm_kwd',
        'mtm_keyword',
        'organisation',
        'poll',
      ], // Enable to set query parameters as properties on the events
    })
    if (savedCookieState.posthog === 'do_not_track') {
      this.switchDNTOn()
    }
    this.registerProperties()
  }

  private registerProperties() {
    posthog.register(getIframeInformation())
  }
}
