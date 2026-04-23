import { config } from '../../config.js'
import type { ValueOf } from '../../types/types.js'
import { MatomoStatsSource } from '../prisma/generated.js'
import { matomoClientFactory } from './client.js'

const { beta } = config.thirdParty.matomo

export const clients = {
  [MatomoStatsSource.beta]: matomoClientFactory(beta),
} as const

export type clients = ValueOf<typeof clients>
