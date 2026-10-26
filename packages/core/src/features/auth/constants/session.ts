export const SESSION_TTL_SECONDS = 60 * 20
export const REFRESH_TOKEN_TTL_DAYS = 180

/**
 * How late a rotated refresh key may still be presented before it counts as a
 * replay.
 */
export const SESSION_ROTATION_TOLERANCE_SECONDS = 30
