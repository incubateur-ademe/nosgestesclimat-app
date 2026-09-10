'use client'

import AccordionItem from '@/design-system/layout/accordion/AccordionItem'
import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  name: string
  content: ReactNode
  ariaLabel?: string
  categoryDottedName: string
}

export default function AccordionItemWrapper({
  title,
  name,
  content,
  ariaLabel,
}: Props) {
  return (
    <AccordionItem
      title={title}
      name={name}
      content={content}
      ariaLabel={ariaLabel}
    />
  )
}
