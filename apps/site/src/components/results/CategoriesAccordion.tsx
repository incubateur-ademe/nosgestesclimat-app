import HorizontalBarChartItem from '@/components/charts/HorizontalBarChartItem'
import { carboneMetric } from '@/constants/model/metric'
import Card from '@/design-system/layout/Card'
import AccordionItem from '@/design-system/layout/accordion/AccordionItem'
import { getCategoriesDisplayData } from '@/helpers/getCategoriesDisplayData'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { ComputedResults, Metric } from '@/publicodes-state/types'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import SubcategoriesList from './categoriesAccordion/SubcategoriesList'
import AnimatedAccordionItem from './categoriesAccordion/_client/AnimatedAccordionItem'
import ServicesDescription from './categoriesAccordion/_client/ServicesDescription'

interface Props {
  rules: Partial<NGCRules>
  computedResults: ComputedResults
  metric?: Metric
  locale: Locale
}

// Makes the bars in the chart just the right width
const BEAUTIFUL_COEFFICIENT = 0.75

export default async function CategoriesAccordion({
  rules,
  computedResults,
  metric = carboneMetric,
  locale,
}: Props) {
  const { t } = await getServerTranslation({ locale })

  const categories = getCategoriesDisplayData({
    computedResults,
    rules,
    metric,
    locale,
    t,
  })

  return (
    <div className="flex flex-col gap-2">
      {categories.map((category, index) => (
        <AnimatedAccordionItem key={category.dottedName} index={index}>
          <AccordionItem
            title={
              <HorizontalBarChartItem
                percentageOfTotalValue={
                  category.percentage * BEAUTIFUL_COEFFICIENT
                }
                index={index}
                icon={category.icon}
                title={
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <strong className="text-left">{category.title}</strong>

                    <span className="whitespace-nowrap">
                      {category.formattedValue}&nbsp;
                      <span className={metric === 'eau' ? 'capitalize' : ''}>
                        {category.unit}
                      </span>
                      &nbsp;-&nbsp;
                      {category.displayPercentage}
                    </span>
                  </span>
                }
                bgBarClassName={category.bgBarClassName}
                bgIconClassName={category.bgIconClassName}
              />
            }
            name={category.title}
            ariaLabel={`${category.title} - ${category.formattedValue} ${category.unit}`}
            content={
              <Card
                className={`rounded-lg border border-slate-400 ${category.bgLightClassName}`}>
                {category.dottedName.startsWith('services') && (
                  <ServicesDescription />
                )}
                <SubcategoriesList
                  subcategories={category.subcategories}
                  bgBarClassName={category.bgBarClassName}
                  metric={metric}
                  t={t}
                />
              </Card>
            }
          />
        </AnimatedAccordionItem>
      ))}
    </div>
  )
}
