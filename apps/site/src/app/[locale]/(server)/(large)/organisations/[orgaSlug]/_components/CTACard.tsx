import type { PropsWithChildren } from 'react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  overLabel: string | React.ReactNode
  title: string | React.ReactNode
  description: string | React.ReactNode
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  id?: string
}

export default function CTACard({
  overLabel,
  title,
  description,
  children,
  tag,
  className,
  id,
}: PropsWithChildren<Props>) {
  const Tag = tag ?? 'h2'
  return (
    <div
      className={twMerge(
        'flex h-full flex-col rounded-xl bg-white px-8 py-6',
        className
      )}
      id={id}>
      <div className="flex flex-col">
        <Tag className="order-1">{title}</Tag>
        <p className="text-secondary-700 -order-1 font-medium">{overLabel}</p>
      </div>

      <p className="mb-12">{description}</p>

      {children}
    </div>
  )
}
