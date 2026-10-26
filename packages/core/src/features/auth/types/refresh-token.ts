export interface CreateRefreshTokenData {
  userId: string
  token: string
  expiresAt: Date
  id?: string
  createdAt?: Date
}
