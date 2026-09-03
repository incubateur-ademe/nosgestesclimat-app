const secure =
  new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname !== 'localhost'

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? ('none' as const) : ('lax' as const),
    partitioned: secure,
    path: '/',
  }
}
