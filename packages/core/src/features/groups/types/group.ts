export interface Group {
  id: string
  name: string
  emoji: string
  /** null when the group has lost its administrator */
  administratorId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GroupParticipant {
  id: string
  userId: string
  simulationId: string
  groupId: string
  createdAt: Date
  updatedAt: Date
}
