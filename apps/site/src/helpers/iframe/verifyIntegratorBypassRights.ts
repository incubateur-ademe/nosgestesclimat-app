/**
 * Verify if the integrator is allowed to bypass the consent data share
 */
export const verifyIfIntegratorBypassRights = (
  integratorUrl: string
): boolean => {
  return new Set(
    process.env.NEXT_PUBLIC_DATASHARE_BYPASS_ORIGINS?.split(',') ?? []
  ).has(integratorUrl)
}
