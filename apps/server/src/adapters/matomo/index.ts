import { MatomoStatsSource } from '../prisma/generated.js'
import { config } from '../../config.js'
import type { ValueOf } from '../../types/types.js'
import { matomoClientFactory } from './client.js'

const { beta, data } = config.thirdParty.matomo

export const clients = {
  [MatomoStatsSource.beta]: matomoClientFactory(beta),
  [MatomoStatsSource.data]: matomoClientFactory(data),
} as const

export type clients = ValueOf<typeof clients>
