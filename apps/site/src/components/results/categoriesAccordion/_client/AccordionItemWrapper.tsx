'use client'

import { captureEndClickCategory } from '@/constants/tracking/posthogTrackers'
import AccordionItem from '@/design-system/layout/accordion/AccordionItem'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'

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
  categoryDottedName,
}: Props) {
  return (
    <AccordionItem
      title={title}
      name={name}
      content={content}
      ariaLabel={ariaLabel}
      tracker={(enhancer) => {
        const eventConfig = captureEndClickCategory({
          category: categoryDottedName,
        })

        const properties = enhancer({
          category: eventConfig.properties.category ?? '',
          action: eventConfig.properties.action ?? '',
        })

        trackPosthogEvent({
          eventName: eventConfig.eventName,
          properties,
        })
      }}
    />
  )
}
