'use client'

import CloseIcon from '@/components/icons/Close'
import ContentLarge from '@/components/layout/ContentLarge'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useDebug } from '@/hooks/useDebug'
import { useFormState } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'
import Question from './summary/Question'

interface Props {
  toggleQuestionList: () => void
  isQuestionListOpen: boolean
}
export default function Summary({
  toggleQuestionList,
  isQuestionListOpen,
}: Props) {
  const isDebug = useDebug()
  const { t } = useClientTranslation()

  const { relevantQuestions } = useFormState()

  return (
    <div
      className={twMerge(
        'my-8 px-4',
        isQuestionListOpen || isDebug ? 'block' : 'hidden'
      )}>
      <ContentLarge>
        <div className="flex items-start justify-between">
          <Title tag="h2" className="mb-4 text-lg md:text-xl">
            <Trans>Toutes les questions</Trans>
          </Title>

          <Button
            size="xs"
            className="gap-2"
            color="text"
            aria-label={t('Ferme')}
            onClick={() => toggleQuestionList()}>
            <CloseIcon className="fill-primary-700 w-5" />{' '}
            <span className="sr-only sm:hidden">
              <Trans>Fermer</Trans>
            </span>
            <span className="hidden text-sm sm:inline">
              <Trans>Fermer</Trans>
            </span>
          </Button>
        </div>
        {relevantQuestions.map((question: DottedName, index: number) => (
          <Question
            key={question}
            question={question}
            toggleQuestionList={toggleQuestionList}
            index={index}
          />
        ))}
      </ContentLarge>
    </div>
  )
}
