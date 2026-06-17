const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
const secure = domain !== 'localhost'

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- needed for TypeScript narrowing
    sameSite: (secure ? 'none' : 'strict') as 'none' | 'strict',
    partitioned: secure,
    path: '/',
    ...(secure ? { domain } : {}),
  }
}
