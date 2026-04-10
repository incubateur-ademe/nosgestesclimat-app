import Trans from '@/components/translation/trans/TransClient'
import { orderedCategories } from '@/constants/model/orderedCategories'
import { captureClickCategorySelector } from '@/constants/tracking/posthogTrackers'
import { clickCategorySelector } from '@/constants/tracking/user-account'
import Tabs, { type TabItem } from '@/design-system/layout/Tabs'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'

type TabId = 'global' | DottedName

interface Props {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  categoryLabels: Partial<Record<DottedName, string>>
  disabled?: boolean
}

export default function CategorySelector({
  activeTab,
  setActiveTab,
  categoryLabels,
  disabled = false,
}: Props) {
  const globalTabId = 'global'
  const tabsItems: TabItem[] = [
    {
      id: globalTabId,
      label: (
        <Trans i18nKey="mon-espace.evolutionGraph.tabs.global">
          Vue globale
        </Trans>
      ),
      isActive: activeTab === globalTabId,
      onClick: () => {
        if (!disabled) {
          setActiveTab('global')
          trackMatomoEvent__deprecated(clickCategorySelector('bilan'))
          trackPosthogEvent(captureClickCategorySelector({ category: 'bilan' }))
        }
      },
      'aria-disabled': disabled,
    },
    ...orderedCategories
      .filter((category) => category !== 'services sociétaux')
      .map((category) => ({
        id: category,
        label: categoryLabels[category] ?? category,
        isActive: activeTab === category,
        onClick: () => {
          if (!disabled) {
            setActiveTab(category)
            trackMatomoEvent__deprecated(clickCategorySelector(category))
            trackPosthogEvent(captureClickCategorySelector({ category }))
          }
        },
        'aria-disabled': disabled,
      })),
  ]

  return (
    <div
      className={twMerge('mb-6 hidden md:block', disabled ? 'opacity-50' : '')}>
      <Tabs
        items={tabsItems}
        ariaLabel="Navigation par catégorie"
        isLocked={disabled}
      />
    </div>
  )
}
