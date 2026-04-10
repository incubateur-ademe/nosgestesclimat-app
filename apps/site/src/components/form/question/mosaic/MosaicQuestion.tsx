'use client'

import { questionChooseAnswer } from '@/constants/tracking/question'
import { useRule } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import MosaicBooleanInput from './mosaicQuestion/MosaicBooleanInput'
import MosaicNumberInput from './mosaicQuestion/MosaicNumberInput'

interface Props {
  question: DottedName
  parentMosaic: DottedName
  index: number
  firstInputId: string
  value: number | boolean | undefined | '' | null
  setValue: (
    dottedName: DottedName,
    value: number | boolean | '' | undefined
  ) => void
}

export default function MosaicQuestion({
  question,
  parentMosaic,
  index,
  value,
  setValue,
  firstInputId,
}: Props) {
  const { type, parent, isInactive } = useRule(question)

  const { title, icons, description } = useRule(parent)

  const maybeIdFirstInput = { ...(index === 0 ? { id: firstInputId } : {}) }

  return (
    <>
      {type === 'number' && typeof value !== 'boolean' && (
        <MosaicNumberInput
          question={question}
          title={title}
          icons={icons}
          description={description}
          parentMosaic={parentMosaic}
          index={index}
          value={value}
          setValue={(value) => setValue(question, value)}
          {...maybeIdFirstInput}
        />
      )}
      {type === 'boolean' && typeof value !== 'number' && value !== '' && (
        <MosaicBooleanInput
          question={question}
          title={title}
          icons={icons}
          description={description}
          value={value}
          setValue={(value) => {
            setValue(question, value)
            trackMatomoEvent__deprecated(
              questionChooseAnswer({
                question: parent,
                answer: value,
              })
            )
          }}
          index={index}
          isInactive={isInactive}
          {...maybeIdFirstInput}
        />
      )}
    </>
  )
}
