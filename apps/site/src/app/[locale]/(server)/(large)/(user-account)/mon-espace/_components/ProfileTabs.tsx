import ActionsIcon from '@/components/icons/ActionsIcon'
import AmisIcon from '@/components/icons/AmisIcon'
import BilanIcon from '@/components/icons/BilanIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import Trans from '@/components/translation/trans/TransServer'
import { monEspaceTabTrackEventServer } from '@/constants/tracking/pages/mon-espace'
import { captureClickMonEspaceTabServer } from '@/constants/tracking/posthogTrackers'
import {
  MON_ESPACE_ACTIONS_PATH,
  MON_ESPACE_GROUPS_PATH,
  MON_ESPACE_PATH,
  MON_ESPACE_SETTINGS_PATH,
} from '@/constants/urls/paths'
import type { TabItem } from '@/design-system/layout/Tabs'
import Tabs from '@/design-system/layout/Tabs'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { twMerge } from 'tailwind-merge'

export default async function ProfileTab({
  activePath,
  locale,
}: {
  activePath: string
  locale: string
}) {
  const { t } = await getServerTranslation({ locale })

  const tabsItems: TabItem[] = [
    {
      id: 'dashboard',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <BilanIcon
            className={twMerge(
              'h-6 w-6',
              activePath === MON_ESPACE_PATH
                ? 'fill-primary-600'
                : 'fill-default'
            )}
          />
          <span className="hidden md:block">
            <Trans locale={locale} i18nKey="mon-espace.tabs.myResults">
              Mes résultats
            </Trans>
          </span>
          <span className="block text-center text-sm md:hidden">
            <Trans locale={locale} i18nKey="mon-espace.tabs.results">
              Résultats
            </Trans>
          </span>
        </span>
      ),
      href: MON_ESPACE_PATH,
      isActive: activePath === MON_ESPACE_PATH,
      'data-track-event':
        activePath !== MON_ESPACE_PATH
          ? monEspaceTabTrackEventServer('results')
          : undefined,
      'data-track-posthog':
        activePath !== MON_ESPACE_PATH
          ? captureClickMonEspaceTabServer({ tab: 'results' })
          : undefined,
      prefetch: false,
    },
    {
      id: 'actions',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <ActionsIcon
            className={twMerge(
              'h-6 w-6',
              activePath === MON_ESPACE_ACTIONS_PATH
                ? 'fill-primary-600'
                : 'fill-default'
            )}
          />
          <span className="hidden md:block">
            <Trans locale={locale} i18nKey="mon-espace.tabs.myActions">
              Mes actions
            </Trans>
          </span>
          <span className="block text-center text-sm md:hidden">
            <Trans locale={locale} i18nKey="mon-espace.tabs.actions">
              Actions
            </Trans>
          </span>
        </span>
      ),
      href: MON_ESPACE_ACTIONS_PATH,
      isActive: activePath === MON_ESPACE_ACTIONS_PATH,
      'data-track-event':
        activePath !== MON_ESPACE_ACTIONS_PATH
          ? monEspaceTabTrackEventServer('actions')
          : undefined,
      'data-track-posthog':
        activePath !== MON_ESPACE_ACTIONS_PATH
          ? captureClickMonEspaceTabServer({ tab: 'actions' })
          : undefined,
      prefetch: false,
    },
    {
      id: 'groups',
      label: (
        <span
          className="flex flex-col items-center gap-1 md:flex-row"
          data-testid="my-groups-tab">
          <AmisIcon
            className={twMerge(
              'h-6 w-6',
              activePath === MON_ESPACE_GROUPS_PATH
                ? 'stroke-primary-600 fill-primary-600'
                : 'stroke-default'
            )}
          />
          <span className="hidden text-sm sm:block md:text-lg">
            <Trans locale={locale} i18nKey="mon-espace.tabs.myGroups">
              Tests collectifs
            </Trans>
          </span>
          <span className="block text-center text-sm sm:hidden">
            <Trans locale={locale} i18nKey="mon-espace.tabs.groups">
              Groupes
            </Trans>
          </span>
        </span>
      ),
      href: MON_ESPACE_GROUPS_PATH,
      isActive: activePath === MON_ESPACE_GROUPS_PATH,
      'data-track-event':
        activePath !== MON_ESPACE_GROUPS_PATH
          ? monEspaceTabTrackEventServer('groups')
          : undefined,
      'data-track-posthog':
        activePath !== MON_ESPACE_GROUPS_PATH
          ? captureClickMonEspaceTabServer({ tab: 'groups' })
          : undefined,
      prefetch: false,
    },
    {
      id: 'settings',
      label: (
        <span className="flex flex-col items-center gap-1 md:flex-row">
          <SettingsIcon
            className={twMerge(
              'h-6 w-6',
              activePath === MON_ESPACE_SETTINGS_PATH
                ? 'fill-primary-600'
                : 'fill-default'
            )}
          />
          <span className="text-sm md:text-base">
            <Trans locale={locale} i18nKey="mon-espace.tabs.settings">
              Paramètres
            </Trans>
          </span>
        </span>
      ),
      href: MON_ESPACE_SETTINGS_PATH,
      isActive: activePath === MON_ESPACE_SETTINGS_PATH,
      'data-track-event':
        activePath !== MON_ESPACE_SETTINGS_PATH
          ? monEspaceTabTrackEventServer('settings')
          : undefined,
      'data-track-posthog':
        activePath !== MON_ESPACE_SETTINGS_PATH
          ? captureClickMonEspaceTabServer({ tab: 'settings' })
          : undefined,
      containerClassName: 'md:ml-auto',
      prefetch: false,
    },
  ]
  return (
    <Tabs
      items={tabsItems}
      className="mb-8"
      ariaLabel={t('Navigation de mon espace')}
      containerId="mon-espace-tabs"
    />
  )
}
