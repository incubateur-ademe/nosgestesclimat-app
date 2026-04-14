import QRCode from '@/components/sharing/QRCode'
import { captureDownloadPollQRCode } from '@/constants/tracking/posthogTrackers'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock react-qr-code
vi.mock('react-qr-code', () => ({
  default: ({
    value,
    'data-testid': testId,
    ...props
  }: {
    value: string
    'data-testid': string
    [key: string]: unknown
  }) => (
    <svg data-testid={testId} {...props}>
      <text>QR Code for: {value}</text>
    </svg>
  ),
}))

// Mock JSZip
vi.mock('jszip', () => ({
  default: vi.fn(function () {
    return {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob(['mock-zip-content'])),
    }
  }),
}))

// Mock trackEvent
vi.mock('@/utils/analytics/trackEvent', () => ({
  trackEvent: vi.fn(),
  trackPosthogEvent: vi.fn(),
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'mock-object-url')
const mockRevokeObjectURL = vi.fn()

// Preserve the URL constructor but mock the static methods
const OriginalURL = globalThis.URL

Object.defineProperty(global, 'URL', {
  value: class URL extends OriginalURL {
    static createObjectURL = mockCreateObjectURL
    static revokeObjectURL = mockRevokeObjectURL
  },
  writable: true,
})

describe('QRCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the QR code container with correct test ID', () => {
    render(<QRCode value="https://example.com" />)

    const container = screen.getByTestId('qrcode-container')
    expect(container).toBeInTheDocument()
  })

  it('renders the QR code wrapper with correct test ID', () => {
    render(<QRCode value="https://example.com" />)

    const wrapper = screen.getByTestId('qrcode-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders the QR code SVG with correct test ID', () => {
    render(<QRCode value="https://example.com" />)

    const svg = screen.getByTestId('qrcode-svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveTextContent('QR Code for: https://example.com')
  })

  it('passes the correct value to the QR code component', () => {
    const testValue = 'https://test-url.com'
    render(<QRCode value={testValue} />)

    const svg = screen.getByTestId('qrcode-svg')
    expect(svg).toHaveTextContent(`QR Code for: ${testValue}`)
  })

  it('tracks download event when download button is clicked', async () => {
    // Mock the necessary DOM APIs for the download functionality
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        scale: vi.fn(),
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low',
      })),
      toBlob: vi.fn((callback) =>
        callback(new Blob(['mock-png']), 'image/png', 1.0)
      ),
    }

    const mockDownloadLink = {
      download: '',
      href: '',
      click: vi.fn(),
    }

    const mockImage = {
      onload: null as (() => void) | null,
      src: '',
    }

    // Store original createElement
    const originalCreateElement = document.createElement

    // Mock document.createElement
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement
      }
      if (tagName === 'a') {
        return mockDownloadLink as unknown as HTMLAnchorElement
      }
      if (tagName === 'img') {
        return mockImage as HTMLImageElement
      }
      return originalCreateElement.call(document, tagName)
    })

    // Mock XMLSerializer
    global.XMLSerializer = vi.fn(function () {
      return {
        serializeToString: vi.fn(() => '<svg>mock-svg</svg>'),
      }
    }) as unknown as typeof XMLSerializer

    // Mock getBoundingClientRect
    const mockRect = { width: 100, height: 100 }
    Element.prototype.getBoundingClientRect = vi.fn(() => mockRect as DOMRect)

    render(<QRCode value="https://example.com" />)

    const button = screen.getByTestId('qrcode-download-button')
    fireEvent.click(button)

    // Trigger the image onload callback
    if (mockImage.onload) {
      mockImage.onload()
    }

    // Wait for async operations
    await vi.runAllTimersAsync()

    expect(trackPosthogEvent).toHaveBeenCalledWith(captureDownloadPollQRCode)

    // Restore original createElement
    document.createElement = originalCreateElement
  })

  it('creates zip file with both SVG and PNG when download is clicked', async () => {
    const JSZip = (await import('jszip')).default
    const mockZipInstance = {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob(['mock-zip-content'])),
    }
    ;(
      JSZip as unknown as {
        mockImplementation: (fn: () => typeof mockZipInstance) => void
      }
    ).mockImplementation(function () {
      return mockZipInstance
    })

    // Mock the necessary DOM APIs
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        scale: vi.fn(),
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low',
      })),
      toBlob: vi.fn((callback) =>
        callback(new Blob(['mock-png']), 'image/png', 1.0)
      ),
    }

    const mockDownloadLink = {
      download: '',
      href: '',
      click: vi.fn(),
    }

    const mockImage = {
      onload: null as (() => void) | null,
      src: '',
    }

    // Store original createElement
    const originalCreateElement = document.createElement

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas')
        return mockCanvas as unknown as HTMLCanvasElement
      if (tagName === 'a')
        return mockDownloadLink as unknown as HTMLAnchorElement
      if (tagName === 'img') return mockImage as HTMLImageElement
      return originalCreateElement.call(document, tagName)
    })

    global.XMLSerializer = vi.fn(function () {
      return {
        serializeToString: vi.fn(() => '<svg>mock-svg</svg>'),
      }
    }) as unknown as typeof XMLSerializer

    const mockRect = { width: 100, height: 100 }
    Element.prototype.getBoundingClientRect = vi.fn(() => mockRect as DOMRect)

    render(<QRCode value="https://example.com" />)

    const button = screen.getByTestId('qrcode-download-button')
    fireEvent.click(button)

    // Trigger the image onload callback
    if (mockImage.onload) {
      mockImage.onload()
    }

    await vi.runAllTimersAsync()

    // Check that JSZip was instantiated
    expect(JSZip).toHaveBeenCalled()

    // Check that SVG file was added to zip
    expect(mockZipInstance.file).toHaveBeenCalledWith(
      'qrcode.svg',
      '<svg>mock-svg</svg>'
    )

    // Check that PNG blob was added to zip
    expect(mockZipInstance.file).toHaveBeenCalledWith(
      'qrcode.png',
      expect.any(Blob)
    )

    // Check that zip was generated and downloaded
    expect(mockZipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' })
    expect(mockDownloadLink.download).toBe('qrcode.zip')
    expect(mockDownloadLink.click).toHaveBeenCalled()

    // Restore original createElement
    document.createElement = originalCreateElement
  })

  it('handles canvas context creation failure gracefully', () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null), // Return null to simulate context creation failure
    }

    // Store original createElement
    const originalCreateElement = document.createElement

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas')
        return mockCanvas as unknown as HTMLCanvasElement
      return originalCreateElement.call(document, tagName)
    })

    global.XMLSerializer = vi.fn(function () {
      return {
        serializeToString: vi.fn(() => '<svg>mock-svg</svg>'),
      }
    }) as unknown as typeof XMLSerializer

    render(<QRCode value="https://example.com" />)

    const button = screen.getByTestId('qrcode-download-button')

    // This should not throw an error
    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()

    // The tracking event is called before the context check, so it will be called
    // This is the actual behavior of the component
    expect(trackPosthogEvent).toHaveBeenCalledWith(captureDownloadPollQRCode)

    // Restore original createElement
    document.createElement = originalCreateElement
  })

  it('does not download when QR code wrapper ref is null', () => {
    render(<QRCode value="https://example.com" />)

    const button = screen.getByTestId('qrcode-download-button')

    // Mock the wrapper element to return null for querySelector
    const wrapper = screen.getByTestId('qrcode-wrapper')
    Object.defineProperty(wrapper, 'querySelector', {
      value: vi.fn(() => null),
      writable: true,
    })

    const createElementSpy = vi.spyOn(document, 'createElement')

    fireEvent.click(button)

    expect(createElementSpy).not.toHaveBeenCalledWith('canvas')
    expect(trackPosthogEvent).not.toHaveBeenCalled()
  })

  it('does not download when SVG element is not found', () => {
    render(<QRCode value="https://example.com" />)

    const button = screen.getByTestId('qrcode-download-button')

    // Mock the wrapper element to return null for querySelector
    const wrapper = screen.getByTestId('qrcode-wrapper')
    Object.defineProperty(wrapper, 'querySelector', {
      value: vi.fn(() => null),
      writable: true,
    })

    const createElementSpy = vi.spyOn(document, 'createElement')

    fireEvent.click(button)

    expect(createElementSpy).not.toHaveBeenCalledWith('canvas')
    expect(trackPosthogEvent).not.toHaveBeenCalled()
  })

  it('has correct SVG attributes', () => {
    render(<QRCode value="https://example.com" />)

    const svg = screen.getByTestId('qrcode-svg')
    expect(svg).toHaveStyle({
      height: 'auto',
      maxWidth: '100%',
      width: '200px',
      background: 'white',
    })
  })
})
