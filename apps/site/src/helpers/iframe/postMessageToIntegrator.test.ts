import { afterEach, describe, expect, it, vi } from 'vitest'
import { postMessageToIntegrator } from './postMessageToIntegrator'

describe('postMessageToIntegrator', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up the global ReactNativeWebView if we added it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).ReactNativeWebView
  })

  it('sends the message to window.parent.postMessage', () => {
    const mockPostMessage = vi.fn()
    window.parent.postMessage = mockPostMessage

    postMessageToIntegrator({ messageType: 'ngc-iframe-share', data: {} })

    expect(mockPostMessage).toHaveBeenCalledTimes(1)
    expect(mockPostMessage).toHaveBeenCalledWith(
      { messageType: 'ngc-iframe-share', data: {} },
      '*'
    )
  })

  it('sends the message to ReactNativeWebView.postMessage when available', () => {
    const mockParentPostMessage = vi.fn()
    window.parent.postMessage = mockParentPostMessage

    const mockRnPostMessage = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).ReactNativeWebView = { postMessage: mockRnPostMessage }

    postMessageToIntegrator({ messageType: 'ngc-iframe-share', data: {} })

    expect(mockRnPostMessage).toHaveBeenCalledTimes(1)
    expect(mockRnPostMessage).toHaveBeenCalledWith(
      JSON.stringify({ messageType: 'ngc-iframe-share', data: {} })
    )
  })

  it('sends to both parent and ReactNativeWebView when both are available', () => {
    const mockParentPostMessage = vi.fn()
    window.parent.postMessage = mockParentPostMessage

    const mockRnPostMessage = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).ReactNativeWebView = { postMessage: mockRnPostMessage }

    postMessageToIntegrator({ messageType: 'ngc-iframe-share', data: {} })

    expect(mockParentPostMessage).toHaveBeenCalledTimes(1)
    expect(mockRnPostMessage).toHaveBeenCalledTimes(1)
  })

  it('does not crash when ReactNativeWebView is not present', () => {
    const mockParentPostMessage = vi.fn()
    window.parent.postMessage = mockParentPostMessage

    expect(() =>
      postMessageToIntegrator({ messageType: 'ngc-iframe-share', data: {} })
    ).not.toThrow()

    expect(mockParentPostMessage).toHaveBeenCalledTimes(1)
  })

  it('does not send to ReactNativeWebView when its postMessage is not a function', () => {
    const mockParentPostMessage = vi.fn()
    window.parent.postMessage = mockParentPostMessage

    // ReactNativeWebView exists but without postMessage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).ReactNativeWebView = {}

    expect(() =>
      postMessageToIntegrator({ messageType: 'ngc-iframe-share', data: {} })
    ).not.toThrow()

    expect(mockParentPostMessage).toHaveBeenCalledTimes(1)
  })
})
