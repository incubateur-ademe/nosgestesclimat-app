import Trans from '@/components/translation/trans/TransServer'
import Switch from '@/design-system/inputs/Switch'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'

interface Props {
  locale: Locale
  currentPage: 'carbone' | 'eau'
  basePathname: string
}

export default async function FootprintsLinks({
  locale,
  currentPage,
  basePathname,
}: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <Switch
      className="mb-12 inline text-center md:text-right"
      aria-label={t(
        'results.footprintsLinks.ariaLabel',
        "Sélecteur de type d'empreinte"
      )}
      options={[
        {
          label: (
            <span className="whitespace-nowrap">
              <Trans locale={locale} i18nKey="common.carbonFootprint">
                Empreinte carbone
              </Trans>
            </span>
          ),
          href: basePathname,
          'data-testid': 'carbon-footprint-link',
          isSelected: currentPage === 'carbone',
        },
        {
          'data-testid': 'water-footprint-link',
          label: (
            <span className="whitespace-nowrap">
              <Trans locale={locale} i18nKey="common.waterFootprint">
                Empreinte eau
              </Trans>
              &nbsp;
              <Emoji className="text-base">💧</Emoji>
            </span>
          ),
          href: `${basePathname}/eau`,
          isSelected: currentPage === 'eau',
        },
      ]}
    />
  )
}
