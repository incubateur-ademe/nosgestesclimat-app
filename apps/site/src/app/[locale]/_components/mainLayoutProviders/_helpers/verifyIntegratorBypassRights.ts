'use server'
/**
 * Verify if the integrator is allowed to bypass the consent data share
 */
export const verifyIfIntegratorBypassRights = async (
  bypassKey: string
): Promise<boolean> => {
  return Promise.resolve(!!bypassKey && process.env.BYPASS_KEY === bypassKey)
}
