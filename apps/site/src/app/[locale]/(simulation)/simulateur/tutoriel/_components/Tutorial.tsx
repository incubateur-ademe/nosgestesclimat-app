import ContentLarge from '@/components/layout/ContentLarge'
import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { twMerge } from 'tailwind-merge'
import AutresQuestions from './AutresQuestions'
import AvantDeCommencer from './AvantDeCommencer'
import ButtonBack from './ButtonBack'

export default function Tutorial({ locale }: { locale: string }) {
  return (
    <ContentLarge className="mt-8 px-4 lg:px-0">
      <div className="mx-auto flex max-w-3xl flex-col overflow-auto">
        <Title
          data-testid="tutoriel-title"
          className="text-lg md:text-2xl"
          title={
            <Trans locale={locale} i18nKey="tutoriel.title">
              <span className="text-secondary-700 inline">10 minutes</span>{' '}
              chrono pour calculer votre empreinte carbone et eau
            </Trans>
          }
        />

        <AvantDeCommencer />
        <div className={twMerge('mb-12 flex w-full gap-4 sm:px-4 md:px-0')}>
          <ButtonBack />
          <ButtonLink
            href={SIMULATOR_PATH}
            data-testid="skip-tutorial-button"
            className="min-w-42!">
            <Trans locale={locale}>C'est parti !</Trans>{' '}
            <span aria-hidden="true">→</span>
          </ButtonLink>{' '}
        </div>
        <AutresQuestions />
      </div>
    </ContentLarge>
  )
}
