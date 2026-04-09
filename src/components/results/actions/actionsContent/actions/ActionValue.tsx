import Trans from '@/components/translation/trans/TransClient'
import { actionsClickAdditionalQuestion } from '@/constants/tracking/pages/actions'
import Button from '@/design-system/buttons/Button'
import { getCarbonFootprint } from '@/helpers/actions/getCarbonFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { TranslationFunctionType } from '@/types/translation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { getCorrectedValue } from '@/utils/getCorrectedValue'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { i18n as I18nType } from 'i18next'
import type { EvaluatedNode } from 'publicodes'

const getFormattedActionValue = (
  { t, i18n }: { t: TranslationFunctionType; i18n: I18nType },
  actionValue: EvaluatedNode
) => {
  const correctedValue = getCorrectedValue(actionValue)

  if (correctedValue == undefined) {
    return {}
  }

  const [stringValue, unit] = getCarbonFootprint(
    { t, i18n },
    correctedValue,
    false,
    true
  )

  const sign = correctedValue > 0 ? '-' : '+'

  return { correctedValue, stringValue, unit, sign }
}

export default function ActionValue({
  total,
  isDisabled,
  hasFormula,
  dottedName,
  setActionWithFormOpen,
  remainingQuestions,
}: {
  total: number
  isDisabled: boolean | null | undefined
  hasFormula: boolean
  dottedName: DottedName
  setActionWithFormOpen: (dottedName: DottedName) => void
  remainingQuestions: DottedName[]
}) {
  const { t, i18n } = useClientTranslation()

  const { numericValue } = useRule(dottedName)

  const { correctedValue, stringValue, unit, sign } = getFormattedActionValue(
    { t, i18n },
    {
      nodeValue: numericValue,
      unit: { numerators: ['kgCO2'], denominators: [] },
      missingVariables: {},
    } as unknown as EvaluatedNode
  )

  if (correctedValue == undefined) {
    return
  }

  const relativeValue = Math.abs(Math.round(100 * (correctedValue / total)))

  if (numericValue === 0) return null

  if (hasFormula && isDisabled) {
    return <div>{t('Non applicable')}</div>
  }

  const remainingQuestionsText = t(
    'publicodes.ActionVignette.questionsRestantesText',
    {
      nbRemainingQuestions: remainingQuestions.length,
      pluralSuffix: remainingQuestions.length > 1 ? 's' : '',
    }
  )

  return (
    <div className="focus:ring-primary-700 focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
      <div
        className={`border-primary-700 bg-primary-700 mb-2 inline-block rounded-[0.25rem] border-2 border-solid pr-[2px] pl-2 text-white ${
          correctedValue != undefined && correctedValue < 0 ? 'bg-red-500' : ''
        }${remainingQuestions && remainingQuestions.length > 0 ? 'grayscale' : ''}`}>
        <span>
          {sign ?? ''}&nbsp;
          <strong>{stringValue}</strong>&nbsp;
          <span>{t(unit, { ns: 'units' })}</span>
        </span>

        {total && relativeValue > 0 && (
          <span className="bg-primary-100 text-primary-700 ml-2 rounded-e-sm px-1">
            {relativeValue}%
          </span>
        )}
      </div>

      {remainingQuestions && remainingQuestions.length > 0 && (
        <>
          <div className="text-primary-700 mb-1 text-xs">
            {remainingQuestionsText}
          </div>
          <Button
            size="xs"
            color="borderless"
            title={t(
              'actions.actionCard.actionValue.answerButton.title',
              'Répondre aux questions restantes'
            )}
            onClick={() => {
              trackMatomoEvent__deprecated(
                actionsClickAdditionalQuestion(dottedName)
              )
              setActionWithFormOpen(dottedName)
            }}>
            <Trans i18nKey="actions.actionCard.actionValue.answerButton.label">
              Répondre
            </Trans>
          </Button>
        </>
      )}
    </div>
  )
}
