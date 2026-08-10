import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Link from '../Link'

vi.mock('@/hooks/useClientTranslation', () => ({
  useClientTranslation: () => ({
    t: (_key: string, defaultValue: string) => defaultValue,
  }),
}))

describe('Link', () => {
  it('opens external links in a new tab with a safe rel and a derived aria-label', () => {
    render(
      <Link href="https://agirpourlatransition.ademe.fr">
        Découvrez les conseils
      </Link>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      'https://agirpourlatransition.ademe.fr'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute(
      'aria-label',
      'Découvrez les conseils (ouvrir dans une nouvelle fenêtre)'
    )
  })

  it('does not touch internal links', () => {
    render(<Link href="/simulateur/bilan">Faire le test</Link>)

    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
    expect(link).not.toHaveAttribute('aria-label')
  })

  it('derives the aria-label from JSX children', () => {
    render(
      <Link href="https://agirpourlatransition.ademe.fr">
        <span>
          Découvrez <strong>les conseils</strong>
        </span>
      </Link>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'aria-label',
      'Découvrez les conseils (ouvrir dans une nouvelle fenêtre)'
    )
  })

  it('respects an explicit target', () => {
    render(
      <Link href="https://agirpourlatransition.ademe.fr" target="_self">
        Découvrez les conseils
      </Link>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_self')
    expect(link).not.toHaveAttribute('rel')
    expect(link).not.toHaveAttribute('aria-label')
  })

  it('keeps an explicit rel when one is provided', () => {
    render(
      <Link href="https://agirpourlatransition.ademe.fr" rel="nofollow">
        Découvrez les conseils
      </Link>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'nofollow')
  })

  it('keeps an explicit aria-label', () => {
    render(
      <Link
        href="https://agirpourlatransition.ademe.fr"
        aria-label="Ouvrir les conseils ADEME">
        Découvrez les conseils
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Ouvrir les conseils ADEME' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('aria-label', 'Ouvrir les conseils ADEME')
  })
})
