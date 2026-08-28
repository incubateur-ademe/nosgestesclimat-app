import Trans from '@/components/translation/trans/TransServer'
import InlineLink from '@/design-system/inputs/InlineLink'
import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import { getUserSimulationProgress } from '@/services/simulations/get-user-simulation-progress'

/**
 * Server component: this page mounts no `UserProvider`, so the simulation has
 * to be resolved here rather than read from the client context.
 */
export default async function DoTheTest({ locale }: { locale: string }) {
  const { currentSimulation } = await getUserSimulationProgress()

  if (!currentSimulation?.progression) {
    return (
      <div>
        <Trans i18nKey="faq.doTheTest.notStarted" locale={locale}>
          Vous n'avez pas encore débuté votre test,{' '}
          <InlineLink href={getLinkToSimulateur()}>
            <strong>lancez-vous !</strong>
          </InlineLink>
        </Trans>
      </div>
    )
  }

  return (
    <div>
      <Trans i18nKey="faq.doTheTest.started" locale={locale}>
        Vous avez commencé votre test,{' '}
        <InlineLink href={getLinkToSimulateur()}>
          <strong>cliquez ici pour le reprendre !</strong>
        </InlineLink>
      </Trans>
    </div>
  )
}
