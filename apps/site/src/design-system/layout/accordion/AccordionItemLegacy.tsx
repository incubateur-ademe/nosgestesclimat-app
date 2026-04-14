import ChevronRight from '@/components/icons/ChevronRight'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'

interface AccordionItemProps {
  title: ReactNode
  name: string
  content: ReactNode
  className?: string
  isReadOnly?: boolean
  onClick?: () => void
  ariaLabel?: string
}

export default function AccordionItemLegacy({
  title,
  name,
  content,
  isReadOnly = false,
  onClick,
  ariaLabel,
}: AccordionItemProps) {
  const { t } = useClientTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const buttonId = useId()
  const panelId = useId()

  return (
    <li role="listitem">
      <button
        type="button"
        id={buttonId}
        aria-label={ariaLabel ?? name}
        title={`${ariaLabel ?? name} - ${isOpen ? t('Fermer') : t('Ouvrir')}`}
        onClick={() => {
          if (isReadOnly) return
          setIsOpen((prevState) => !prevState)
          if (onClick) {
            onClick()
          }
        }}
        className={`focus:ring-primary-700 relative z-10 flex w-full items-end justify-between py-2 focus:ring-2 focus:ring-offset-3 focus:outline-hidden ${isReadOnly ? 'cursor-default!' : ''}`}
        aria-disabled={isReadOnly}
        aria-expanded={isOpen}
        aria-controls={panelId}>
        <div className="flex flex-1 items-center gap-4">{title}</div>

        <div className="flex items-center gap-4">
          <ChevronRight
            className={`${isOpen ? 'rotate-90' : ''} ${
              isReadOnly ? 'opacity-20' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <motion.div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          tabIndex={-1}
          initial={{ opacity: 0.6, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-0">
          {content}
        </motion.div>
      )}
    </li>
  )
}
