import type { MDXProps } from 'mdx/types'
import type React from 'react'

interface Props {
  dictionnaries: {
    fr: (props: MDXProps) => React.JSX.Element
    en: (props: MDXProps) => React.JSX.Element
  }
  locale: string
}

export const getLocalisedMDX = ({ dictionnaries, locale }: Props) => {
  switch (locale) {
    case 'en':
      return dictionnaries.en
    case 'fr':
    default:
      return dictionnaries.fr
  }
}
