export const getPostThumbnailClickEvent = (slug: string) => [
  'trackEvent',
  'blog',
  'article',
  slug,
]
