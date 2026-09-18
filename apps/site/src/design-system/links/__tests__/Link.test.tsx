import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Link from '../Link'

// `next/link` only exposes `prefetch` to the router, never to the DOM: capture
// the prop as it is passed down to assert when the prefetch is actually armed.
const receivedProps = vi.hoisted(() => [] as { prefetch?: unknown }[])

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch,
    ...props
  }: {
    href: string
    children: React.ReactNode
    prefetch?: unknown
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    receivedProps.push({ prefetch })

    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

const lastPrefetch = () => receivedProps.at(-1)?.prefetch

describe('Link', () => {
  it('arms no prefetch before the visitor shows intent', () => {
    render(<Link href="/simulateur/bilan">Faire le test</Link>)

    expect(lastPrefetch()).toBe(false)
  })

  it('arms the prefetch on hover', async () => {
    render(<Link href="/simulateur/bilan">Faire le test</Link>)

    await userEvent.hover(screen.getByRole('link'))

    expect(lastPrefetch()).toBeNull()
  })

  it('arms the prefetch on keyboard focus', async () => {
    render(<Link href="/simulateur/bilan">Faire le test</Link>)

    await userEvent.tab()

    expect(lastPrefetch()).toBeNull()
  })

  it('keeps an explicit prefetch prop', async () => {
    const { rerender } = render(
      <Link href="/simulateur/bilan" prefetch={false}>
        Faire le test
      </Link>
    )

    await userEvent.hover(screen.getByRole('link'))

    expect(lastPrefetch()).toBe(false)

    rerender(
      <Link href="/simulateur/bilan" prefetch>
        Faire le test
      </Link>
    )

    expect(lastPrefetch()).toBe(true)
  })
})
