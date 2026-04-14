import Link from '@/components/Link'
import RegionGrid from '@/components/misc/RegionGrid'
import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import InlineLink from '@/design-system/inputs/InlineLink'
import Container from '@/design-system/layout/Container'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import type { DefaultPageProps } from '@/types'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import Image from 'next/image'

export const generateMetadata = getCommonMetadata({
  title: t('International - Nos Gestes Climat'),
  description: t(
    'Où que vous vivez, calculez votre empreinte carbone personnelle avec les particularités de votre pays.'
  ),
  alternates: {
    canonical: '/international',
  },
})

export default async function International({ params }: DefaultPageProps) {
  const { locale } = await params

  const { t } = await getServerTranslation({ locale })

  // TODO: add back full width somehow
  return (
    <>
      <Container maxWidth="3xl" className="pt-8 pb-12">
        <div className="flex items-start justify-between gap-4">
          <div className="text-center md:text-left">
            <Title
              title={t('Le calculateur d’empreinte climat international')}
            />

            <Image
              src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_international_illustration_b4030014c1.jpeg"
              alt=""
              className="mx-auto max-w-12 py-8 md:hidden"
              width="100"
              height="100"
            />

            <p className="mb-8">
              {t(
                'international.description',
                'Où que vous viviez, calculez votre empreinte carbone et eau personnelle en tenant compte des spécificités de votre pays.'
              )}
            </p>
            <div>
              <ButtonLink
                href={getLinkToSimulateur()}
                size="lg"
                className="px-20">
                <span>
                  <Trans locale={locale}>Faire le test</Trans>
                </span>
              </ButtonLink>
            </div>
          </div>

          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_international_illustration_b4030014c1.jpeg"
            alt=""
            aria-hidden="true"
            className="mx-auto hidden max-w-md p-8 md:block"
            width="300"
            height="300"
          />
        </div>
      </Container>
      <div className="rounded-xl bg-gray-100">
        <Container maxWidth="3xl" className="px-4 pt-8 pb-12">
          <h2>
            <Trans locale={locale} i18nKey="international.pourquoi.titre">
              Adapté à votre pays
            </Trans>
          </h2>
          <p>
            <Trans locale={locale} i18nKey="international.pourquoi.1">
              Les modes de vie varient fortement d’un pays à l’autre : réseau
              ferroviaire plus ou moins développé, dépendance au ferry ou à
              l’avion, organisation du transport, types de logements, etc.
            </Trans>
          </p>
          <p>
            <Trans locale={locale} i18nKey="international.pourquoi.2">
              Avec la transition énergétique, la place croissante de
              l’électricité rend le mix électrique particulièrement déterminant
              dans le calcul.
            </Trans>
          </p>
          <p>
            <Trans locale={locale} i18nKey="international.pourquoi.3">
              Lorsque c’est possible, nous utilisons les données de{' '}
              <Link
                className="inline-block"
                href="https://app.electricitymaps.com/map"
                target="_blank"
                aria-label={t(
                  'international.electricityMaps.ariaLabel',
                  "Visiter le site Electricity Maps (s'ouvre dans un nouvel onglet)"
                )}>
                <Image
                  alt="Electricity Maps"
                  src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/electricitymaps_4108b9d71a.svg"
                  className="ml-2 h-4"
                  width="100"
                  height="100"
                  aria-hidden="true"
                />
              </Link>{' '}
              pour intégrer l’empreinte carbone réelle de l’électricité du pays.
            </Trans>
             
          </p>
        </Container>
      </div>

      <Container maxWidth="3xl" className="pt-8 pb-12">
        <h2>
          <Trans locale={locale} i18nKey="international.comment.titre">
            Quels régions / pays sont disponibles ?
          </Trans>
        </h2>
        <p>
          <Trans locale={locale} i18nKey="international.comment.1">
            Pour chaque pays, nous ajoutons les données locales nécessaires afin
            de proposer un calcul adapté aux modes de vie et au mix énergétique
            du territoire.
          </Trans>
        </p>
        <p>
          <Trans locale={locale} i18nKey="international.comment.2">
            La liste ci-dessous présente les pays déjà intégrés.
          </Trans>
        </p>
        <p>
          <Trans locale={locale} i18nKey="international.comment.3">
            Nous l’enrichissons progressivement pour élargir la couverture
            internationale.
          </Trans>
        </p>
      </Container>

      <div className="rounded-xl bg-gray-100">
        <Container maxWidth="3xl" className="pt-8 pb-12">
          <div className="mx-auto my-0">
            <RegionGrid
              className="mx-auto"
              shouldShowButton={false}
              supportedRegions={supportedRegions}
            />
          </div>
        </Container>
      </div>

      <Container maxWidth="3xl" className="pt-8 pb-12">
        <h2>
          <Trans locale={locale} i18nKey="international.ensuite.titre">
            Vous ne trouvez pas votre pays ?
          </Trans>
        </h2>
        <p>
          <Trans locale={locale} i18nKey="international.ensuite.2">
            Nous ajoutons de nouveaux pays au fil du temps, avec le plus grand
            soin pour refléter leurs spécificités.
          </Trans>
        </p>
        <p>
          <Trans locale={locale} i18nKey="international.ensuite.1">
            Si le vôtre n’est pas encore dans la liste, dites-le-nous : nous
            serons ravis d’en tenir compte.{' '}
            <InlineLink href="/contact">Écrivez-nous !</InlineLink>
          </Trans>
        </p>
      </Container>
    </>
  )
}
