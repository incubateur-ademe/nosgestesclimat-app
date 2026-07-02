import CategoriesAccordion from '@/components/results/CategoriesAccordion'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getRules } from '@/helpers/modelFetching/getRules'
import type { Locale } from '@/i18nConfig'
import type { ComputedResults, Metric } from '@/publicodes-state/types'
import Image from 'next/image'

interface Props {
  locale: Locale
  computedResults: ComputedResults
  metric: Metric
}

export default async function FootprintDetail({
  locale,
  computedResults,
  metric,
}: Props) {
  const rules = await getRules({ locale })
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex flex-col gap-12 md:flex-row md:justify-between">
        <div className="md:w-xl">
          <Title tag="h2" hasSeparator={false} size="md" className="mb-6">
            <Trans locale={locale} i18nKey="results.where.title">
              D’où vient votre résultat ?
            </Trans>
          </Title>

          <CategoriesAccordion
            locale={locale}
            rules={rules}
            computedResults={computedResults}
            metric={metric}
          />
        </div>

        <div className="hidden w-auto md:block">
          <Image
            width="300"
            height="300"
            className="mx-auto w-48 md:w-72"
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/empreinte_carbone_achats_be9fd99289.svg"
            alt=""
          />
        </div>
      </div>
    </section>
  )
}
