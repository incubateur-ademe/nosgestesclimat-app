import { ACTIONS_MY_PLAN_PATH, MON_ESPACE_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { match } from 'ts-pattern'
import type { AuthorizedFromSearchParamsValues } from '../../_constants/search-params'

interface Props {
  from?: AuthorizedFromSearchParamsValues
  locale: Locale
}

export function getLoginProps({ from, locale }: Props): {
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
          'Connectez-vous pour accéder à votre plan d’action'
        ),
        buttonLabel: t(
          'login.actionPlan.buttonLabel',
          'Me connecter et voir mon plan d’action'
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
        buttonLabel: t('signIn.emailForm.buttonLabel', 'Accéder à mon espace'),
      },
      redirectPathname: MON_ESPACE_PATH,
    }))
}
