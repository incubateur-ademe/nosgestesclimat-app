import { ACTIONS_MY_PLAN_PATH, CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { getUserSession } from '@/services/auth/get-user-session'

interface Props {
  label: React.ReactNode
  className?: string
}

export default async function SavePlanLink({ label, className }: Props) {
  const userSession = await getUserSession()
  // determiner le lien vers lequel diriger l'utilisateur
  // si connecté : /actions/mon-plan
  // si non connecté /mon-espace/connexion
  const href = userSession?.isAuth
    ? ACTIONS_MY_PLAN_PATH
    : `${CONNEXION_PATH}?from=plan`

  return (
    <ButtonLinkServer className={className} href={href}>
      {label}
    </ButtonLinkServer>
  )
}
