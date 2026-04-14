import Trans from '@/components/translation/trans/TransServer'
import InlineLink from '@/design-system/inputs/InlineLink'
import Emoji from '@/design-system/utils/Emoji'

import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import DomesticWaterBlock from './DomesticWaterBlock'

interface Props {
  locale: Locale
}

export default function WhatIsWaterFootprint({ locale }: Props) {
  return (
    <div className="mb-12 flex flex-col gap-8 md:flex-row">
      <section className="bg-primary-100 flex-1 rounded-2xl p-8">
        <Title hasSeparator={false} tag="h2" size="lg">
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.titleInsec">
            L'empreinte eau, c'est quoi&nbsp;?
          </Trans>
        </Title>
        <p>
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.description">
            L'empreinte eau, c'est{' '}
            <strong>l'ensemble de l'eau consommée</strong> pour{' '}
            <strong>produire</strong>
            et <strong>distribuer</strong> les biens et services de votre
            quotidien. Par exemple il faut de l'eau pour :
          </Trans>
        </p>
        <ul className="mb-4">
          <li className="mb-1 flex items-center gap-3">
            <Emoji className="text-3xl">🍅</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.fruitsAndVegetables">
                les <strong>fruits, légumes</strong> et{' '}
                <strong>céréales</strong> que vous mangez
              </Trans>
            </span>
          </li>
          <li className="mb-1 flex items-center gap-3">
            <Emoji className="text-3xl">👕</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.cotton">
                la culture du <strong>coton</strong> que vous portez
              </Trans>
            </span>
          </li>
          <li className="mb-1 flex items-center gap-3">
            <Emoji className="text-3xl">🐮</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.animals">
                l'alimentation des <strong>animaux</strong> que vous consommez
              </Trans>
            </span>
          </li>
          <li className="mb-1 flex items-center gap-3">
            <Emoji className="text-3xl">📱</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.digitalDevices">
                l'extraction des matériaux de vos{' '}
                <strong>appareils numériques</strong>
              </Trans>
            </span>
          </li>
          <li className="mb-1 flex items-center gap-3">
            <Emoji className="text-3xl">⚡️</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.electricity">
                la production de votre <strong>électricité</strong>
              </Trans>
            </span>
          </li>
          <li className="mb-1 flex items-start gap-3">
            <Emoji className="text-3xl">🚫</Emoji>
            <span className="flex-1">
              <Trans
                locale={locale}
                i18nKey="simulation.eau.whatIsWaterFootprint.list.domesticWater">
                <strong>attention</strong> : l'eau domestique (par exemple l'eau
                de vos douches) ne fait pas partie de l'empreinte eau
              </Trans>
            </span>
          </li>
        </ul>
      </section>

      <section className="bg-secondary-100 flex-1 rounded-2xl p-8">
        <Title tag="h2" size="lg" hasSeparator={false}>
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.showerWater.title">
            Et l'eau de ma douche dans tout ça ?
          </Trans>
        </Title>
        <p>
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.showerWater.description1">
            L’eau domestique, à savoir, celle qui sort de vos robinets n'est pas
            comprise dans votre empreinte eau, puisqu’elle est restituée. Par
            exemple, l’eau de votre douche, après dépollution, est rendue aux
            cours d’eau de votre territoire.
          </Trans>
        </p>

        <DomesticWaterBlock locale={locale} />

        <p>
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.showerWater.description2">
            L’eau domestique peut avoir <strong>un impact très fort</strong>{' '}
            selon la <strong>saison</strong> et la <strong>localisation</strong>
            .
          </Trans>
        </p>

        <div>
          <InlineLink href="https://vigieau.gouv.fr/">
            <Trans
              locale={locale}
              i18nKey="simulation.eau.whatIsWaterFootprint.vigieEau">
              Rendez-vous sur VigiEau pour en savoir plus.
            </Trans>
          </InlineLink>
        </div>
      </section>
    </div>
  )
}
