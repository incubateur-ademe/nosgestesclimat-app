import type { SubcategoryDisplayData } from '@/helpers/getCategoriesDisplayData'
import type { Metric } from '@/publicodes-state/types'
import type { TFunction } from 'i18next'
import SubcategoryItem from './subcategoriesList/SubcategoryItem'

interface Props {
  subcategories: SubcategoryDisplayData[]
  bgBarClassName: string
  t: TFunction
  metric: Metric
}

export default function SubcategoriesList({
  subcategories,
  bgBarClassName,
  t,
  metric,
}: Props) {
  return (
    <ul>
      {subcategories.map((subcategory, index) => (
        <SubcategoryItem
          key={subcategory.dottedName}
          subcategory={subcategory}
          bgBarClassName={bgBarClassName}
          index={index}
          t={t}
          metric={metric}
        />
      ))}
    </ul>
  )
}
