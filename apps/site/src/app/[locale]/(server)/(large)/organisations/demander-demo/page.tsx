import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'

/* global PageProps */

export default async function DemanderDemoPage({
  params,
}: PageProps<'/[locale]/organisations/demander-demo'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <OrganisationFilAriane
        t={t}
        currentPage={{
          label: t('Demander une démo'),
          href: `/organisations/demander-demo`,
        }}
      />
      <section className="w-full bg-[#fff]">
        <div className="mx-auto max-w-5xl py-10">
          <Title
            title={
              <Trans i18nKey="organisations.demanderDemo.title" locale={locale}>
                Demander une démo
              </Trans>
            }
            subtitle={
              <Trans
                i18nKey="organisations.demanderDemo.subtitle"
                locale={locale}>
                Réservez un créneau pour assister à une démonstration de notre
                fonctionnalité dédiée aux organisations (entreprises,
                associations, écoles…) et vous permettre de diffuser le test de
                Nos Gestes Climat à votre audience.
              </Trans>
            }
          />
          <div className="w-full max-w-full overflow-visible">
            <iframe
              loading="lazy"
              title={t(
                'organisations.askDemo.iframe.title',
                'Formulaire - prendre rendez-vous pour une démo de nos fonctionnalités pour les organisations'
              )}
              width="110%"
              height="1000px"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="mt-8 -ml-[5%] rounded-lg sm:h-[600px]"
              src="https://rdv.incubateur.ademe.fr/team/nos-gestes-climat/demo?overlayCalendar=true&month=2026-04&theme=light"
            />
          </div>
        </div>
      </section>
    </>
  )
}
