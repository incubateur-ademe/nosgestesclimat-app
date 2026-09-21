import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { useIsMobileLayout } from '../useIsMobileLayout'

const isMobileMock = vi.fn()
vi.mock('is-mobile', () => ({ default: () => isMobileMock() }))

const Probe = () => <span>{String(useIsMobileLayout())}</span>

describe('useIsMobileLayout', () => {
  it('renders as a desktop layout on the server, even for a mobile user agent', () => {
    isMobileMock.mockReturnValue(true)

    // Guards the hydration invariant: the server has no user agent to read, so
    // its HTML must be the one the client produces on its first render.
    expect(renderToString(<Probe />)).toBe('<span>false</span>')
  })
})
