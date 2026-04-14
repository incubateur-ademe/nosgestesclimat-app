'use client'

import Trans from '@/components/translation/trans/TransClient'
import { twMerge } from 'tailwind-merge'
import type { ButtonColor } from '../buttons/Button'
import Button from '../buttons/Button'

interface Props {
  children: React.ReactNode
  buttonLabel?: React.ReactNode
  buttonColor?: ButtonColor
  error?: string
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  className?: string
  additionnalButton?: React.ReactNode
  isVerticalLayout?: boolean
}

export default function Form({
  children,
  buttonLabel,
  additionnalButton,
  buttonColor,
  error,
  className,
  isVerticalLayout = true,
  ...props
}: Props) {
  const errorId = 'form-error'

  return (
    <form className={className} {...props} noValidate>
      <div
        className={twMerge(
          'flex w-full flex-col items-start gap-4 lg:flex-row',
          isVerticalLayout && 'md:flex-col lg:flex-col'
        )}>
        <div
          className={twMerge(
            'flex w-full flex-col',
            !isVerticalLayout && 'md:w-auto'
          )}>
          {children}

          {error && (
            <p
              id={errorId}
              className="my-4 text-sm text-red-500"
              role="alert"
              aria-live="assertive">
              {error}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 pb-8 sm:flex-row md:items-start md:gap-4">
          <Button
            className={twMerge(!isVerticalLayout && 'lg:mt-8 lg:h-14')}
            type="submit"
            data-testid="button-submit"
            color={buttonColor}>
            {buttonLabel ?? <Trans>Enregistrer</Trans>}
          </Button>
          {additionnalButton}
        </div>
      </div>
    </form>
  )
}
