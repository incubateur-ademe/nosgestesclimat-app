import type { Prisma } from '../../../prisma/generated/client.ts'

/**
 * The default SEDD event. Single source of truth for its identity and window,
 * shared by the seed, the review-app postdeploy and the cron refresh.
 */
export const SEDD_EVENT = {
  slug: 'sedd',
  name: 'SEDD 2026',
  startDate: new Date('2026-09-18T00:00:00+02:00'),
  endDate: new Date('2026-10-08T23:59:59+02:00'),
} satisfies Prisma.EventCreateInput
