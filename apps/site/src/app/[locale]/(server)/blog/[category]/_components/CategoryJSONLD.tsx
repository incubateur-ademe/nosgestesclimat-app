import type { QuestionType } from '@/adapters/cmsClient'
import JSONLD from '@/components/seo/JSONLD'

interface BreadcrumbListItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

interface BreadcrumbList extends Record<string, unknown> {
  '@context': string
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbListItem[]
}

export default function CategoryJSONLD({
  title,
  questions,
  categorySlug,
}: {
  title: string
  questions: QuestionType[]
  categorySlug: string
}) {
  const jsonLd: (BreadcrumbList | Record<string, unknown>)[] = [
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
          name: title,
          item: `https://nosgestesclimat.fr/blog/${categorySlug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Articles',
          item: `https://nosgestesclimat.fr/blog/${categorySlug}?page=1`,
        },
      ],
    },
  ]

  if (questions?.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.htmlAnswer,
        },
      })),
    })
  }

  return <JSONLD jsonLd={jsonLd} />
}
