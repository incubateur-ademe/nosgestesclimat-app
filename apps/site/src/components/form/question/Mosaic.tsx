'use client'

import type { FormQuestion } from '@/form-controller'
import { DEFAULT_FOCUS_ELEMENT_ID } from '@/constants/accessibility'
import { getWarningId } from '@/helpers/question/getWarningId'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import MosaicQuestion from './mosaic/MosaicQuestion'
import MosaicBooleanInput from './mosaic/MosaicBooleanInput'

interface Props {
  formQuestion: Extract<
    FormQuestion,
    { type: 'numberMosaic' | 'selectMosaic' }
  >
}

export default function Mosaic({ formQuestion }: Props) {
  const {
    question,
    children,
    values,
    setChildValue,
    aucun,
    setAucun,
    aucunOption,
    label,
    overLimitQuestions,
  } = formQuestion

  const { t } = useClientTranslation()

  return (
    <>
      <fieldset
        className={`grid w-[90%] auto-rows-fr items-stretch gap-2 md:w-full ${children.length <= 2 ? 'md:max-w-128 md:grid-cols-1' : 'md:grid-cols-2'} md:gap-4`}>
        <legend className="sr-only">{label}</legend>
        {children.map((questionOfMosaic, index) => (
          <MosaicQuestion
            key={questionOfMosaic}
            parentMosaic={question}
            question={questionOfMosaic}
            index={index}
            firstInputId={DEFAULT_FOCUS_ELEMENT_ID}
            value={values[questionOfMosaic]}
            setValue={setChildValue}
            warningId={
              overLimitQuestions.includes(questionOfMosaic)
                ? getWarningId(questionOfMosaic)
                : undefined
            }
          />
        ))}
        {aucunOption && (
          <MosaicBooleanInput
            question={`${question} . aucun` as DottedName}
            title={
              aucunOption === 'non concerné'
                ? t(
                    'simulator.mosaic.notConcerned',
                    'Je ne suis pas concerné·e'
                  )
                : t('simulator.mosaic.noneOfTheseOptions', 'Aucun')
            }
            icons="❌"
            value={aucun}
            setValue={setAucun}
            index={children.length}
          />
        )}
      </fieldset>
    </>
  )
}
