export type ParseImpactCO2ScriptResult =
  | {
      success: true
      data: {
        src: string
        type: string
        searchParams: URLSearchParams
      }
    }
  | {
      success: false
      error: string
    }

export function parseImpactCO2Script(
  scriptHtml: string
): ParseImpactCO2ScriptResult {
  const scriptMatch = scriptHtml.match(
    /<script\s+([^>]*data-name="impact-co2"[^>]*)\/?>/
  )
  if (!scriptMatch) {
    return {
      success: false,
      error: 'Invalid impact-co2 script format: missing data-name attribute',
    }
  }

  const attributes = scriptMatch[1]

  const srcMatch = attributes.match(/src="([^"]+)"/)
  const typeMatch = attributes.match(/data-type="([^"]+)"/)
  const searchMatch = attributes.match(/data-search="([^"]+)"/)

  if (!srcMatch || !typeMatch || !searchMatch) {
    return {
      success: false,
      error: 'Invalid impact-co2 script format: missing required attributes',
    }
  }

  const src = srcMatch[1]
  const type = typeMatch[1]
  const search = searchMatch[1]

  try {
    const searchParams = new URLSearchParams(search)
    return { success: true, data: { src, type, searchParams } }
  } catch {
    return { success: false, error: 'Invalid search params format' }
  }
}
