'use client'

import ActionsIcon from '@/components/icons/ActionsIcon'
import AmisIcon from '@/components/icons/AmisIcon'
import BilanIcon from '@/components/icons/BilanIcon'
import Trans from '@/components/translation/trans/TransClient'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import type { TabItem } from '@/design-system/layout/Tabs'
import Tabs from '@/design-system/layout/Tabs'
import { useShouldHideIfIframe } from '@/hooks/iframe/useShouldHideIfIframe'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export default function FinTabs() {
  const pathname = usePathname()
  const { t } = useClientTranslation()
  const resultsHref = `${END_PAGE_PATH}`
  const actionsHref = `${END_PAGE_PATH}/actions`
  const groupsHref = `${END_PAGE_PATH}/groupes`

  const isActionsActive = pathname.endsWith('actions')
  const isGroupsActive = pathname.endsWith('groupes')
  const isResultsActive = !isActionsActive && !isGroupsActive

  const shouldHideGroupTab = useShouldHideIfIframe({
    hideIfNotFrenchRegion: true,
  })

  const tabsItems: TabItem[] = [
    {
      id: 'results',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <BilanIcon
            className={twMerge(
              'h-6 w-6',
              isResultsActive ? 'fill-primary-600' : 'fill-default'
            )}
          />
          <span className="hidden md:block">
            <Trans i18nKey="mon-espace.tabs.myResults">Mes résultats</Trans>
          </span>
          <span className="block text-center text-sm md:hidden">
            <Trans i18nKey="mon-espace.tabs.results">Résultats</Trans>
          </span>
        </span>
      ),
      href: resultsHref,
      isActive: isResultsActive,
    },
    {
      id: 'actions',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <ActionsIcon
            className={twMerge(
              'h-6 w-6',
              isActionsActive ? 'fill-primary-600' : 'fill-default'
            )}
          />
          <span className="hidden md:block">
            <Trans i18nKey="mon-espace.tabs.myActions">Mes actions</Trans>
          </span>
          <span className="block text-center text-sm md:hidden">
            <Trans i18nKey="mon-espace.tabs.actions">Actions</Trans>
          </span>
        </span>
      ),
      href: actionsHref,
      isActive: isActionsActive,
    },
    ...(!shouldHideGroupTab
      ? [
          {
            id: 'groups',
            label: (
              <span
                className="flex flex-col items-center gap-1 md:flex-row"
                data-testid="my-groups-tab">
                <AmisIcon
                  className={twMerge(
                    'h-6 w-6',
                    isGroupsActive
                      ? 'stroke-primary-600 fill-primary-600'
                      : 'stroke-default'
                  )}
                />
                <span className="hidden md:block">
                  <Trans i18nKey="results.tabs.myGroups">
                    Créer un test collectif
                  </Trans>
                </span>
                <span className="block text-center text-sm md:hidden">
                  <Trans i18nKey="results.tabs.groups">Test collectif</Trans>
                </span>
              </span>
            ),
            href: groupsHref,
            isActive: isGroupsActive,
          },
        ]
      : []),
  ]

  return (
    <Tabs
      items={tabsItems}
      className="mb-12"
      ariaLabel={t('Navigation de mon espace')}
      containerId="fin-tabs"
      isLocked={false}
    />
  )
}
