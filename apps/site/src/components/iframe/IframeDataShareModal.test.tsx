import type { ComputedResults } from '@/publicodes-state/types'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import IframeDataShareModal from './IframeDataShareModal'

// Mock useIframe — the only context dependency of the component
const mockUseIframe = vi.fn()
vi.mock('@/hooks/useIframe', () => ({
  useIframe: () => mockUseIframe(),
}))

// Mock shareDataWithIntegrator — we test the component's behaviour,
// not the internal implementation details of the helper
const mockShareDataWithIntegrator = vi.fn()
vi.mock('@/helpers/iframe/shareDataWithIntegrator', () => ({
  shareDataWithIntegrator: (...args: unknown[]) =>
    mockShareDataWithIntegrator(...args),
}))

// Translation: returns the key as-is, sufficient for the tests
vi.mock('@/hooks/useClientTranslation', () => ({
  useClientTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const mockComputedResults = {
  carbone: {
    bilan: 15000,
    categories: {
      transport: 1000,
      alimentation: 2000,
      logement: 3000,
      divers: 4000,
      'services sociétaux': 5000,
    },
  },
  eau: {
    bilan: 0,
    categories: {
      transport: 0,
      alimentation: 0,
      logement: 0,
      divers: 0,
      'services sociétaux': 0,
    },
  },
} as ComputedResults

describe('IframeDataShareModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // Default state: inside an iframe with data sharing enabled, no bypass
    mockUseIframe.mockReturnValue({
      isIframeShareData: true,
      isIntegratorAllowedToBypassConsentDataShare: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders nothing when isIframeShareData is false', () => {
    mockUseIframe.mockReturnValue({
      isIframeShareData: false,
      isIntegratorAllowedToBypassConsentDataShare: false,
    })

    const { container } = render(
      <IframeDataShareModal computedResults={mockComputedResults} />
    )

    expect(container.firstChild).toBeNull()
  })

  describe('standard consent flow (isIframeShareData: true, bypass: false)', () => {
    it('does not show the modal before the 3500ms timeout', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      expect(
        screen.queryByTestId('iframe-datashare-modal')
      ).not.toBeInTheDocument()
    })

    it('shows the modal after the 3500ms timeout', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      act(() => {
        vi.advanceTimersByTime(3500)
      })

      expect(screen.getByTestId('iframe-datashare-modal')).toBeInTheDocument()
    })

    it('locks the body scroll as soon as the component mounts', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    describe('actions from the open modal', () => {
      beforeEach(() => {
        render(<IframeDataShareModal computedResults={mockComputedResults} />)
        act(() => {
          vi.advanceTimersByTime(3500)
        })
      })

      it('shares data via shareDataWithIntegrator when accepting', () => {
        fireEvent.click(screen.getByTestId('iframe-datashare-accepter'))

        expect(mockShareDataWithIntegrator).toHaveBeenCalledWith(
          mockComputedResults
        )
      })

      it('closes the modal and restores body scroll when accepting', () => {
        fireEvent.click(screen.getByTestId('iframe-datashare-accepter'))

        expect(
          screen.queryByTestId('iframe-datashare-modal')
        ).not.toBeInTheDocument()
        expect(document.body.style.overflow).toBe('auto')
      })

      it('sends an error message to the parent window when rejecting', () => {
        const mockPostMessage = vi.fn()
        window.parent.postMessage = mockPostMessage

        fireEvent.click(screen.getByTestId('iframe-datashare-refuser'))

        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            messageType: 'ngc-iframe-share',
            error: 'The user refused to share his result.',
          },
          '*'
        )
      })

      it('closes the modal and restores body scroll when rejecting', () => {
        window.parent.postMessage = vi.fn()

        fireEvent.click(screen.getByTestId('iframe-datashare-refuser'))

        expect(
          screen.queryByTestId('iframe-datashare-modal')
        ).not.toBeInTheDocument()
        expect(document.body.style.overflow).toBe('auto')
      })
    })
  })

  describe('consent bypass (isIntegratorAllowedToBypassConsentDataShare: true)', () => {
    beforeEach(() => {
      mockUseIframe.mockReturnValue({
        isIframeShareData: true,
        isIntegratorAllowedToBypassConsentDataShare: true,
      })
    })

    it('shares data immediately without waiting for the timeout', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      expect(mockShareDataWithIntegrator).toHaveBeenCalledWith(
        mockComputedResults
      )
    })

    it('never shows the modal, even after the timeout', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      act(() => {
        vi.advanceTimersByTime(3500)
      })

      expect(
        screen.queryByTestId('iframe-datashare-modal')
      ).not.toBeInTheDocument()
    })

    it('does not lock the body scroll', () => {
      render(<IframeDataShareModal computedResults={mockComputedResults} />)

      expect(document.body.style.overflow).not.toBe('hidden')
    })
  })
})
