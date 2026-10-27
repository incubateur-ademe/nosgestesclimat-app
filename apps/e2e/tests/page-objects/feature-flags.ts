import type { Page } from '@playwright/test'

import { FF_COOKIE_NAME } from '../constants'

const DOMAIN = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname

export class FeatureFlags {
  constructor(private page: Page) {}

  async set(flags: Record<string, string | boolean>) {
    await this.page.context().addCookies([
      {
        name: FF_COOKIE_NAME,
        value: JSON.stringify(flags),
        domain: DOMAIN,
        path: '/',
        sameSite: 'Lax' as const,
      },
    ])
  }

  async enable(flag: string) {
    await this.set({ ...(await this.#read()), [flag]: true })
  }

  async disable(flag: string) {
    await this.set({ ...(await this.#read()), [flag]: false })
  }

  async #read(): Promise<Record<string, string | boolean>> {
    const cookies = await this.page.context().cookies()
    const ffCookie = cookies.find((c) => c.name === FF_COOKIE_NAME)
    if (!ffCookie) return {}
    try {
      return JSON.parse(ffCookie.value)
    } catch {
      return {}
    }
  }
}
