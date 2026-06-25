const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
const secure = domain !== 'localhost'

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: 'none' as const,
    partitioned: secure,
    path: '/',
    ...(secure ? { domain } : {}),
  }
}
