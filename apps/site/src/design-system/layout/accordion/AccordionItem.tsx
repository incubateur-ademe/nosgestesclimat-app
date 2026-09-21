'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import { useClientTranslation } from '@/hooks/useClientTranslation'

import type { ReactNode } from 'react'
import { useId, useState } from 'react'

export interface AccordionItemType {
  title: ReactNode
  name: string
  content: ReactNode
  className?: string
  isReadOnly?: boolean
  onClick?: () => void
  ariaLabel?: string
}

export default function AccordionItem({
  title,
  name,
  content,
  isReadOnly = false,
  onClick,
  ariaLabel,
}: AccordionItemType) {
  const { t } = useClientTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const buttonId = useId()
  const panelId = useId()

  return (
    <li className="max-w-full list-none">
      <button
        type="button"
        id={buttonId}
        data-ph-capture-attribute-action={isOpen ? 'Fermer' : 'Ouvrir'}
        data-ph-capture-attribute-label={ariaLabel ?? name}
        aria-label={ariaLabel ?? name}
        title={`${ariaLabel ?? name} - ${isOpen ? t('Fermer') : t('Ouvrir')}`}
        onClick={() => {
          if (isReadOnly) return

          setIsOpen((prevState) => !prevState)

          if (onClick) {
            onClick()
          }
        }}
        className={`focus-visible:ring-primary-700 relative z-10 mb-1 flex w-full max-w-full items-end justify-between focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 ${isReadOnly ? 'cursor-default!' : ''}`}
        aria-disabled={isReadOnly}
        aria-expanded={isOpen}
        aria-controls={panelId}>
        <div className="flex max-w-full flex-1 items-center gap-4">{title}</div>

        <div className="absolute top-1/2 right-6 flex -translate-y-1/2 items-center">
          <ChevronRight
            className={`h-4 w-4 stroke-slate-950 ${isOpen ? '-rotate-90' : 'rotate-90'} ${
              isReadOnly ? 'opacity-20' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          tabIndex={-1}
          className="animate-fade-in-slide-from-top z-0 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100">
          {content}
        </div>
      )}
    </li>
  )
}
