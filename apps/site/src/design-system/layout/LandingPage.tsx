import HeaderServer from '@/components/layout/HeaderServer'
import type { LanguageSwitchParams } from '@/helpers/language/getShouldBeLocalised'
import type { ReactNode } from 'react'
import Main from './Main'
import DynamicCounter from './landingPage/DynamicCounter'
import Hero from './landingPage/Hero'

interface Props {
  heroTitle: ReactNode
  heroDescription: ReactNode
  heroIllustration: ReactNode
  heroPartners: ReactNode
  children: ReactNode
  locale: string
  languageSwitchParams?: LanguageSwitchParams
}

export default function LandingPage({
  heroTitle,
  heroDescription,
  heroIllustration,
  heroPartners,
  children,
  locale,
  languageSwitchParams = {},
}: Props) {
  return (
    <>
      <HeaderServer locale={locale} params={languageSwitchParams} />

      <Main>
        <Hero
          illustration={heroIllustration}
          title={heroTitle}
          description={heroDescription}
          partners={heroPartners}
        />

        <DynamicCounter locale={locale} />

        {children}
      </Main>
    </>
  )
}
