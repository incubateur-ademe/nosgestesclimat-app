import DefaultErrorAlert from '@/components/error/DefaultErrorAlert'
import Background from '@/components/landing-pages/Background'
import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { fetchPartners } from '@/services/cms/fetchPartners'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

export default async function TheySpeakAboutUs({
  locale,
  className,
  ctaHref = '/nos-relais',
}: {
  locale: string
  className?: string
  ctaHref?: string
}) {
  const { data: partners, isError } = await fetchPartners({
    displayOnLandingPage: true,
  })

  return (
    <div
      className={twMerge(
        'relative mb-10 px-4 py-16 md:mb-20 md:py-28 xl:mb-32',
        className
      )}>
      {/* Helps cover the triangles of white shown because of the perspective change in Background */}
      {/* <div className="bg-heroLightBackground absolute top-0 left-0 h-1/2 w-[200%]" /> */}

      {/* Add the background along with the tilted colorline */}
      <Background
        className="bg-heroLightBackground"
        withColorLine
        direction="left"
      />

      {isError && <DefaultErrorAlert />}

      {partners && !isError && (
        <div className="relative flex flex-col items-center gap-10 md:mx-auto md:max-w-5xl">
          <p className="text-center text-xl md:text-2xl">
            <Trans locale={locale}>
              Plusieurs milliers d’organisations nous font confiance pour
              sensibiliser efficacement
            </Trans>
          </p>

          <ul className="flex w-full flex-row flex-wrap items-center justify-center gap-7 md:justify-between">
            {partners.map((partner) => (
              <li key={partner.name} data-testid="partner-theyspeakaboutus">
                <Image
                  src={partner.imageSrc}
                  alt={partner.name}
                  className="h-auto w-20 md:w-24"
                  width={150}
                  height={150}
                />
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <ButtonLink color="secondary" size="xl" href={ctaHref}>
              <Trans locale={locale}>Rejoignez-les</Trans>
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  )
}
