import { END_PAGE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import CarIcon from '../icons/CarIcon'
import DownArrow from '../icons/DownArrow'
import FoodIcon from '../icons/FoodIcon'
import HousingIcon from '../icons/HousingIcon'
import Trans from '../translation/trans/TransServer'

interface Props {
  locale: Locale
}

export default function ActionsBlock({ locale }: Props) {
  return (
    <Card className="mb-20">
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

          <ButtonLink
            href={`${END_PAGE_PATH}/actions`}
            className="hover:animate-button-lift w-full text-base transition-[transform,box-shadow] duration-200 ease-out sm:w-auto">
            <Trans locale={locale} i18nKey="results.actions.linkLabel">
              Découvrir mes actions
            </Trans>
            <DownArrow className="ml-2 w-6 -rotate-90" />
          </ButtonLink>
        </div>

        <div className="group mb relative flex h-full min-h-44 flex-1 items-center self-stretch md:min-h-64 md:translate-y-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out group-hover:left-[48%] motion-reduce:group-hover:left-1/2 md:left-2/5 md:group-hover:left-[45%] motion-reduce:group-hover:md:left-2/5">
            <div className="animate-float-leaf-1 inline-flex items-center gap-2 rounded-lg border border-blue-800 bg-blue-50 px-4 py-2 text-lg font-bold text-blue-800">
              <span className="rounded-sm bg-blue-100 p-1">
                <CarIcon />
              </span>

              <Trans locale={locale} i18nKey="common.transport">
                Transport
              </Trans>
            </div>
          </div>

          <div className="absolute bottom-2 left-3/7 -translate-x-1/2 transition-all duration-500 ease-out group-hover:bottom-0 group-hover:left-[40%] motion-reduce:group-hover:bottom-2 motion-reduce:group-hover:left-3/7 md:top-4/7 md:bottom-auto md:left-2/7 md:group-hover:top-[45%] md:group-hover:left-[25%] motion-reduce:group-hover:md:top-4/7 motion-reduce:group-hover:md:left-2/7 lg:top-2/6 lg:group-hover:top-[35%] motion-reduce:group-hover:lg:top-2/6">
            <div className="animate-float-leaf-2 inline-flex items-center gap-2 rounded-lg border border-orange-800 bg-orange-50 px-4 py-2 text-lg font-bold text-orange-800">
              <span className="rounded-sm bg-orange-100 p-1">
                <FoodIcon />
              </span>

              <Trans i18nKey="common.alimentation" locale={locale}>
                Alimentation
              </Trans>
            </div>
          </div>

          <div className="absolute top-1/3 left-6/9 -translate-x-1/2 transition-all duration-500 ease-out group-hover:left-[74%] motion-reduce:group-hover:left-6/9 md:group-hover:left-[70%] motion-reduce:group-hover:md:left-6/9">
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
    </Card>
  )
}
