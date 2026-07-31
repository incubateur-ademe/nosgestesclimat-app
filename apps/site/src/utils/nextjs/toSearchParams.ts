/** Converts a page's resolved searchParams back into URLSearchParams */
export const toSearchParams = (
  searchParams: Record<string, string | string[] | undefined> | undefined
): URLSearchParams => {
  const urlSearchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined) continue

    for (const item of Array.isArray(value) ? value : [value]) {
      urlSearchParams.append(key, item)
    }
  }

  return urlSearchParams
}
