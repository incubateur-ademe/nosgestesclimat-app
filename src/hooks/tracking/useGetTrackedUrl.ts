import { usePathname, useSearchParams } from 'next/navigation'

export function useGetTrackedPathname() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  let pathnameUpdated = String(pathname)

  // We convert the question searchParams to a real url
  const questionParams = searchParams.get('question')
  if (questionParams) {
    const category = questionParams.split('.')[0]
    const question = questionParams.replace(category + '.', '')
    pathnameUpdated += `/${category}/${question}`
  }

  // We convert the groupId to a real url
  const groupId = searchParams.get('groupId')
  if (groupId) {
    pathnameUpdated += `/${groupId}`
  }

  // We add a trailing slash
  if (!pathnameUpdated.endsWith('/')) {
    pathnameUpdated += '/'
  }

  // We add the searchParams to the url
  const search = searchParams.toString()
  if (search) {
    pathnameUpdated += `?${search}`
  }

  // Remove trailing slash
  pathnameUpdated = pathnameUpdated.replace(/\/$/, '')

  return pathnameUpdated
}
