import { config } from '../../../config.ts'

/**
 * Builds the internal-proxy authentication headers expected by the
 * authentification middleware.
 *
 * In production the session cookie is validated by the proxy, which forwards
 * the resolved user as `x-user-id` (+ `x-user-email` for verified users)
 * alongside the shared `x-internal-key`. Tests target the internal API
 * directly, so they forward those headers themselves.
 */
export const authHeaders = ({
  userId,
  email,
}: {
  userId: string
  email?: string
}) => ({
  'x-internal-key': config.security.internalApiKey,
  'x-user-id': userId,
  ...(email ? { 'x-user-email': email } : {}),
})
