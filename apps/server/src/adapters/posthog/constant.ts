export const PosthogEndpoint = {
  northstarStats: 'northstar_stats',
} as const

export type PosthogEndpoint =
  (typeof PosthogEndpoint)[keyof typeof PosthogEndpoint]
