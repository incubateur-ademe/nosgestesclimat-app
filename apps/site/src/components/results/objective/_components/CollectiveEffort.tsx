import Trans from '@/components/translation/trans/TransServer'
import Badge from '@/design-system/layout/Badge'
import Card from '@/design-system/layout/Card'
import { cn } from 'cn'

interface Props {
  className?: string
}

export default function CollectiveEfforts({ className }: Props) {
  return (
    <div className={cn('mt-6', className)}>
      <Badge className="text-default border-none text-sm md:text-base">
        <Trans
          i18nKey="results.objective.collectiveEffort.title">
          Important : c'est aussi un effort collectif
        </Trans>
      </Badge>

      <Card className="mb-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article>
            <h3 className="mb-5">
              <Badge color="purple" border={false}>
                <Trans
                  i18nKey="results.objective.collectiveEffort.state">
                  L'État français
                </Trans>
              </Badge>
            </h3>
            <p>
              <Trans
                i18nKey="results.objective.collectiveEffort.stateDescription">
                Il peut accélérer la <strong>décarbonation</strong> de la
                société en <strong>votant des lois</strong> et des{' '}
                <strong>aides financières ciblées</strong>, ainsi qu'au travers
                de ses investissements.
              </Trans>
            </p>
          </article>

          <article>
            <h3 className="mb-5">
              <Badge color="yellow" border={false}>
                <Trans
                  i18nKey="results.objective.collectiveEffort.collectivities">
                  Les collectivités
                </Trans>
              </Badge>
            </h3>
            <p>
              <Trans
                i18nKey="results.objective.collectiveEffort.collectivitiesDescription">
                Par leurs choix d’aménagements du territoire, elles participent
                à{' '}
                <strong>l'adoption de nouvelles pratiques plus durables</strong>{' '}
                à l’échelle locale.
              </Trans>
            </p>
          </article>

          <article>
            <h3 className="mb-5">
              <Badge color="red" border={false}>
                <Trans
                  i18nKey="results.objective.collectiveEffort.companies">
                  Les entreprises
                </Trans>
              </Badge>
            </h3>
            <p>
              <Trans
                i18nKey="results.objective.collectiveEffort.companiesDescription">
                Sous l'impulsion de l'État et des citoyens, les entreprises
                travaillent à la{' '}
                <strong>
                  réduction progressive de l'empreinte des biens et services
                </strong>
                .
              </Trans>
            </p>
          </article>
        </div>
      </Card>
    </div>
  )
}
