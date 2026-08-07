const isPreviewUrl = (siteUrl: string | undefined) => {
  return siteUrl
    ? /^nosgestesclimat-site-preprod-pr\d+\.osc-fr1\.scalingo\.io$/.test(
        new URL(siteUrl).hostname
      )
    : false
}

export const APP_ENV =
  process.env.NEXT_PUBLIC_SITE_URL === 'https://nosgestesclimat.fr'
    ? 'production'
    : process.env.NEXT_PUBLIC_SITE_URL ===
          'https://preprod.nosgestesclimat.fr' ||
        isPreviewUrl(process.env.NEXT_PUBLIC_SITE_URL)
      ? 'preprod'
      : 'development'
