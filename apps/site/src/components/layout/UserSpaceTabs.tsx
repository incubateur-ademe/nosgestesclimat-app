'use client'

import ActionsIcon from '@/components/icons/ActionsIcon'
import AmisIcon from '@/components/icons/AmisIcon'
import BilanIcon from '@/components/icons/BilanIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  ACTIONS_SUGGESTED_PATH,
  END_PAGE_GROUPS_PATH,
  END_PAGE_PATH,
  MON_ESPACE_GROUPS_PATH,
  MON_ESPACE_PATH,
  MON_ESPACE_SETTINGS_PATH,
} from '@/constants/urls/paths'
import type { TabItem } from '@/design-system/layout/Tabs'
import Tabs from '@/design-system/layout/Tabs'
import { useShouldHideIfIframe } from '@/hooks/iframe/useShouldHideIfIframe'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { cn } from 'cn'

export type UserSpaceTabId = 'results' | 'actions' | 'groups' | 'settings'

interface Props {
  isAuth: boolean
  activeTabId: UserSpaceTabId
}

export default function UserSpaceTabs({ isAuth, activeTabId }: Props) {
  const { t } = useClientTranslation()

  const shouldHideGroupTabInIframe = useShouldHideIfIframe({
    hideIfNotFrenchRegion: true,
  })

  const shouldHideGroupTab = !isAuth && shouldHideGroupTabInIframe

  const tabsItems: TabItem[] = [
    {
      id: 'results',
      label: (
        <span
          className="flex flex-col items-center gap-1 md:flex-row"
          data-testid="my-results-tab">
          <BilanIcon
            className={cn(
              'h-6 w-6',
              activeTabId === 'results' ? 'fill-primary-600' : 'fill-default'
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
      href: isAuth ? MON_ESPACE_PATH : END_PAGE_PATH,
      isActive: activeTabId === 'results',
      prefetch: false,
    },
    {
      id: 'actions',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <ActionsIcon
            className={cn(
              'h-6 w-6',
              activeTabId === 'actions' ? 'fill-primary-600' : 'fill-default'
            )}
          />
          <span className="hidden md:block">
            <Trans i18nKey="mon-espace.tabs.myActions">J'agis</Trans>
          </span>
          <span className="block text-center text-sm md:hidden">
            <Trans i18nKey="mon-espace.tabs.actions">J'agis</Trans>
          </span>
        </span>
      ),
      href: ACTIONS_SUGGESTED_PATH,
      isActive: activeTabId === 'actions',
      prefetch: false,
    },
    ...(shouldHideGroupTab
      ? []
      : [
          {
            id: 'groups',
            label: (
              <span
                className="flex flex-col items-center gap-1 md:flex-row"
                data-testid="my-groups-tab">
                <AmisIcon
                  className={cn(
                    'h-6 w-6',
                    activeTabId === 'groups'
                      ? 'stroke-primary-600 fill-primary-600'
                      : 'stroke-default'
                  )}
                />
                {isAuth ? (
                  <>
                    <span className="hidden text-sm sm:block md:text-lg">
                      <Trans i18nKey="mon-espace.tabs.myGroups">
                        Tests collectifs
                      </Trans>
                    </span>
                    <span className="block text-center text-sm sm:hidden">
                      <Trans i18nKey="mon-espace.tabs.groups">Groupes</Trans>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hidden md:block">
                      <Trans i18nKey="results.tabs.myGroups">
                        Créer un test collectif
                      </Trans>
                    </span>
                    <span className="block text-center text-sm md:hidden">
                      <Trans i18nKey="results.tabs.groups">
                        Test collectif
                      </Trans>
                    </span>
                  </>
                )}
              </span>
            ),
            href: isAuth ? MON_ESPACE_GROUPS_PATH : END_PAGE_GROUPS_PATH,
            isActive: activeTabId === 'groups',
            prefetch: false,
          },
        ]),
    ...(isAuth
      ? [
          {
            id: 'settings',
            label: (
              <span className="flex flex-col items-center gap-1 md:flex-row">
                <SettingsIcon
                  className={cn(
                    'h-6 w-6',
                    activeTabId === 'settings'
                      ? 'fill-primary-600'
                      : 'fill-default'
                  )}
                />
                <span className="text-sm md:text-base">
                  <Trans i18nKey="mon-espace.tabs.settings">Paramètres</Trans>
                </span>
              </span>
            ),
            href: MON_ESPACE_SETTINGS_PATH,
            isActive: activeTabId === 'settings',
            containerClassName: 'md:ml-auto',
            prefetch: false,
          },
        ]
      : []),
  ]

  return (
    <Tabs
      items={tabsItems}
      className="mb-6 md:mb-8"
      ariaLabel={t('Navigation de mon espace')}
      containerId="user-space-tabs"
    />
  )
}
