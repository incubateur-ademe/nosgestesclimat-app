import { publicEnv } from './public.ts'
import { readServerEnv } from './server-contract.ts'

export const env = { ...publicEnv, ...readServerEnv() }
