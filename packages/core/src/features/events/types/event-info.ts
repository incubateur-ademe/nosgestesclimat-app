export interface EventOrganisation {
  id: string
  name: string
  slug: string
  type: string
  simulationsCount: number
}

export interface EventInfo {
  organisations: EventOrganisation[]
  totalSimulations: number
  organisationCount: number
  startDate: Date
  endDate: Date
}
