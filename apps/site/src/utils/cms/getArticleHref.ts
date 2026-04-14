export function getArticleHref({
  categorySlug,
  articleSlug,
}: {
  categorySlug: string
  articleSlug: string
}) {
  return `/blog/${categorySlug}/${articleSlug}`
}
