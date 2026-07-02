import posthog, { type PostHogConfig } from 'posthog-js'
import { APP_ENV } from '../../../config/app-env'
import { savedCookieState } from './cookieStateStore'
import {
  getIframeInformation,
  type IframeInformation,
} from './iframeInformation'

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
        url_ignorelist: ['/simulateur/bilan'],
      },
      rageclick: false,

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
    posthog.register_for_session(this.iframeInformation)
  }
}
