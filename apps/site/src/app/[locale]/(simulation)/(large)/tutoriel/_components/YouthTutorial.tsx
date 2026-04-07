import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

interface Props {
  locale: Locale
}

// Version displayed for pupils and students
export default function YouthTutorial({ locale }: Props) {
  return (
    <div className="flex flex-col">
      <section className="order-0 mt-8 mb-8 w-xl max-w-full md:mx-auto md:mb-10">
        <div className="mb-2 flex items-center md:gap-4">
          <Title hasSeparator={false} size="lg">
            <Trans locale={locale} i18nKey="youthTutorial.title">
              Découvre ton impact{' '}
              <span className="text-primary-600">sur la planète</span>
            </Trans>
          </Title>

          <div className="-mt-4 max-w-36 md:min-w-48">
            <Image
              src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/girl_holding_earth_3373a344b0.svg"
              width="180"
              height="150"
              alt=""
            />
          </div>
        </div>

        <p className="mb-6 text-center md:text-left">
          <Trans locale={locale} i18nKey="youthTutorial.subtitle">
            Un test rapide pour comprendre ton empreinte carbone et agir !
          </Trans>
        </p>

        <ul className="flex w-full flex-wrap justify-center gap-4 md:flex-nowrap">
          <li className="w-auto">
            <div className="bg-primary-100 text-primary-900 rounded-xl px-4 py-2 font-medium whitespace-nowrap">
              <Emoji className="mr-1">⏱️</Emoji>

              <Trans locale={locale} i18nKey="youthTutorial.list.time">
                5 minutes
              </Trans>
            </div>
          </li>

          <li className="w-auto">
            <div className="bg-primary-100 text-primary-900 rounded-xl px-4 py-2 font-medium whitespace-nowrap">
              <Emoji className="mr-1">🎯</Emoji>

              <Trans locale={locale} i18nKey="youthTutorial.list.custom">
                Résultat perso
              </Trans>
            </div>
          </li>

          <li className="w-auto">
            <div className="bg-primary-100 text-primary-900 rounded-xl px-4 py-2 font-medium whitespace-nowrap">
              <Emoji className="mr-1">💡</Emoji>

              <Trans locale={locale} i18nKey="youthTutorial.list.advice">
                Conseils concrets
              </Trans>
            </div>
          </li>
        </ul>
      </section>

      <ul className="order-1 mb-12 grid grid-cols-2 gap-2 md:order-0 md:flex md:gap-8">
        <Card className="shadow-primary-100 col-span-1 max-w-full flex-col justify-center rounded-2xl border-0 text-center text-sm shadow-lg drop-shadow-xs md:w-56 md:text-base">
          <Emoji className="text-3xl">🙋‍♀️</Emoji>

          <p>
            <strong>
              <Trans
                locale={locale}
                i18nKey="youthTutorial.secondlist.forYou.title">
                Réponds pour toi
              </Trans>
            </strong>
          </p>

          <p>
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.forYou.body">
              C'est ton empreinte, pas celle de ta famille
            </Trans>
          </p>
        </Card>

        <Card className="shadow-primary-100 col-span-1 max-w-full flex-col justify-center rounded-2xl border-0 text-center text-sm shadow-lg drop-shadow-xs md:w-56 md:text-base">
          <Emoji className="text-3xl">🤷‍♂️</Emoji>

          <p>
            <strong>
              <Trans
                locale={locale}
                i18nKey="youthTutorial.secondlist.dontKnow.title">
                Pas grave si tu sais pas
              </Trans>
            </strong>
          </p>

          <p>
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.dontKnow.body">
              Choisi "je ne sais pas", on gère
            </Trans>
          </p>
        </Card>

        <Card className="shadow-primary-100 col-span-1 max-w-full flex-col justify-center rounded-2xl border-0 text-center text-sm shadow-lg drop-shadow-xs md:w-56 md:text-base">
          <Emoji className="text-3xl">⚡️</Emoji>

          <p>
            <strong>
              <Trans
                locale={locale}
                i18nKey="youthTutorial.secondlist.fast.title">
                Rapide et utile
              </Trans>
            </strong>
          </p>

          <p>
            <Trans locale={locale} i18nKey="youthTutorial.secondlist.fast.body">
              5 minutes pour tout comprendre
            </Trans>
          </p>
        </Card>

        <Card className="shadow-primary-100 col-span-1 max-w-full flex-col justify-center rounded-2xl border-0 text-center text-sm shadow-lg drop-shadow-xs md:w-56 md:text-base">
          <Emoji className="text-3xl">🏆</Emoji>

          <p>
            <strong>
              <Trans
                locale={locale}
                i18nKey="youthTutorial.secondlist.result.title">
                Résultat + actions
              </Trans>
            </strong>
          </p>

          <p>
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.result.body">
              Ton score et des idées pour agir
            </Trans>
          </p>
        </Card>
      </ul>

      <div className="order-0 mb-8 text-center md:mb-0">
        <ButtonLink
          size="lg"
          aria-describedby="subtitle-cta"
          href={SIMULATOR_PATH}>
          <Trans locale={locale} i18nKey="youthTutorial.cta.label">
            Allez, c'est parti
          </Trans>
        </ButtonLink>
        <p id="subtitle-cta" className="mt-1 text-sm text-slate-700">
          Ça prend seulement 5 minutes <Emoji>⏱️</Emoji>
        </p>
      </div>
    </div>
  )
}
