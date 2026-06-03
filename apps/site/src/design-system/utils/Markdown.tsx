'use client'

import type { LinkProps } from '@/components/Link'
import Link from '@/components/Link'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { MarkdownToJSX } from 'markdown-to-jsx'
import MarkdownToJsx from 'markdown-to-jsx'
import Image from 'next/image'
import type { ComponentProps } from 'react'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import ButtonLink from '../buttons/ButtonLink'

type MarkdownProps = ComponentProps<typeof MarkdownToJsx> & {
  className?: string
  components?: MarkdownToJSX.Overrides
  renderers?: Record<string, unknown>
  forceTargetBlankOnExternalLinks?: boolean
}

export default function Markdown({
  children,
  components = {},
  forceTargetBlankOnExternalLinks = false,
  ...otherProps
}: MarkdownProps) {
  return (
    <div className="markdown" data-testid="markdown">
      <MarkdownToJsx
        {...otherProps}
        options={{
          ...otherProps.options,
          forceBlock: true,
          overrides: {
            blockquote: {
              component: ({ ...props }) => (
                <p {...props} className={twMerge(props.className, 'mb-2!')} />
              ),
            },
            a: forceTargetBlankOnExternalLinks ? TargetBlankExternalLink : Link,
            img: {
              component: ({
                ...props
              }: {
                width?: number
                height?: number
                alt?: string
                src?: string
                [key: string]: unknown
              }) => (
                <Image
                  sizes="100vw"
                  width={props.width ?? 900}
                  height={props.height ?? 500}
                  style={{ width: '100%', height: 'auto' }}
                  alt={props.alt ?? ''}
                  src={props.src!}
                />
              ),
            },
            button: ButtonLink,
            input: {
              component: ({
                type,
                ...props
              }: {
                type?: string
                [key: string]: unknown
              }) => {
                // If type is checkbox, return a dummy checkbox not interactive
                if (type === 'checkbox') {
                  return <div className="h-4 w-4 rounded-xs bg-gray-200" />
                }
                return <input type={type} {...props} />
              },
            },
          },
          ...components,
        }}>
        {children}
      </MarkdownToJsx>
    </div>
  )
}

const TargetBlankExternalLink = ({ href, ...props }: LinkProps) => {
  const { t } = useClientTranslation()
  const target = isExternalLink(href, process.env.NEXT_PUBLIC_SITE_URL!)
    ? '_blank'
    : undefined

  const targetBlankProps: Partial<LinkProps> = {
    target,
  }

  if (target === '_blank') {
    targetBlankProps.rel = 'noopener noreferrer'
    if (props.children) {
      targetBlankProps['aria-label'] =
        `${nodeToText(props.children)} ${t('components.markdown.linkTargetBlankAriaLabel', '(ouvrir dans une nouvelle fenêtre)')}`
    }
  }

  return <Link href={href} {...props} {...targetBlankProps} />
}

function isExternalLink(href: string, siteUrl: string): boolean {
  try {
    const url = new URL(href)
    const site = new URL(siteUrl)
    return url.origin !== site.origin
  } catch {
    return false
  }
}

function nodeToText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join('')
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return nodeToText(node.props.children)
  }
  return ''
}
