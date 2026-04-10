import Markdown from '@/design-system/utils/Markdown'
import { onKeyDownHelper } from '@/helpers/accessibility/onKeyDownHelper'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { HTMLAttributes, JSX, PropsWithChildren } from 'react'
import { useState } from 'react'
import QuestionButton from './QuestionButton'

interface Props {
  label?: string | JSX.Element
  labelText: string
  description?: string
  active: boolean
  onClick: () => void
  id?: string
  'data-testid'?: string
  isWithinGrid?: boolean
}

const buttonClassNames = {
  checked: 'border-primary-700 text-primary-900',
  unchecked: 'border-slate-500 hover:bg-primary-50',
}
const checkClassNames = {
  checked: 'border-primary-700 before:bg-primary-700',
  unchecked: 'border-slate-400',
}
const labelClassNames = {
  checked: 'text-primary-800',
  unchecked: 'text-slate-950',
}

export default function ChoiceInput({
  label,
  labelText,
  description,
  active,
  onClick,
  id,
  isWithinGrid,
  children,
  ...props
}: HTMLAttributes<HTMLInputElement> & PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useClientTranslation()

  const status = active ? 'checked' : 'unchecked'

  return (
    <>
      <div className="flex items-center gap-2">
        <label
          title={`${labelText} - ${active ? t('Option sélectionnée') : t('Sélectionner cette option')}`}
          className={`relative flex ${isWithinGrid ? 'w-full' : ''} cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-left transition-colors ${buttonClassNames[status]} focus-within:ring-primary-700 focus-within:ring-2 focus-within:ring-offset-2`}
          data-testid={`${props['data-testid']}-label`}>
          <input
            type="radio"
            tabIndex={0}
            className="sr-only"
            onClick={onClick}
            onKeyDown={onKeyDownHelper(() => onClick())}
            id={id}
            {...props}
          />
          <span
            className={`${checkClassNames[status]} relative flex h-5 w-5 items-center justify-center rounded-full border-2 text-sm before:absolute before:top-0.5 before:left-0.5 before:h-3 before:w-3 before:rounded-full before:p-1 md:h-5 md:w-5 md:text-base md:before:h-3 md:before:w-3`}
          />
          <span
            className={`text-default inline flex-1 align-middle text-sm md:text-base ${labelClassNames[status]}`}>
            {label ?? children}
          </span>
        </label>
        {description ? (
          <QuestionButton
            title={t(
              'simulator.inputs.choice.questionButton.title',
              "Plus d'informations - {{label}}",
              {
                label: labelText,
              }
            )}
            onClick={() => setIsOpen((previsOpen) => !previsOpen)}
          />
        ) : null}
      </div>
      {description && isOpen ? (
        <div className="border-primary-50 mb-4 w-auto rounded-xl border-2 bg-white p-3 text-sm sm:max-w-[30rem]">
          <Markdown className="mb-0! inline!">{description}</Markdown>
        </div>
      ) : null}
    </>
  )
}
