import MotivationSection from '@/components/landing-pages/MotivationSection'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import Image from 'next/image'

export default async function CollectivelyCommit({
  locale,
}: {
  locale: string
}) {
  await getServerTranslation({ locale })

  return (
    <MotivationSection
      title={
        <Trans locale={locale}>
          S’engager collectivement autour des enjeux du climat
        </Trans>
      }
      description={
        <div className="flex flex-col items-center gap-6">
          <p className="text-center text-sm md:text-lg">
            <Trans locale={locale}>
              Chez Nos Gestes Climat, nous croyons au pouvoir de{' '}
              <strong className="text-primary-600">l’action collective</strong>{' '}
              pour relever les défis environnementaux. Notre mission est de{' '}
              <strong className="text-primary-600">sensibiliser</strong> et
              d’accompagner chacun, citoyens, entreprises et collectivités, à
              mieux comprendre son empreinte écologique, carbone ou eau,{' '}
              <strong className="text-primary-600">
                identifier les gestes
              </strong>{' '}
              pour la réduire et{' '}
              <strong className="text-primary-600">
                entraîner leur entourage
              </strong>{' '}
              dans ce mouvement.
            </Trans>
          </p>
          <p className="text-secondary-700 text-center text-sm font-bold md:text-lg">
            <Trans locale={locale}>
              Accélérons l’impact collectif avec Nos Gestes Climat !
            </Trans>
          </p>

          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/engagement_collectif_pour_le_climat_4f8f1edfc1.svg"
            alt=""
            className="mb-10"
            width={600}
            height={600}
          />
        </div>
      }
    />
  )
}
