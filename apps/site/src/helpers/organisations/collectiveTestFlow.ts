export type CollectiveTestFlowStep =
  | 'informations'
  | 'mode'
  | 'connexion'
  | 'organisation'

export function getCollectiveTestTotalSteps(
  isAuth: boolean,
  hasOrg: boolean
): number {
  if (isAuth && hasOrg) {
    return 2
  }

  if (isAuth) {
    return 3
  }

  return 4
}

export function getCollectiveTestStepNumber(
  step: CollectiveTestFlowStep,
  isAuth: boolean,
  _hasOrg: boolean
): number {
  if (step === 'informations') {
    return 1
  }

  if (step === 'mode') {
    return 2
  }

  if (step === 'connexion') {
    return 3
  }

  return isAuth ? 3 : 4
}
