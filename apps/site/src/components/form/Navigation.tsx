'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import {
  useFormNavigation,
  type SubmitButtonKind,
} from '@/form-controller'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useIframe } from '@/hooks/useIframe'
import { useMagicKey } from '@/hooks/useMagicKey'
import { cn } from 'cn'

function SubmitButtonContent({ kind }: { kind: SubmitButtonKind }) {
  if (kind === 'loading') {
    return (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.loading">
          <Loader color="light" size="sm" className="mr-2" /> Terminer
        </Trans>
      </span>
    )
  }

  if (kind === 'finish') {
    return (
      <span data-testid="end-test-button">
        <Trans i18nKey="simulator.navigation.nextButton.finished">
          Terminer
        </Trans>
      </span>
    )
  }

  return (
    <span data-testid="next-question-button">
      <Trans i18nKey="simulator.navigation.nextButton.next">Suivant</Trans>{' '}
      <span aria-hidden>→</span>
    </span>
  )
}

export default function Navigation() {
  const { t } = useClientTranslation()
  const { isIframe } = useIframe()

  const { next, prev } = useFormNavigation()

  useMagicKey({
    gotToNextQuestion: next.go,
    isLastQuestion: next.kind !== 'next',
  })

  const submitButtonTitle = {
    loading: t(
      'common.navigation.nextQuestion.loading.label',
      'Terminer le test et accéder à la page de résultats, chargement en cours'
    ),
    finish: t(
      'common.navigation.nextQuestion.finish.label',
      'Terminer le test et accéder à la page de résultats'
    ),
    next: t(
      'common.navigation.nextQuestion.next.label',
      'Aller à la question suivante'
    ),
  }[next.kind]

  const showFinishEmphasis = next.kind === 'finish' && !next.isDisabled

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50 min-h-16.5 bg-gray-100 py-3',
        isIframe &&
          'relative right-auto bottom-auto left-auto z-0 bg-transparent'
      )}>
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-6xl justify-between gap-1 px-4 md:gap-4 lg:justify-start'
        )}>
        <Button
          size="md"
          onClick={prev.go}
          disabled={prev.isDisabled}
          variant="text"
          className="px-3"
          title={t(
            'common.navigation.previousButton.label',
            'Aller à la question précédente'
          )}>
          <span aria-hidden className="hidden md:inline">
            ←
          </span>{' '}
          {t('Précédent')}
        </Button>

        <Button
          color="primary"
          disabled={next.isDisabled}
          size="md"
          title={submitButtonTitle}
          onClick={next.go}
          className={cn(
            'p-3 text-sm',
            showFinishEmphasis &&
              'animate-bg-pulse hover:bg-primary-900! motion-reduce:animate-none'
          )}>
          <span
            className={cn(
              showFinishEmphasis &&
                'bg-rainbow animate-rainbow-fast bg-clip-text! text-transparent! duration-1000 motion-reduce:animate-none'
            )}
            key={next.kind}>
            <SubmitButtonContent kind={next.kind} />
          </span>
        </Button>
      </div>
    </div>
  )
}
