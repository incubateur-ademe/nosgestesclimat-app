import ActionTracker from '@/components/actions/ActionTracker'
import BetaBanner from '@/components/actions/BetaBanner'
import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import {
  ACTION_DETAIL_PATH,
  ACTIONS_PATH,
  END_PAGE_ACTIONS_PATH,
  MON_ESPACE_ACTIONS_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Emoji from '@/design-system/utils/Emoji'
import Markdown from '@/design-system/utils/Markdown'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import { getActionAlternateLocales } from '@/services/actions/get-action-alternate-locales'
import { getPersonalizedActionDetails } from '@/services/actions/get-personalized-action-details'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import type { Theme } from '@/types/themes'
import { toSearchParams } from '@/utils/nextjs/toSearchParams'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { ActionMedia } from './_components/ActionMedia'
import { Section, SectionTitle } from './_components/Section'

const SECTION_ID_I_UNDERSTAND = 'je-comprends'
const SECTION_ID_I_ACT = 'j-agis'
const SECTION_ID_I_BENEFIT = 'j-y-gagne'
const SECTION_ID_FURTHER_READING = 'a-decouvrir-aussi'

const FROM_PATH_MAP: Record<'fin' | 'mon-espace' | 'index', string> = {
  fin: END_PAGE_ACTIONS_PATH,
  'mon-espace': MON_ESPACE_ACTIONS_PATH,
  index: ACTIONS_PATH,
}

type Props = DefaultPageProps<{
  params: { themeSlug: string; actionSlug: string }
  searchParams: { from?: 'fin' | 'mon-espace' | 'index' }
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { params } = props
  const { locale, actionSlug } = await params

  const user = await getUserSession()
  const { t } = await getServerTranslation({ locale })
  const [action, alternateLocales] = await Promise.all([
    getPersonalizedActionDetails(actionSlug, locale, user?.id),
    getActionAlternateLocales(actionSlug),
  ])

  if (!action) {
    return getMetadataObject({
      locale,
      title: t('actions.detailPage.404.title'),
      description: t('actions.detailPage.404.description'),
      robots: noIndexObject,
    })
  }

  const languages: Partial<Record<Locale, string>> = {}
  for (const [loc, alternate] of Object.entries(alternateLocales)) {
    languages[loc as Locale] = ACTION_DETAIL_PATH(
      alternate.themeSlug,
      alternate.actionSlug
    )
  }

  return getMetadataObject({
    locale,
    title: action.metadata.title ?? action.title,
    description: action.metadata.description ?? action.longDescription,
    alternates: {
      canonical: ACTION_DETAIL_PATH(action.theme.slug, actionSlug),
      languages,
    },
  })
}

export default async function ActionPage({ params, searchParams }: Props) {
  const { locale, themeSlug, actionSlug } = await params
  const resolvedSearchParams = await searchParams
  const from = resolvedSearchParams?.from
  const user = await getUserSession()
  const [action, alternateLocales] = await Promise.all([
    getPersonalizedActionDetails(actionSlug, locale, user?.id),
    getActionAlternateLocales(actionSlug),
  ])

  if (!action) {
    // The slug may belong to another locale (e.g. a shared URL with the wrong
    // language prefix): redirect to the localized path when a translation
    // exists for the page locale
    const alternate = alternateLocales[locale]

    if (alternate) {
      const search = toSearchParams(resolvedSearchParams).toString()

      redirect(
        getLocalizedPath(
          locale,
          `${ACTION_DETAIL_PATH(alternate.themeSlug, alternate.actionSlug)}${search ? `?${search}` : ''}`
        )
      )
    }

    notFound()
  }

  if (action.theme.slug !== themeSlug) notFound()

  const themeClasses = classNames[action.theme.key]

  return (
    <div className="pt-2">
      <BetaBanner locale={locale} />
      <ActionTracker eventName="consulted" action={action} />
      <GoBackLink
        href={
          from && from in FROM_PATH_MAP
            ? FROM_PATH_MAP[from]
            : FROM_PATH_MAP.index
        }
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
        {action.assessment?.impact ? (
          <div className="mt-4 flex items-start">
            <div
              className={`rounded-xl border px-5 py-2 ${themeClasses.impactBorder}`}>
              <p
                className={`mb-0 text-sm/normal font-bold ${themeClasses.impactColor}`}>
                <Trans
                  locale={locale}
                  i18nKey="actions.detailPage.impact.title">
                  Réduction max sur votre empreinte
                </Trans>
              </p>
              <p className="text-sm/normal font-bold text-slate-600">
                <Impact
                  impact={action.assessment.impact}
                  locale={locale}
                  themeKey={action.theme.key}
                />
              </p>
            </div>
          </div>
        ) : null}
      </header>

      <div className="mb-10 grid gap-10 md:grid-cols-2 [&>*:last-child:nth-child(even)]:col-span-full">
        <Section
          id={SECTION_ID_I_UNDERSTAND}
          className="flex scroll-mt-24 flex-col gap-5 md:col-span-full md:flex-row">
          <div className={action.media ? 'flex-1/2' : ''}>
            <SectionTitle color="primary">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.understand">
                Je comprends l'enjeu
              </Trans>
            </SectionTitle>
            <Markdown
              forceTargetBlankOnExternalLinks
              omitMarginTopOnFirstElement>
              {action.longDescription}
            </Markdown>
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
            <SectionTitle color="yellow">
              <Trans locale={locale} i18nKey="actions.detailPage.sections.act">
                J'agis
              </Trans>
            </SectionTitle>
            <Markdown
              forceTargetBlankOnExternalLinks
              omitMarginTopOnFirstElement>
              {action.tips}
            </Markdown>
          </Section>
        ) : null}
        {action.financialIncentives ? (
          <Section id={SECTION_ID_I_BENEFIT} className="scroll-mt-24">
            <SectionTitle color="green">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.incentives">
                J'y gagne
              </Trans>
            </SectionTitle>
            <Markdown
              forceTargetBlankOnExternalLinks
              omitMarginTopOnFirstElement>
              {action.financialIncentives}
            </Markdown>
          </Section>
        ) : null}
        {action.furtherExplore ? (
          <Section id={SECTION_ID_FURTHER_READING} className="scroll-mt-24">
            <SectionTitle color="blue">
              <Trans
                locale={locale}
                i18nKey="actions.detailPage.sections.furtherReading">
                À découvrir aussi
              </Trans>
            </SectionTitle>
            <Markdown
              forceTargetBlankOnExternalLinks
              omitMarginTopOnFirstElement>
              {action.furtherExplore}
            </Markdown>
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

function Impact({
  impact,
  locale,
  themeKey,
}: {
  impact: number
  locale: Locale
  themeKey: Theme['key']
}) {
  const { formattedValue, unit } = formatFootprint(-1 * Math.max(impact, 100), {
    locale,
    metric: 'carbone',
    unit: 't',
  })

  const text = (
    <Trans
      locale={locale}
      i18nKey="actions.detailPage.impact.value"
      values={{
        formattedValue,
        unit,
      }}>
      <span
        className={`mr-1 text-[40px]/normal font-extrabold ${classNames[themeKey].impactColor}`}>
        {'{{formattedValue}}'}
      </span>{' '}
      {'{{unit}}'} CO<sub>2</sub>e / an
    </Trans>
  )

  if (impact < 100) {
    // Need to have "<" outside otherwise i18next keeps escaping it
    return (
      <>
        <span
          className={`text-[40px]/normal font-extrabold ${classNames[themeKey].impactColor}`}>
          {'< '}
        </span>
        {text}
      </>
    )
  }

  return text
}
