import Title from '@/design-system/layout/Title'
import { useIsClient } from '@/hooks/useIsClient'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export default function FunFactsPlusCategoryTitle({
  category,
}: {
  category: DottedName
}) {
  const { title } = useRule(category)

  // The engine only exists on the client (see `useEngine`): the title it holds
  // would be missing from the server's render, and React would regenerate the
  // tree. Waiting for the mount keeps both renders identical.
  const isClient = useIsClient()

  if (!isClient) {
    return null
  }

  return <Title tag="h3">{title}</Title>
}
