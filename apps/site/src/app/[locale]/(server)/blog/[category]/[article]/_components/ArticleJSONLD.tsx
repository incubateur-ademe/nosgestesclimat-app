import type { ArticleType } from '@/adapters/cmsClient'
import JSONLD from '@/components/seo/JSONLD'

export default function ArticleJSONLD({
  article,
  articleTitle,
  articleSlug,
  categoryTitle,
  categorySlug,
}: {
  article: ArticleType
  articleTitle: string
  articleSlug: string
  categoryTitle: string
  categorySlug: string
}) {
  return (
    <JSONLD
      jsonLd={[
        {
          '@context': 'https://schema.org/',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil Blog',
              item: 'https://nosgestesclimat.fr/blog',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: categoryTitle,
              item: `https://nosgestesclimat.fr/blog/${categorySlug}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: articleTitle,
              item: `https://nosgestesclimat.fr/blog/${categorySlug}/${articleSlug}`,
            },
          ],
        },
        {
          '@context': 'https://schema.org/',
          '@type': 'BlogPosting',
          headline: article.title,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          image: {
            '@type': 'imageObject',
            url: article.image?.url,
            height: '640',
            width: '800',
          },
          author: {
            '@type': 'Person',
            name: article.author?.name,
          },
        },
      ]}
    />
  )
}
