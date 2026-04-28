import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import type { DefaultPageProps } from '@/types'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const simulations = await getSimulations(
    { user },
    { completedOnly: true, pageSize: 1 }
  )

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
