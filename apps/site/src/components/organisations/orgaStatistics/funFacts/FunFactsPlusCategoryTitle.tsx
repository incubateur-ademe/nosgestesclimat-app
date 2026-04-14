import Title from '@/design-system/layout/Title'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export default function FunFactsPlusCategoryTitle({
  category,
}: {
  category: DottedName
}) {
  const { title } = useRule(category)
  return <Title tag="h3">{title}</Title>
}
