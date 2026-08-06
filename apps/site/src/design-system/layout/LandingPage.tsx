import Header from '@/components/layout/Header'
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
}

export default function LandingPage({
  heroTitle,
  heroDescription,
  heroIllustration,
  heroPartners,
  children,
  locale,
}: Props) {
  return (
    <>
      <Header locale={locale} />

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
