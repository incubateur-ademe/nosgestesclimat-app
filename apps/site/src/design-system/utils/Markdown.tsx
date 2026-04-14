'use client'

import Link from '@/components/Link'
import type { MarkdownToJSX } from 'markdown-to-jsx'
import MarkdownToJsx from 'markdown-to-jsx'
import Image from 'next/image'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
import ButtonLink from '../buttons/ButtonLink'

type MarkdownProps = ComponentProps<typeof MarkdownToJsx> & {
  className?: string
  components?: MarkdownToJSX.Overrides
  renderers?: Record<string, unknown>
}

export default function Markdown({
  children,
  components = {},
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
            a: Link,
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
                  alt={props.alt! ?? ''}
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
