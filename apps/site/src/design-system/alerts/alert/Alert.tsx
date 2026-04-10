'use client'

import CloseIcon from '@/components/icons/Close'
import Trans from '@/components/translation/trans/TransClient'
import { type ReactNode, createElement } from 'react'
import { twMerge } from 'tailwind-merge'

export type AlertType = 'default' | 'success' | 'warning' | 'error'

const getTypeClassNames = (type: AlertType) => {
  switch (type) {
    case 'default':
      return 'border-blue-200 bg-blue-100 text-blue-950'
    case 'success':
      return 'border-green-200 bg-green-100 text-green-950'
    case 'warning':
      return 'border-orange-200 bg-orange-100 text-orange-950'
    case 'error':
      return 'border-red-200 bg-red-100 text-red-950'
  }
}

export default function Alert({
  id,
  title,
  titleTag,
  description,
  onClose,
  type = 'default',
  className,
  ...otherProps
}: {
  id?: string
  title?: ReactNode | string
  titleTag?: string
  description: ReactNode | string
  onClose?: () => void
  type?: AlertType
  className?: string
}) {
  const onCloseClassName = onClose ? 'pr-14' : ''

  return (
    <section
      id={id}
      className={twMerge(
        'relative rounded-xl border-2 p-4 md:p-6',
        getTypeClassNames(type),
        onCloseClassName,
        className
      )}
      {...otherProps}>
      {onClose && (
        <button
          data-testid="alert-close"
          className="absolute top-3 right-4"
          onClick={onClose}>
          <span className="not-sr-only">
            <CloseIcon className="w-6" />
          </span>
          <span className="sr-only">
            <Trans>Fermer</Trans>
          </span>
        </button>
      )}

      {title &&
        createElement(
          titleTag ?? 'h2',
          { className: 'mb-3 text-sm font-bold' },
          title
        )}
      <div className="mb-0 text-sm">{description}</div>
    </section>
  )
}
