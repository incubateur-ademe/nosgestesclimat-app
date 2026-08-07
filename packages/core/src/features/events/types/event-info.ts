import type { OrganisationType } from '../../../prisma/generated/enums.ts'

export interface EventOrganisation {
  id: string
  name: string
  slug: string
  type: OrganisationType
  simulationsCount: number
}

export interface EventInfo {
  organisations: EventOrganisation[]
  totalSimulations: number
  organisationCount: number
  startDate: Date
  endDate: Date
}
