import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import type { AppUser } from '@/helpers/server/dal/user'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { toPersonalizedActionDto } from '@/services/actions/actions.dto'
import { getThemes } from '@/services/actions/get-themes'
import { getFeatureFlag } from '@/services/feature-flags/getFeatureFlag'
import type { DefaultPageProps } from '@/types'
import { getPersonalizedActions } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions.service'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  // TODO: determine what to do when:
  // - the user has no simulation
  // - the user has simulations but no computation
  // - the user last simulation computation is not completed
  const [{ lastSimulationAssessmentStatus: _, actions }, themes] =
    await Promise.all([getPersonalizedActions(user.id), getThemes()])

  const actionsDto = actions.map(toPersonalizedActionDto)

  return (
    <ActionsPage
      topActions={actionsDto.slice(0, 3)}
      actions={actionsDto}
      themes={themes}
      locale={locale}
    />
  )
}

async function LegacyResultatsActionsPage({
  user,
  locale,
}: {
  user: AppUser
  locale: Locale
}) {
  const simulations = await getCompletedSimulations({ user }, { pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
