import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'

export default async function DemanderDemoPage() {
  const { t } = await getServerTranslation()

  return (
    <>
      <OrganisationFilAriane
        t={t}
        currentPage={{
          label: t('Demander une démo'),
          href: `/organisations/demander-demo`,
        }}
      />
      <section className="w-full bg-white">
        <div className="mx-auto max-w-5xl py-10">
          <Title className="mb-2">
            <Trans i18nKey="organisations.demanderDemo.title">
              Demander une démo
            </Trans>
          </Title>
          <p className="text-slate-500">
            <Trans i18nKey="organisations.demanderDemo.subtitle">
              Réservez un créneau pour assister à une démonstration de notre
              fonctionnalité dédiée aux organisations (entreprises,
              associations, écoles…) et vous permettre de diffuser le test de
              Nos Gestes Climat à votre audience.
            </Trans>
          </p>
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
              className="mt-8 -ml-[5%] rounded-lg sm:h-150"
              src="https://rdv.incubateur.ademe.fr/team/nos-gestes-climat/demo?overlayCalendar=true&theme=light"
            />
          </div>
        </div>
      </section>
    </>
  )
}
