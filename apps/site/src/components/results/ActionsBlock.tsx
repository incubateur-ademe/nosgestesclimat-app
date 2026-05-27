import { END_PAGE_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import CarIcon from '../icons/CarIcon'
import DownArrow from '../icons/DownArrow'
import FoodIcon from '../icons/FoodIcon'
import HousingIcon from '../icons/HousingIcon'
import Trans from '../translation/trans/TransServer'

const ACTIONS_HREF = `${END_PAGE_PATH}/actions` as const

interface Props {
  locale: Locale
}

export default async function ActionsBlock({ locale }: Props) {
  const { t } = await getServerTranslation({ locale })
  return (
    <Card className="group/card focus-within:ring-primary-700 relative mb-20 shadow-md transition-all duration-200 ease-out focus-within:ring-2 focus-within:ring-offset-3 focus-within:outline-hidden hover:scale-[1.02] hover:shadow-xl">
      <div className="flex flex-col items-stretch gap-10 md:flex-row md:gap-4">
        <div className="w-full max-w-full sm:w-md">
          <Title
            tag="h2"
            size="md"
            hasSeparator={false}
            className="text-secondary-700 mb-0 font-medium">
            <Trans locale={locale} i18nKey="results.actions.title">
              Votre plan d'action
            </Trans>
          </Title>

          <Title tag="h3" size="lg" hasSeparator={false} className="mb-8">
            <Trans locale={locale} i18nKey="results.actions.subtitle">
              Découvrez des gestes concrets pour y arriver
            </Trans>
          </Title>

          <p className="mb-8">
            <Trans locale={locale} i18nKey="results.actions.text">
              Nous avons préparé des <strong>actions personnalisées</strong>{' '}
              pour vous aider à aller plus loin
            </Trans>
          </p>

          <span
            className={twMerge(
              baseClassNames,
              colorClassNames.primary,
              sizeClassNames.md,
              'group-hover/card:animate-button-lift pointer-events-none w-full text-base transition-[transform,box-shadow] duration-200 ease-out sm:w-auto'
            )}>
            <Trans locale={locale} i18nKey="results.actions.linkLabel">
              Découvrir mes actions
            </Trans>
            <DownArrow className="ml-2 w-6 -rotate-90" />
          </span>
        </div>

        <div className="mb relative flex h-full min-h-44 flex-1 items-center self-stretch md:min-h-64 md:translate-y-12">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out group-hover/card:left-[48%] motion-reduce:group-hover/card:left-1/2 md:left-2/5 md:group-hover/card:left-[45%] motion-reduce:group-hover/card:md:left-2/5">
            <div className="animate-float-leaf-1 inline-flex items-center gap-2 rounded-lg border border-blue-800 bg-blue-50 px-4 py-2 text-lg font-bold text-blue-800">
              <span className="rounded-sm bg-blue-100 p-1">
                <CarIcon />
              </span>

              <Trans locale={locale} i18nKey="common.transport">
                Transport
              </Trans>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-2 left-3/7 -translate-x-1/2 transition-all duration-500 ease-out group-hover/card:bottom-0 group-hover/card:left-[40%] motion-reduce:group-hover/card:bottom-2 motion-reduce:group-hover/card:left-3/7 md:top-4/7 md:bottom-auto md:left-2/7 md:group-hover/card:top-[45%] md:group-hover/card:left-[25%] motion-reduce:group-hover/card:md:top-4/7 motion-reduce:group-hover/card:md:left-2/7 lg:top-2/6 lg:group-hover/card:top-[35%] motion-reduce:group-hover/card:lg:top-2/6">
            <div className="animate-float-leaf-2 inline-flex items-center gap-2 rounded-lg border border-orange-800 bg-orange-50 px-4 py-2 text-lg font-bold text-orange-800">
              <span className="rounded-sm bg-orange-100 p-1">
                <FoodIcon />
              </span>

              <Trans i18nKey="common.alimentation" locale={locale}>
                Alimentation
              </Trans>
            </div>
          </div>

          <div className="pointer-events-none absolute top-1/3 left-6/9 -translate-x-1/2 transition-all duration-500 ease-out group-hover/card:left-[74%] motion-reduce:group-hover/card:left-6/9 md:group-hover/card:left-[70%] motion-reduce:group-hover/card:md:left-6/9">
            <div className="animate-float-leaf-3 inline-flex items-center gap-2 rounded-lg border border-green-800 bg-green-50 px-4 py-2 text-lg font-bold text-green-800">
              <span className="rounded-sm bg-green-100 p-1">
                <HousingIcon />
              </span>

              <Trans i18nKey="common.housing" locale={locale}>
                Logement
              </Trans>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={ACTIONS_HREF}
        className="absolute inset-0 z-10 focus:outline-hidden"
        aria-label={t(
          'results.actions.afterLink.label',
          'Découvrir mes actions personnalisées'
        )}
      />
    </Card>
  )
}
