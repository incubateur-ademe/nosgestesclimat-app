import ContentLarge from '@/components/layout/ContentLarge'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import AutresQuestions from './_components/AutresQuestions'
import AvantDeCommencer from './_components/AvantDeCommencer'
import ButtonBack from './_components/ButtonBack'
import ButtonStart from './_components/ButtonStart'
import YouthTutorial from './_components/YouthTutorial'

type TutorialMode = 'default' | 'youth'

export default async function Tutoriel({
  params,
  searchParams,
}: PageProps<'/[locale]/tutoriel'> & {
  searchParams: Promise<{ mode: TutorialMode }>
}) {
  const { locale } = await params
  const { mode } = await searchParams

  if (mode === 'youth') {
    return (
      <div className="bg-primary-50">
        <ContentLarge className="px-4 lg:px-0">
          <YouthTutorial locale={locale as Locale} />
        </ContentLarge>
      </div>
    )
  }

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

          <ButtonStart />
        </div>

        <AutresQuestions />
      </div>
    </ContentLarge>
  )
}
