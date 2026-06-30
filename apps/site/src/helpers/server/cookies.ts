const isLocalhost =
  new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname === 'localhost'

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: isLocalhost ? ('lax' as const) : ('none' as const),
    partitioned: !isLocalhost,
    path: '/',
  }
}
