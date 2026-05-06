import Emoji from '@/design-system/utils/Emoji'
import Markdown from '@/design-system/utils/Markdown'
import type { Locale } from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import { actions } from '@nosgestesclimat/core/features/actions/data/actions/index'
import {
  ImpactCO2LanguageSchema,
  type ActionMedia as ActionMediaType,
  type ImpactCO2Language,
} from '@nosgestesclimat/core/features/actions/types/action-media'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

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
        <Section variant="highlighted">
          <SectionTitle>Je comprends l'enjeu</SectionTitle>
          <Markdown>{action.longDescription}</Markdown>
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

type SectionVariant = 'default' | 'highlighted'

interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {
  variant?: SectionVariant
}

function Section({
  variant = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={twMerge(
        'rounded-[20px] border border-slate-200 p-10',
        sectionClassNamesByVariant[variant],
        className
      )}
      {...props}>
      {children}
    </section>
  )
}

const sectionClassNamesByVariant: Record<SectionVariant, string> = {
  default: 'bg-white',
  highlighted: 'bg-slate-50',
}

type SectionTitleProps = React.ComponentPropsWithoutRef<'h2'>

function SectionTitle({ className, children, ...props }: SectionTitleProps) {
  return (
    <h2
      className={twMerge('mb-5 text-lg leading-6.75 font-bold', className)}
      {...props}>
      {/* TODO: emoji */}
      {children}
    </h2>
  )
}

interface MediaProps {
  media: ActionMediaType
  locale: Locale
}

function ActionMedia({ media, locale }: MediaProps) {
  const impactCO2Language = getImpactCO2Language(locale)

  // TODO: media title
  switch (media.type) {
    case 'impact_co2':
      return (
        <div>TODO: {impactCO2Language}</div>
      )
    case 'image':
      return (
        <Image
          src={media.src}
          alt={media.alt}
          width={100}
          height={100}
          className="w-full rounded-lg"
        />
      )
    default:
      media satisfies never
      return null
  }
}

function getImpactCO2Language(locale: Locale): ImpactCO2Language {
  const result = ImpactCO2LanguageSchema.safeParse(locale)
  return result.success ? result.data : 'en'
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
