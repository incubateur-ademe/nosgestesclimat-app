import NoResultsBlock from '@/components/dashboard/NoResultsBlock'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { Locale } from '@/i18nConfig'
import InstructionsBanner from './noResultsView/InstructionsBanner'
import ProfileTab from './ProfileTabs'

export default function NoResultsView({ locale }: { locale: Locale }) {
  return (
    <>
      <InstructionsBanner locale={locale} />

      <ProfileTab locale={locale} activePath={MON_ESPACE_PATH} />

      <NoResultsBlock locale={locale} />
    </>
  )
}
