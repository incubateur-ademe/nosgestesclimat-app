import { DEFAULT_FOCUS_ELEMENT_ID } from '@/constants/accessibility'
import Button from '@/design-system/buttons/Button'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import { NUMBER_MOSAIC_WITHOUT_BUTTONS } from '@/publicodes-state/constants/questions'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import RawNumberInput from '../../numberInput/RawNumberInput'

interface Props {
  question: DottedName
  title?: string
  icons?: string
  description?: string
  setValue: (value: number | '' | undefined) => void
  index: number
  value: number | undefined | '' | null
  parentMosaic: string
}

export default function MosaicNumberInput({
  question,
  title,
  icons,
  description,
  setValue,
  index,
  value,
  parentMosaic,
}: Props) {
  const { plafond, unit } = useRule(question)

  const { t } = useClientTranslation()

  const isPlusDisabled = !!value && value >= plafond

  const shouldNotContainButtons = NUMBER_MOSAIC_WITHOUT_BUTTONS.has(
    parentMosaic as DottedName
  )

  // Model shenanigans for description split...
  return (
    <div
      className={
        'focus-within:ring-primary-700 flex items-center justify-between gap-1 rounded-xl border border-slate-500 bg-white p-3 focus-within:ring-2 focus-within:ring-offset-2'
      }>
      <div>
        {title && icons ? (
          <span className="mb-1 block text-sm md:text-base">
            {title}{' '}
            <Emoji className="inline-flex items-center leading-tight">
              {icons}
            </Emoji>
          </span>
        ) : null}
        {description ? (
          <>
            <p className="mb-0 text-xs italic md:text-xs">
              {description.split('\n')[0]}
            </p>
          </>
        ) : null}
      </div>

      <div
        className={`flex items-center gap-1.5 p-2 ${shouldNotContainButtons && 'pr-18'}`}>
        {!shouldNotContainButtons && (
          <Button
            disabled={!value}
            onClick={() => setValue((!!value ? value : 0) - 1)}
            size="sm"
            title={t(
              'simulator.mosaicNumberInput.remove',
              'Retirer un élément : {{title}}',
              {
                title,
              }
            )}
            className="z-10 h-8 w-8 items-center justify-center p-0">
            <span className="mb-[1px] block">-</span>
          </Button>
        )}
        <RawNumberInput
          className="focus-within:border-primary-700 focus-within:ring-primary-700 max-h-8 w-16 rounded-sm text-center ring-offset-2 focus-within:ring-2 focus-visible:outline-none"
          value={value === null ? 0 : (value ?? '')}
          placeholder={value === null ? '' : '_'}
          unit={shouldNotContainButtons ? unit : undefined}
          handleValueChange={({ floatValue, value: inputValue }) => {
            if (value === undefined && inputValue === '') {
              // If the input is cleared and the current value is undefined, do nothing
              return
            }
            setValue(inputValue === '' ? inputValue : floatValue)
          }}
          data-testid={`${question}`}
          id={`${DEFAULT_FOCUS_ELEMENT_ID}-${index}`}
        />
        {!shouldNotContainButtons && (
          <Button
            disabled={isPlusDisabled}
            onClick={() => setValue((!!value ? value : 0) + 1)}
            title={t(
              'simulator.mosaicNumberInput.add',
              'Ajouter un élément : {{title}}',
              {
                title,
              }
            )}
            size="sm"
            className="z-10 h-8 w-8 items-center justify-center p-0">
            <span className="mb-[1px] block">+</span>
          </Button>
        )}
      </div>
    </div>
  )
}
