import ButtonLink from '@/design-system/buttons/ButtonLink'
import Main from '@/design-system/layout/Main'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'
import Wave from 'react-wavify'
import Trans from '../translation/trans/TransServer'
import HeaderServer from './HeaderServer'

export default async function Route404({ locale }: { locale: Locale }) {
  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <div className="relative h-svh" data-testid="404">
          <div className="absolute top-20 right-0 bottom-0 left-0 bg-[#1617C5] opacity-75 lg:top-20" />

          <div className="relative mt-20 flex flex-col items-center lg:mt-20">
            <div className="relative w-full bg-white">
              <h1 className="-mt-10 mb-2 flex items-center justify-center text-[10rem] font-black text-amber-400 md:-mt-20 md:text-[20rem]">
                <span className="island mt-20 leading-none">4</span>
                <span className="island relative leading-none">
                  <Image
                    className="hover:animate-jump absolute -top-8 right-0 left-0 m-auto w-10 motion-reduce:hover:animate-none md:top-3 md:w-12"
                    src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/404_bonhomme_17c7e762b9.svg"
                    width="60"
                    height="60"
                    alt={t('Un bonhomme se demandant où il est')}
                  />
                  0
                </span>
                <span className="island mt-20 leading-none">4</span>
              </h1>
              <Wave
                fill="#1617C5"
                className="pointer-events-none absolute right-0 bottom-0 left-0 h-full w-full opacity-75"
                options={{ height: 70, amplitude: 40, speed: 0.11, points: 3 }}
              />
            </div>
            <p className="relative text-center font-bold text-white sm:text-lg md:-mt-[14rem] md:text-2xl">
              <Trans locale={locale}>
                Rien à l'horizon ! <br className="md:hidden" />
                La page recherchée n'existe pas.
              </Trans>
            </p>
            <ButtonLink
              color="primary"
              href="/"
              className="text-primary-700! hover:text-primary-700 relative mt-8 justify-self-center border-2 border-white bg-white shadow-xs hover:bg-white">
              <Trans locale={locale}>Revenir à l'accueil</Trans>
            </ButtonLink>
          </div>
        </div>
      </Main>
    </>
  )
}
