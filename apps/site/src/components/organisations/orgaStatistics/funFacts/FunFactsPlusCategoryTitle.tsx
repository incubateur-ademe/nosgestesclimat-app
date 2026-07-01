import Title from '@/design-system/layout/Title'
import { getCategoryTitle } from '@/helpers/formatters/getCategoryTitle'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export default function FunFactsPlusCategoryTitle({
  category,
}: {
  category: DottedName
}) {
  const { t } = useClientTranslation()
  const { title } = useRule(category)

  return (
    <Title tag="h3">
      {getCategoryTitle({
        ruleTitle: title ?? '',
        dottedName: category,
        t,
      })}
    </Title>
  )
}
