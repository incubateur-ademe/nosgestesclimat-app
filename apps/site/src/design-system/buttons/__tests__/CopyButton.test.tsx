import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CopyButton from '../CopyButton'

const DUMMY_TEXT = 'copy this'

describe('CopyButton', () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('should copy text to clipboard when clicked', async () => {
    //Given
    const writeTextMock = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()

    render(<CopyButton textToCopy={DUMMY_TEXT} />)

    // When
    await userEvent.click(screen.getByRole('button'))

    // Then
    expect(writeTextMock).toHaveBeenCalledWith(DUMMY_TEXT)
  })
})
