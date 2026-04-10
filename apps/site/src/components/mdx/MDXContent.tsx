import { getLocalisedMDX } from '@/helpers/getLocalisedMDX'
import type { MDXProps } from 'mdx/types'
import type { JSX } from 'react'

interface Props {
  contentFr: (props: MDXProps) => JSX.Element
  contentEn?: (props: MDXProps) => JSX.Element
  locale: string
}

export default function MDXContent({ contentFr, contentEn, locale }: Props) {
  const Content = getLocalisedMDX({
    dictionnaries: {
      fr: contentFr,
      en: contentEn || contentFr,
    },
    locale: locale ?? 'fr',
  })

  return (
    <div className="markdown">
      <Content />
    </div>
  )
}
