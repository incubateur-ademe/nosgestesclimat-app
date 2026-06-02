import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import {
  ACTION_DETAIL_PATH,
  END_PAGE_ACTIONS_PATH,
  MON_ESPACE_ACTIONS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import type { TabItem } from '@/design-system/layout/Tabs'
import Tabs from '@/design-system/layout/Tabs'
import Emoji from '@/design-system/utils/Emoji'
import Markdown from '@/design-system/utils/Markdown'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getUser } from '@/helpers/server/dal/user'
import { hasActionV2Rollout } from '@/services/actions/has-action-v2-rollout'
import type { DefaultPageProps } from '@/types'
import type { Theme } from '@/types/themes'
import { getAction } from '@nosgestesclimat/core/features/actions/services/get-action.service'
import { getPersonalizedActionDetails } from '@nosgestesclimat/core/features/actions/services/get-personalized-action-details.service'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { ActionMedia } from './_components/ActionMedia'
import { Section, SectionTitle } from './_components/Section'

const SECTION_ID_I_UNDERSTAND = 'je-comprends'
const SECTION_ID_I_ACT = 'j-agis'
const SECTION_ID_I_BENEFIT = 'j-y-gagne'
const SECTION_ID_FURTHER_READING = 'a-decouvrir-aussi'

type Props = DefaultPageProps<{ params: { slug: string } }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { params } = props
  const { locale, slug } = await params

  const action = await getAction(slug)

  if (!action) {
    return getMetadataObject({
      locale,
      title: t('actions.detailPage.404.title'),
      description: t('actions.detailPage.404.description'),
      robots: noIndexObject,
    })
  }

  return getMetadataObject({
    locale,
    // TODO: awaiting @fanny's SEO optimized texts
    title: action.title,
    description: action.longDescription,
    alternates: {
      canonical: ACTION_DETAIL_PATH.replace(':actionSlug', slug),
    },
  })
}

export default async function ActionPage({ params }: Props) {
  const { locale, slug } = await params
  const user = await getUser()
  const flag = await hasActionV2Rollout(user.id)

  if (!flag) notFound()

  const action = await getPersonalizedActionDetails(slug, user.id)

  if (!action) notFound()

  const impact = action.assessment?.impact
    ? formatFootprint(-1 * action.assessment.impact, {
        locale,
      })
    : null

  const { t } = await getServerTranslation({ locale })

  const themeClasses = classNames[action.theme.key]

  const tabsItems: TabItem[] = [
    {
      id: 'understand',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">💡</Emoji>
          <Trans locale={locale} i18nKey="actions.detailPage.tabs.understand">
            Je comprends
          </Trans>
        </span>
      ),
      href: `#${SECTION_ID_I_UNDERSTAND}`,
    },
  ]

  if (action.tips) {
    tabsItems.push({
      id: 'act',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">▶️</Emoji>
          <Trans locale={locale} i18nKey="actions.detailPage.tabs.act">
            J'agis
          </Trans>
        </span>
      ),
      href: `#${SECTION_ID_I_ACT}`,
    })
  }

  if (action.financialIncentives) {
    tabsItems.push({
      id: 'incentives',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">💰</Emoji>
          <Trans locale={locale} i18nKey="actions.detailPage.tabs.incentives">
            J'y gagne
          </Trans>
        </span>
      ),
      href: `#${SECTION_ID_I_BENEFIT}`,
    })
  }

  if (action.furtherExplore) {
    tabsItems.push({
      id: 'further-reading',
      label: (
        <span>
          <Emoji className="mr-1 hidden md:inline">📖</Emoji>
          <Trans
            locale={locale}
            i18nKey="actions.detailPage.tabs.furtherReading">
            À découvrir aussi
          </Trans>
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
          'mb-10 rounded-2xl border p-5',
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
        {impact ? (
          <div className="mt-4 flex items-start">
            <div
              className={`rounded-xl border px-5 py-2 ${themeClasses.impactBorder}`}>
              <p
                className={`mb-0 text-sm/normal font-bold ${themeClasses.impactColor}`}>
                <Trans
                  locale={locale}
                  i18nKey="actions.detailPage.impact.title">
                  Gain potentiel pour votre empreinte
                </Trans>
              </p>
              <p className="text-sm/normal font-bold text-slate-600">
                <Trans
                  locale={locale}
                  i18nKey="actions.detailPage.impact.value"
                  values={{
                    formattedValue: impact.formattedValue,
                    unit: impact.unit,
                  }}>
                  <span
                    className={`mr-1 text-[40px]/normal font-extrabold ${themeClasses.impactColor}`}>
                    {'{{formattedValue}}'}
                  </span>{' '}
                  {'{{unit}}'} CO<sub>2</sub>e / an
                </Trans>
              </p>
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex items-start overflow-scroll md:overflow-auto">
        <Tabs
          items={tabsItems}
          className="mb-10 whitespace-nowrap"
          ariaLabel={t('actions.detailPage.nav', 'Navigation de la page')}
        />
      </div>

      <div className="mb-10 grid gap-10 md:grid-cols-2 [&>*:last-child:nth-child(even)]:col-span-full">
        <Section
          id={SECTION_ID_I_UNDERSTAND}
          variant="highlighted"
          className="flex scroll-mt-24 flex-col gap-5 md:col-span-full md:flex-row">
          <div className={action.media ? 'flex-1/2' : ''}>
            <SectionTitle emoji="💡">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.understand">
                Je comprends l'enjeu
              </Trans>
            </SectionTitle>
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
        {action.tips ? (
          <Section id={SECTION_ID_I_ACT} className="scroll-mt-24">
            <SectionTitle emoji="🚀">
              <Trans locale={locale} i18nKey="actions.detailPage.sections.act">
                J'agis
              </Trans>
            </SectionTitle>
            <Markdown>{action.tips}</Markdown>
          </Section>
        ) : null}
        {action.financialIncentives ? (
          <Section id={SECTION_ID_I_BENEFIT} className="scroll-mt-24">
            <SectionTitle emoji="💡">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.incentives">
                J'y gagne
              </Trans>
            </SectionTitle>
            <Markdown>{action.financialIncentives}</Markdown>
          </Section>
        ) : null}
        {action.furtherExplore ? (
          <Section id={SECTION_ID_FURTHER_READING} className="scroll-mt-24">
            <SectionTitle emoji="🔗">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.furtherReading">
                À découvrir aussi
              </Trans>
            </SectionTitle>
            <Markdown>{action.furtherExplore}</Markdown>
          </Section>
        ) : null}
      </div>
    </div>
  )
}

const classNames: Record<
  Theme['key'],
  Record<'header' | 'themeColor' | 'impactBorder' | 'impactColor', string>
> = {
  food: {
    header: 'bg-alimentation-50 border-alimentation-200',
    themeColor: 'text-alimentation-800',
    impactBorder: 'border-alimentation-300',
    impactColor: 'text-alimentation-800',
  },
  transport: {
    header: 'bg-transport-50 border-transport-200',
    themeColor: 'text-transport-800',
    impactBorder: 'border-transport-300',
    impactColor: 'text-transport-800',
  },
  housing: {
    header: 'bg-logement-50 border-logement-200',
    themeColor: 'text-logement-800',
    impactBorder: 'border-logement-300',
    impactColor: 'text-logement-800',
  },
  societal_services: {
    header: 'bg-servicessocietaux-50 border-servicessocietaux-200',
    themeColor: 'text-servicessocietaux-800',
    impactBorder: 'border-servicessocietaux-300',
    impactColor: 'text-servicessocietaux-800',
  },
  misc: {
    header: 'bg-divers-50 border-divers-200',
    themeColor: 'text-divers-800',
    impactBorder: 'border-divers-300',
    impactColor: 'text-divers-800',
  },
}
