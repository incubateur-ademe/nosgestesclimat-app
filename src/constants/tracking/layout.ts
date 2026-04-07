// Figma comment #17
export const footerClickLanguage = (locale: string) => [
  'trackEvent',
  'Footer',
  'Click Language',
  `Click Language ${locale}`,
]

// Figma comment #18
export const breadcrumbClickLink = (href: string) => [
  'trackEvent',
  'Breadcrumb',
  'Click link',
  href,
]
