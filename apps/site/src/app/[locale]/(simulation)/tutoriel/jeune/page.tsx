import ContentLarge from '@/components/layout/ContentLarge'
import type { Locale } from '@/i18nConfig'
import YouthTutorial from './_components/YouthTutorial'

export default async function YouthTutorialPage({
  params,
}: PageProps<'/[locale]/tutoriel'>) {
  const { locale } = await params

  return (
    <div className="bg-primary-50">
      <ContentLarge className="px-4 lg:px-0">
        <YouthTutorial locale={locale as Locale} />
      </ContentLarge>
    </div>
  )
}
