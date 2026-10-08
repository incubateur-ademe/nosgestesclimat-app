import Trans from '@/components/translation/trans/TransClient'
import { SIGNIN_MODE, SIGNUP_MODE } from '@/constants/authentication/modes'
import type { TabItem } from '@/design-system/layout/Tabs'
import { preserveSearchParams } from '@/helpers/navigation/preserveSearchParams'
import type { AuthenticationMode } from '@/types/authentication'
import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ReadonlyURLSearchParams } from 'next/navigation'

export function getTabs({
  searchParams,
  mode,
}: {
  searchParams: ReadonlyURLSearchParams | SearchParams | undefined
  mode: AuthenticationMode
}): TabItem[] {
  return [
    {
      id: 'connexion',
      label: <Trans i18nKey="login.list.login.label">Se connecter</Trans>,
      href: preserveSearchParams({
        urlOrPathname: './connexion',
        searchParams,
      }),
      isActive: mode === SIGNIN_MODE,
      tab: 'connexion',
      prefetch: false,
    },
    {
      id: 'inscription',
      label: <Trans i18nKey="login.list.signin.label">Créer un compte</Trans>,
      href: preserveSearchParams({
        urlOrPathname: './inscription',
        searchParams,
      }),
      isActive: mode === SIGNUP_MODE,
      tab: 'inscription',
      prefetch: false,
    },
  ]
}
