export interface Group {
  id: string
  name: string
  emoji: string
  /** null when the group has lost its administrator */
  administratorId: string | null
  createdAt: Date
  updatedAt: Date
}
