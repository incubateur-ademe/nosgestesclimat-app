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

const MiniCard = ({
  emoji,
  title,
  subtitle,
}: {
  emoji: string
  title: React.ReactNode
  subtitle: React.ReactNode
}) => {
  return (
    <Card
      tag="li"
      className="shadow-primary-100 col-span-1 max-w-full flex-col justify-center gap-1 rounded-2xl border-0 text-center text-sm shadow-lg drop-shadow-xs md:w-56 md:text-base">
      <Emoji className="text-3xl">{emoji}</Emoji>

      <p className="mb-0">
        <strong>{title}</strong>
      </p>

      <p>{subtitle}</p>
    </Card>
  )
}

// Version displayed for pupils and students
export default function YouthTutorial({ locale }: Props) {
  return (
    <div className="mb-16 flex flex-col">
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

        <p className="mb-6 text-center">
          <Trans locale={locale} i18nKey="youthTutorial.subtitle">
            Un test rapide pour comprendre ton empreinte carbone et agir !
          </Trans>
        </p>

        <ul className="flex w-full flex-wrap justify-center gap-4 md:flex-nowrap">
          <li className="w-auto">
            <div className="bg-primary-100 text-primary-900 rounded-xl px-4 py-2 font-medium whitespace-nowrap">
              <Emoji className="mr-1">⏱️</Emoji>

              <Trans locale={locale} i18nKey="youthTutorial.list.time">
                Rapide
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
        <MiniCard
          emoji={'🙋‍♀️'}
          title={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.forYou.title">
              Réponds pour toi
            </Trans>
          }
          subtitle={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.forYou.body">
              C'est ton empreinte, pas celle de ta famille
            </Trans>
          }
        />

        <MiniCard
          emoji={'🤷‍♂️'}
          title={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.dontKnow.title">
              Pas grave si tu sais pas
            </Trans>
          }
          subtitle={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.dontKnow.body">
              Choisis "je ne sais pas", on gère
            </Trans>
          }
        />

        <MiniCard
          emoji={'⚡️'}
          title={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.fast.title">
              Rapide et utile
            </Trans>
          }
          subtitle={
            <Trans locale={locale} i18nKey="youthTutorial.secondlist.fast.body">
              Quelques minutes pour tout comprendre
            </Trans>
          }
        />

        <MiniCard
          emoji={'🏆'}
          title={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.result.title">
              Résultat + actions
            </Trans>
          }
          subtitle={
            <Trans
              locale={locale}
              i18nKey="youthTutorial.secondlist.result.body">
              Ton score et des idées pour agir
            </Trans>
          }
        />
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

        <p id="subtitle-cta" className="mt-2 text-sm text-slate-700">
          <Trans locale={locale} i18nKey="youthTutorial.cta.helper">
            Ça prend seulement quelques minutes
          </Trans>{' '}
          <Emoji>⏱️</Emoji>
        </p>
      </div>
    </div>
  )
}
