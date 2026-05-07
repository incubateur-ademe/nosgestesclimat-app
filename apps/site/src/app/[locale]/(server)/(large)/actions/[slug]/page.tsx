import Emoji from '@/design-system/utils/Emoji'
import Markdown from '@/design-system/utils/Markdown'
import type { DefaultPageProps } from '@/types'
import { actions } from '@nosgestesclimat/core/features/actions/data/actions/index'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { notFound } from 'next/navigation'
import { ActionMedia } from './_components/ActionMedia'
import { Section, SectionTitle } from './_components/Section'

export default async function ActionPage({
  params,
}: DefaultPageProps<{ params: { slug: string } }>) {
  const { locale, slug } = await params

  // TODO: allow unauthenticated users to access the page
  // const user = await throwNextError(getAuthUser)
  // const flag = await posthogClient.getFeatureFlag('actions-v2', user.id)

  // if (!flag) notFound()
  // console.log(user)
  // console.log(flag)

  // TODO: use slug instead of id
  const action = actions.find((a) => a.id === slug)

  if (!action) notFound()

  const themeClasses = classNames[action.theme.key]

  return (
    <div>
      <header className={`${themeClasses.headerBg} mb-10 rounded-[20px] p-5`}>
        <p
          className={`${themeClasses.themeColor} mb-0 text-sm leading-normal font-bold`}>
          <Emoji className="mr-1 text-lg leading-5.25">
            {action.theme.emoji}
          </Emoji>
          {action.theme.title}
        </p>
        <h1 className="mb-0 text-3xl leading-11 md:text-4xl md:leading-14">
          {action.title}
        </h1>
      </header>
      <div className="mb-10 grid gap-10">
        <Section variant="highlighted" className="flex flex-col gap-5">
          <div>
            <SectionTitle>Je comprends l'enjeu</SectionTitle>
            <Markdown>{action.longDescription}</Markdown>
          </div>
          {action.media ? (
            <ActionMedia media={action.media} locale={locale} />
          ) : null}
        </Section>
        {action.means ? (
          <Section>
            <SectionTitle>J’agis</SectionTitle>
            <Markdown>{action.means}</Markdown>
          </Section>
        ) : null}
        {action.incentives ? (
          <Section>
            <SectionTitle>J’y gagne</SectionTitle>
            <Markdown>{action.incentives}</Markdown>
          </Section>
        ) : null}
        {action.furtherReading ? (
          <Section>
            <SectionTitle>À découvrir aussi</SectionTitle>
            <Markdown>{action.furtherReading}</Markdown>
          </Section>
        ) : null}
      </div>
    </div>
  )
}

const classNames: Record<
  Theme['key'],
  Record<'headerBg' | 'themeColor', string>
> = {
  food: {
    headerBg: 'bg-alimentation-100',
    themeColor: 'text-alimentation-800',
  },
  transport: { headerBg: 'bg-transport-100', themeColor: 'text-transport-800' },
  housing: { headerBg: 'bg-logement-100', themeColor: 'text-logement-800' },
  societal_services: {
    headerBg: 'bg-services-societaux-100',
    themeColor: 'text-services-societaux-800',
  },
  misc: { headerBg: 'bg-divers-100', themeColor: 'text-divers-800' },
}
