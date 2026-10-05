import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { ACTIONS_MY_PLAN_PATH, MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { Locale } from '@/i18nConfig'
import { getServerTranslation } from '../../../../../../../helpers/getServerTranslation'
import { preserveSearchParams } from '../../../../../../../helpers/navigation/preserveSearchParams'

interface Props {
  from?: string | string[] | undefined
  locale: Locale
}

interface LabellingObject {
  labels: {
    title: string | null
    buttonLabel: string | null
  } | null
  redirectPathname: string
}

export function getLoginParams({ from, locale }: Props): {
  login: LabellingObject
  signup: LabellingObject
} {
  const { t } = getServerTranslation({ locale })
  switch (from) {
    case 'action-plan':
      return {
        login: {
          labels: {
            title: t(
              'login.actionPlan.title',
              'Connectez-vous pour accéder à votre plan d’action'
            ),
            buttonLabel: t(
              'login.actionPlan.buttonLabel',
              'Me connecter et voir mon plan d’action'
            ),
          },
          redirectPathname: preserveSearchParams({
            urlOrPathname: ACTIONS_MY_PLAN_PATH,
            searchParams: { from },
          }),
        },
        signup: {
          labels: {
            title: t(
              'login.actionPlan.title',
              'Créez votre espace pour accéder à votre plan d’action'
            ),
            buttonLabel: t(
              'login.actionPlan.buttonLabel',
              'M’inscrire et voir mon plan d’action'
            ),
          },
          redirectPathname: preserveSearchParams({
            urlOrPathname: ACTIONS_MY_PLAN_PATH,
            searchParams: { from },
          }),
        },
      }
    default:
      return {
        login: {
          labels: null,
          redirectPathname: MON_ESPACE_PATH,
        },
        signup: {
          labels: {
            title: null,
            buttonLabel: t('signup.button.label', "M'inscrire"),
          },
          redirectPathname: preserveSearchParams({
            urlOrPathname: MON_ESPACE_PATH,
            searchParams: { [SHOW_WELCOME_BANNER_QUERY_PARAM]: 'true' },
          }),
        },
      }
  }
}
