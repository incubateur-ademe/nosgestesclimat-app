import { testOrderedCategories } from '@/constants/model/categories'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import CategoryResult from './categoriesResultList/CategoryResult'

export default function CategoriesResultList({ metric }: { metric: Metrics }) {
  return (
    <div className="flex flex-col pb-2">
      {testOrderedCategories.map((category) => (
        <CategoryResult key={category} category={category} metric={metric} />
      ))}
    </div>
  )
}
