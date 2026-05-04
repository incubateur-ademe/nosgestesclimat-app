import ContentLarge from '@/components/layout/ContentLarge'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import AutresQuestions from './AutresQuestions'
import AvantDeCommencer from './AvantDeCommencer'
import ButtonBack from './ButtonBack'

export default function Tutorial({
  locale,
  disclaimer,
  buttonNext,
}: {
  locale: string
  disclaimer?: React.ReactNode
  buttonNext: React.ReactNode
}) {
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

        <AvantDeCommencer disclaimer={disclaimer} />
        <div className="mb-12 flex w-full items-end gap-4 sm:px-4 md:px-0">
          <ButtonBack />
          {buttonNext}
        </div>
        <AutresQuestions />
      </div>
    </ContentLarge>
  )
}
