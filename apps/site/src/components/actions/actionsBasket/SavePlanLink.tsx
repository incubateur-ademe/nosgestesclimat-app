import { AUTHORIZED_FROM_SEARCH_PARAMS_VALUES } from '@/app/[locale]/(server)/(large)/(user-account)/(login)/_constants/search-params'
import { ACTIONS_MY_PLAN_PATH, CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { getUserSession } from '@/services/auth/get-user-session'
import { cn } from 'cn'

interface Props extends React.ComponentPropsWithoutRef<'a'> {
  className?: string
}

export default async function SavePlanLink({ children, className }: Props) {
  const userSession = await getUserSession()
  const href = userSession?.isAuth
    ? ACTIONS_MY_PLAN_PATH
    : `${CONNEXION_PATH}?from=${AUTHORIZED_FROM_SEARCH_PARAMS_VALUES['build-action-plan']}`

  return (
    <ButtonLinkServer className={cn('text-sm!', className)} href={href}>
      {children}
    </ButtonLinkServer>
  )
}
