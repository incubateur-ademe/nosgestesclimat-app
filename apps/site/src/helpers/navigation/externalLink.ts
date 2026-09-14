import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'

interface GetExternalLinkPropsParams {
  href: string
  siteUrl: string
  target?: string
  rel?: string
  explicitAriaLabel?: string
  children?: ReactNode
  t: TFunction
}

export function isExternalLink(href: string, siteUrl: string): boolean {
  try {
    const url = new URL(href)
    const site = new URL(siteUrl)
    return url.origin !== site.origin
  } catch {
    return false
  }
}

/**
 * Extracts the text of a link's children.
 *
 * Only literal text is used, and elements are never introspected: a server
 * component child is rendered on the server but arrives on the client as its
 * *output* (React Server Components), so walking it gives a different text on
 * each side. The footer's logo link (`<Link href="https://ademe.fr"><Ademe />`)
 * derived nothing on the server and `ADEME` on the client, which made React
 * regenerate the whole tree after hydration — on every page.
 */
function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join('')
  }
  return ''
}

export function getExternalLinkProps({
  href,
  siteUrl,
  target,
  rel,
  explicitAriaLabel,
  children,
  t,
}: GetExternalLinkPropsParams): {
  target?: string
  rel?: string
  ariaLabel?: string
} {
  const isExternal = isExternalLink(href, siteUrl)

  // Force external links to open in a new tab so they never navigate the app
  // away: required when the app is embedded in an iframe, where the target
  // site may refuse to be framed (CSP frame-ancestors) and show a blank page.
  const resolvedTarget = target ?? (isExternal ? '_blank' : undefined)

  const resolvedRel =
    resolvedTarget === '_blank' ? (rel ?? 'noopener noreferrer') : rel

  // Callers rendering a logo or an icon should pass an explicit `aria-label`
  // (or rely on the child's own accessible name): the label can't be derived
  // from it without diverging between the server and the client.
  let ariaLabel = explicitAriaLabel
  if (!ariaLabel && resolvedTarget === '_blank') {
    const text = nodeToText(children)
    if (text) {
      ariaLabel = `${text} ${t('components.markdown.linkTargetBlankAriaLabel', '(ouvrir dans une nouvelle fenêtre)')}`
    }
  }

  return { target: resolvedTarget, rel: resolvedRel, ariaLabel }
}
