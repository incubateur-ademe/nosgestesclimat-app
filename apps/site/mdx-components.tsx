// THIS FILE ONLY ADD COMPONENTS TO MDX PAGES. THE BLOG POSTS COMPONENTS ARE IN THE `utils/Markdown` COMPONENT.

import type { MDXComponents } from 'mdx/types'

import DisablePosthogCheckbox from '@/components/tracking/DisablePosthogCheckbox'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title, { type TitleProps } from '@/design-system/layout/Title'
import Image from 'next/image'
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react'

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: (props: TitleProps) => <Title {...props} />,
    ButtonLink: (
      props: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>
    ) => (
      <div className="text-center">
        <ButtonLink href={props.href ?? ''}>{props.children}</ButtonLink>
      </div>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        width={props.width ?? 900}
        height={props.height ?? 500}
        style={{ width: '100%', height: 'auto' }}
        alt={(props.alt as string) ?? ''}
        {...props}
      />
    ),
    DisablePosthogCheckbox: () => <DisablePosthogCheckbox />,
    ...components,
  }
}
