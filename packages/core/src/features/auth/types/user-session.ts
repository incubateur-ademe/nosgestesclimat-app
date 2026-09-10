export interface AnonUser {
  id: string
  isAuth: false
}

export interface AuthUser {
  id: string
  email: string
  isAuth: true
}

/**
 * Represents a user that is either authenticated (has an email) or anonymous (has an id but no email).
 */
export type AppUser = AuthUser | AnonUser

/**
 * Represents the result of a session lookup:
 * - `AppUser`: A session exists (either anonymous or authenticated).
 * - `null`: No user session exists (e.g. first visit, no data at all).
 */
export type UserSession = AppUser | null
