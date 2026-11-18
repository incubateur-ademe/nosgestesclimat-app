import { publicEnv } from '@/env/public'

/**
 * Absolute origin of the site, without trailing slash.
 *
 * Single source for every absolute URL the site emits (canonical links,
 * sitemap, hreflang): a divergence between those would make crawlers see
 * entities that belong to different sites.
 */
export const getSiteUrl = () =>
  publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
