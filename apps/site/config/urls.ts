let serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://localhost:3001'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
export const PROXY_SERVER = !new URL(serverUrl).host.endsWith(
  new URL(siteUrl).host
)

if (PROXY_SERVER) {
  serverUrl = siteUrl + '/api/server'
}

export const SERVER_URL = serverUrl
