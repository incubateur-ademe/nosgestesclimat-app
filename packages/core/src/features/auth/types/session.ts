/** Payload stored inside the JOSE-encrypted session cookie. */
export interface Session extends SessionPayload {
  /** Issued-at timestamp (Unix seconds), set by jose. */
  iat: number
  /** Expiration timestamp (Unix seconds), set by jose. */
  exp: number
}

export interface SessionPayload {
  userId: string
  /** Present only for verified (logged-in) users. */
  email?: string
}

/** Token pair returned when a session is created or rotated. */
export interface SessionTokens {
  /** JOSE-encrypted short-lived token (15 min). */
  accessToken: string
  /** Opaque long-lived token (6 months), hashed in DB. */
  refreshToken: string
}
