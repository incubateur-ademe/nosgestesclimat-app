import Trans from '@/components/translation/trans/TransServer'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'

interface ReuseSimulationForPollProps {
  reuseSimulation: () => void
  createNewSimulation: () => void
  locale: string
  disclaimer: React.ReactNode
}
export default function ReuseSimulationForPoll({
  reuseSimulation,
  createNewSimulation,
  locale,
  disclaimer,
}: ReuseSimulationForPollProps) {
  return (
    <Card className={'items-start border-none bg-gray-100 p-8'}>
      <Title
        data-testid="commencer-title"
        className="text-lg md:text-xl"
        title={
          <span className="flex items-center">
            <Trans locale={locale}>
              Vous avez déjà réalisé le test Nos Gestes Climat !
            </Trans>{' '}
            <Emoji className="ml-1">👏</Emoji>
          </span>
        }
      />

      <p className="mb-8">
        <Trans locale={locale}>
          Vous pouvez utiliser vos données existantes, ou recommencer le test.
        </Trans>
      </p>

      <div className="flex flex-col items-start gap-6" data-track>
        <Button onClick={reuseSimulation}>
          <Trans locale={locale}>Utiliser mes données existantes</Trans>
        </Button>

        <Button color="secondary" onClick={createNewSimulation}>
          <Trans locale={locale}>Commencer un nouveau test</Trans>
        </Button>
      </div>
      <div className="mt-8">{disclaimer}</div>
    </Card>
  )
}
