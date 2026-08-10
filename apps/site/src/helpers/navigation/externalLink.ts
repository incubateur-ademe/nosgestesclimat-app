import type { TFunction } from 'i18next'
import { isValidElement, type ReactNode } from 'react'

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

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeToText(node.props.children)
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

  let ariaLabel = explicitAriaLabel
  if (!ariaLabel && resolvedTarget === '_blank') {
    const text = nodeToText(children)
    if (text) {
      ariaLabel = `${text} ${t('components.markdown.linkTargetBlankAriaLabel', '(ouvrir dans une nouvelle fenêtre)')}`
    }
  }

  return { target: resolvedTarget, rel: resolvedRel, ariaLabel }
}
