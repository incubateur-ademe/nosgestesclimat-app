/**
 * Narrows a user to a verified user (i.e. one that has a confirmed email).
 * Accepts any user with id and optionally email, narrowing to only options with email.
 */
export const isVerifiedUser = (user?: {
  id: string
  email?: string
}): user is { id: string; email: string } =>
  !!user && 'email' in user && !!user.email
