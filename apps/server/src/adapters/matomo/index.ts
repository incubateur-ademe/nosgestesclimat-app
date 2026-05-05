import { config } from '../../config.ts'
import type { ValueOf } from '../../types/types.ts'
import { MatomoStatsSource } from '../prisma/generated.ts'
import { matomoClientFactory } from './client.ts'

const { beta } = config.thirdParty.matomo

export const clients = {
  [MatomoStatsSource.beta]: matomoClientFactory(beta),
} as const

export type clients = ValueOf<typeof clients>
