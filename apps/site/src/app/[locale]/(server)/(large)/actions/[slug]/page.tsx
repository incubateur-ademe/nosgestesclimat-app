import {
  END_PAGE_ACTIONS_PATH,
  MON_ESPACE_ACTIONS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import type { TabItem } from '@/design-system/layout/Tabs'
import Tabs from '@/design-system/layout/Tabs'
import Emoji from '@/design-system/utils/Emoji'
import Markdown from '@/design-system/utils/Markdown'
import { getUser } from '@/helpers/server/dal/user'
import { posthogClient } from '@/services/tracking/posthogServer'
import type { DefaultPageProps } from '@/types'
import { actions } from '@nosgestesclimat/core/features/actions/data/actions/index'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { notFound } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { ActionMedia } from './_components/ActionMedia'
import { Section, SectionTitle } from './_components/Section'

const SECTION_ID_I_UNDERSTAND = 'je-comprends'
const SECTION_ID_I_ACT = 'j-agis'
const SECTION_ID_I_BENEFIT = 'j-y-gagne'
const SECTION_ID_FURTHER_READING = 'a-decouvrir-aussi'

export default async function ActionPage({
  params,
}: DefaultPageProps<{ params: { slug: string } }>) {
  const { locale, slug } = await params
  const user = await getUser()
  const flag = await posthogClient.getFeatureFlag('actions-v2', user.id)

  if (!flag) notFound()

  // TODO: use MON_ESPACE_ACTIONS_PATH if user is not anon

  const action = actions.find((a) => a.slug === slug)

  if (!action) notFound()

  const themeClasses = classNames[action.theme.key]

  const tabsItems: TabItem[] = [
    {
      id: 'understand',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">💡</Emoji> Je comprends
        </span>
      ),
      href: `#${SECTION_ID_I_UNDERSTAND}`,
    },
  ]

  if (action.means) {
    tabsItems.push({
      id: 'act',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">▶️</Emoji> J'agis
        </span>
      ),
      href: `#${SECTION_ID_I_ACT}`,
    })
  }

  if (action.incentives) {
    tabsItems.push({
      id: 'incentives',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">💰</Emoji> J'y gagne
        </span>
      ),
      href: `#${SECTION_ID_I_BENEFIT}`,
    })
  }

  if (action.furtherReading) {
    tabsItems.push({
      id: 'further-reading',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">📖</Emoji> À découvrir aussi
        </span>
      ),
      href: `#${SECTION_ID_FURTHER_READING}`,
    })
  }

  return (
    <div>
      <GoBackLink
        href={user.isAuth ? MON_ESPACE_ACTIONS_PATH : END_PAGE_ACTIONS_PATH}
        className="mb-10"
      />
      <header
        className={twMerge(
          'mb-10 rounded-[20px] border p-5',
          themeClasses.header
        )}>
        <p
          className={twMerge(
            'mb-0 text-sm leading-normal font-bold',
            themeClasses.themeColor
          )}>
          <Emoji className="mr-1 text-lg leading-5.25">
            {action.theme.emoji}
          </Emoji>
          {action.theme.title}
        </p>
        <h1 className="mb-0 text-3xl leading-11 md:text-4xl md:leading-14">
          {action.title}
        </h1>
      </header>

      <div className="flex items-start overflow-scroll md:overflow-auto">
        <Tabs
          items={tabsItems}
          className="mb-10 whitespace-nowrap"
          ariaLabel={'Navigation de la page'}
        />
      </div>

      <div className="mb-10 grid gap-10 md:grid-cols-2 [&>*:last-child:nth-child(even)]:col-span-full">
        <Section
          id={SECTION_ID_I_UNDERSTAND}
          variant="highlighted"
          className="wscroll-mt-24 flex flex-col gap-5 md:col-span-full md:flex-row">
          <div className={action.media ? 'flex-1/2' : ''}>
            <SectionTitle emoji="💡">Je comprends l'enjeu</SectionTitle>
            <Markdown>{action.longDescription}</Markdown>
          </div>
          {action.media ? (
            <ActionMedia
              media={action.media}
              locale={locale}
              className="flex-1/2"
            />
          ) : null}
        </Section>
        {action.means ? (
          <Section id={SECTION_ID_I_ACT} className="wscroll-mt-24">
            <SectionTitle emoji="🚀">J’agis</SectionTitle>
            <Markdown>{action.means}</Markdown>
          </Section>
        ) : null}
        {action.incentives ? (
          <Section id={SECTION_ID_I_BENEFIT} className="wscroll-mt-24">
            <SectionTitle emoji="💡">J’y gagne</SectionTitle>
            <Markdown>{action.incentives}</Markdown>
          </Section>
        ) : null}
        {action.furtherReading ? (
          <Section id={SECTION_ID_FURTHER_READING} className="wscroll-mt-24">
            <SectionTitle emoji="🔗">À découvrir aussi</SectionTitle>
            <Markdown>{action.furtherReading}</Markdown>
          </Section>
        ) : null}
      </div>
    </div>
  )
}

const classNames: Record<
  Theme['key'],
  Record<'header' | 'themeColor', string>
> = {
  food: {
    header: 'bg-alimentation-50 border-alimentation-200',
    themeColor: 'text-alimentation-800',
  },
  transport: {
    header: 'bg-transport-50 border-transport-200',
    themeColor: 'text-transport-800',
  },
  housing: {
    header: 'bg-logement-50 border-logement-200',
    themeColor: 'text-logement-800',
  },
  societal_services: {
    header: 'bg-servicessocietaux-50 border-servicessocietaux-200',
    themeColor: 'text-servicessocietaux-800',
  },
  misc: {
    header: 'bg-divers-50 border-divers-200',
    themeColor: 'text-divers-800',
  },
}
