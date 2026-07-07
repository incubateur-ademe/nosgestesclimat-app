import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'

interface Props {
  href: string
  target?: string
  explicitAriaLabel?: string
  children?: ReactNode
  isIframe?: boolean
  t: TFunction
}

export function isExternalLink(href: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const url = new URL(href, window.location.origin)
    return url.origin !== window.location.origin
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
  return ''
}

export function getExternalLinkProps({
  href,
  target,
  explicitAriaLabel,
  children,
  isIframe,
  t,
}: Props): { target?: string; rel?: string; ariaLabel?: string } {
  // Only force external links to open in a new tab when embedded in an iframe,
  // because the target site may block navigation via CSP (frame-ancestors).
  if (!isIframe) {
    return {}
  }

  const isExternal = isExternalLink(href)

  if (!isExternal || target) {
    return {}
  }

  const rel = 'noopener noreferrer'

  let ariaLabel: string | undefined
  if (!explicitAriaLabel) {
    const text = nodeToText(children)
    if (text) {
      ariaLabel = `${text}${t('common.openInNewWindow', ', ouvrir dans une nouvelle fenêtre')}`
    }
  }

  return { target: '_blank', rel, ariaLabel }
}
