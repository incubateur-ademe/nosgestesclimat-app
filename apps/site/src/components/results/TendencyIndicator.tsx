import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { Tendency } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import { cn } from 'cn'
import DownArrow from '../icons/DownArrow'
import Link from '../Link'
import Trans from '../translation/trans/TransServer'

export default function TendencyIndicator({
  tendency,
}: {
  tendency: Tendency
}) {
  return (
    <div className="flex gap-1" data-testid="tendency-indicator">
      <DownArrow
        className={cn(
          tendency === 'increase'
            ? '-rotate-135 fill-red-700'
            : '-rotate-45 fill-green-700'
        )}
      />

      <div>
        <div className="font-bold">
          {tendency === 'increase' && (
            <Trans i18nKey="carbonResults.tendency.increase">
              <span className="block">En hausse depuis</span>
              <span className="block">votre dernier résultat</span>
            </Trans>
          )}

          {tendency === 'decrease' && (
            <Trans i18nKey="carbonResults.tendency.decrease">
              <span className="block">En baisse depuis</span>
              <span className="block">votre dernier résultat</span>
            </Trans>
          )}
        </div>

        <Link className="text-primary-600 underline" href={MON_ESPACE_PATH}>
          En savoir plus
        </Link>
      </div>
    </div>
  )
}
