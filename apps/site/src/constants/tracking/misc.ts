// Return tracking data in format
// [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]

export const trackingLocale = (locale: string) => [
  'trackEvent',
  'Misc',
  'Language',
  `Locale used ${locale}`,
]
export const trackingRegion = (region: string) => [
  'trackEvent',
  'Misc',
  'Region',
  `Region used: ${region}`,
]

export const trackingDownloadRavijenChart = [
  'trackEvent',
  'Misc',
  'Download Ravijen chart',
]

export const trackingClickRegionBanner = [
  'trackEvent',
  'Misc',
  'Click Region Banner',
]

// Banner
export const trackingBannerClick = ['trackEvent', 'Bannière', 'Click lien']
