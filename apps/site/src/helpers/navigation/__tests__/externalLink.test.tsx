import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { getExternalLinkProps, isExternalLink } from '../externalLink'

const SITE_URL = 'https://nosgestesclimat.fr'

const t = ((_key: string, defaultValue: string) => defaultValue) as TFunction

describe('isExternalLink', () => {
  it('returns true for an external absolute URL', () => {
    expect(
      isExternalLink('https://agirpourlatransition.ademe.fr', SITE_URL)
    ).toBe(true)
  })

  it('returns false for a relative path', () => {
    expect(isExternalLink('/simulateur/bilan', SITE_URL)).toBe(false)
  })

  it('returns false for a same-origin absolute URL', () => {
    expect(
      isExternalLink('https://nosgestesclimat.fr/simulateur', SITE_URL)
    ).toBe(false)
  })

  it('returns false for an invalid URL', () => {
    expect(isExternalLink('not a url', SITE_URL)).toBe(false)
  })
})

describe('getExternalLinkProps', () => {
  it('forces external links to open in a new tab with a safe rel', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      children: 'Découvrez les conseils',
      t,
    })

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
      ariaLabel: 'Découvrez les conseils (ouvrir dans une nouvelle fenêtre)',
    })
  })

  it('does not touch internal links', () => {
    const props = getExternalLinkProps({
      href: '/simulateur/bilan',
      siteUrl: SITE_URL,
      children: 'Faire le test',
      t,
    })

    expect(props.target).toBeUndefined()
    expect(props.rel).toBeUndefined()
    expect(props.ariaLabel).toBeUndefined()
  })

  it('respects an explicit target', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      target: '_self',
      children: 'Découvrez les conseils',
      t,
    })

    expect(props.target).toBe('_self')
    expect(props.rel).toBeUndefined()
    expect(props.ariaLabel).toBeUndefined()
  })

  it('keeps an explicit rel when one is provided', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      rel: 'nofollow',
      children: 'Découvrez les conseils',
      t,
    })

    expect(props.target).toBe('_blank')
    expect(props.rel).toBe('nofollow')
  })

  it('keeps an explicit aria-label', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      explicitAriaLabel: 'Ouvrir les conseils ADEME',
      children: 'Découvrez les conseils',
      t,
    })

    expect(props.ariaLabel).toBe('Ouvrir les conseils ADEME')
  })

  it('derives the aria-label from the children JSX', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      children: (
        <span>
          Découvrez <strong>les conseils</strong>
        </span>
      ),
      t,
    })

    expect(props.ariaLabel).toBe(
      'Découvrez les conseils (ouvrir dans une nouvelle fenêtre)'
    )
  })

  it('does not add an aria-label when the link has no text', () => {
    const props = getExternalLinkProps({
      href: 'https://agirpourlatransition.ademe.fr',
      siteUrl: SITE_URL,
      t,
    })

    expect(props.target).toBe('_blank')
    expect(props.ariaLabel).toBeUndefined()
  })
})
