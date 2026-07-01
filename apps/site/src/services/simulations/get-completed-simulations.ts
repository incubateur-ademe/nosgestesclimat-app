'use server'

import type { Simulation } from '@/helpers/server/model/simulations'
import { getSimulations } from './get-simulations'

export const getCompletedSimulations = async ({
  pageSize,
}: { pageSize?: number } = {}): Promise<Simulation[]> =>
  await getSimulations({ completedOnly: true, pageSize })
