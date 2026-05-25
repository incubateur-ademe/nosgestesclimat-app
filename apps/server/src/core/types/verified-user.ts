export type VerifiedUser = {
  id: string
  email: string
  name: string | null
  position: string | null
  telephone: string | null
  optedInForCommunications: boolean
  createdAt: Date
  updatedAt: Date
}
