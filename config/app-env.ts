export const APP_ENV =
  process.env.NEXT_PUBLIC_SITE_URL === 'https://nosgestesclimat.fr'
    ? 'production'
    : process.env.NEXT_PUBLIC_SITE_URL === 'https://preprod.nosgestesclimat.fr'
      ? 'preprod'
      : 'development'
