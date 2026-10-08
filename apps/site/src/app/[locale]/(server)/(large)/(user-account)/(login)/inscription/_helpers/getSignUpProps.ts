import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { ACTIONS_MY_PLAN_PATH, MON_ESPACE_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { match } from 'ts-pattern'
import type { AuthorizedFromSearchParamsValues } from '../../_constants/search-params'

interface Props {
  from?: AuthorizedFromSearchParamsValues
  locale: Locale
}

export function getSignupProps({ from, locale }: Props): {
  labels: {
    title: string
    buttonLabel: string
  }
  redirectPathname: string
} {
  const { t } = getServerTranslation({ locale })

  return match(from)
    .with('build-action-plan', () => ({
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
      redirectPathname: `${ACTIONS_MY_PLAN_PATH}?from=${from}`,
    }))
    .otherwise(() => ({
      labels: {
        title: t(
          'login.login.title',
          'Accédez à votre espace Nos Gestes Climat'
        ),
        buttonLabel: t('signup.button.label', "M'inscrire"),
      },
      redirectPathname: `${MON_ESPACE_PATH}?${SHOW_WELCOME_BANNER_QUERY_PARAM}=true`,
    }))
}
