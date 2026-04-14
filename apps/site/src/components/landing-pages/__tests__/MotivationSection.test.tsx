import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import MotivationSection from '../MotivationSection'

// Mock next/image to render a simple img for testing
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src?: string
    alt?: string
    width?: number
    height?: number
    [key: string]: unknown
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img alt="" {...props} />,
}))

describe('MotivationSection', () => {
  const baseProps = {
    title: 'Test Title',
    description: 'This is a <b>test</b> description.',
  }

  const motivationItems = [
    {
      title: 'Item 1',
      icon: {
        url: '/icon1.png',
        alternativeText: 'Icon 1',
      },
      description: 'Description 1',
    },
    {
      title: 'Item 2',
      icon: {
        url: '/icon2.png',
        alternativeText: 'Icon 2',
      },
      description: 'Description 2',
    },
  ]

  it('renders the section, title, separator, and string description', () => {
    render(<MotivationSection {...baseProps} />)

    expect(screen.getByTestId('motivation-section')).toBeInTheDocument()
    expect(screen.getByTestId('motivation-title')).toHaveTextContent(
      'Test Title'
    )
    expect(screen.getByTestId('motivation-separator')).toBeInTheDocument()
    expect(screen.getByTestId('motivation-description').innerHTML).toContain(
      'This is a <b>test</b> description.'
    )
    expect(screen.queryByTestId('motivation-list')).not.toBeInTheDocument()
  })

  it('renders JSX description', () => {
    render(
      <MotivationSection
        {...baseProps}
        description={<span data-testid="jsx-desc">JSX description</span>}
      />
    )
    expect(screen.getByTestId('motivation-description')).toBeInTheDocument()
    expect(screen.getByTestId('jsx-desc')).toBeInTheDocument()
    expect(screen.getByTestId('motivation-description')).toHaveTextContent(
      'JSX description'
    )
  })

  it('renders motivation items list and all items', () => {
    render(
      <MotivationSection {...baseProps} motivationItems={motivationItems} />
    )

    expect(screen.getByTestId('motivation-list')).toBeInTheDocument()
    motivationItems.forEach((item, idx) => {
      expect(screen.getByTestId(`motivation-item-${idx}`)).toBeInTheDocument()
      expect(screen.getByTestId(`motivation-icon-${idx}`)).toBeInTheDocument()
      expect(
        screen.getByTestId(`motivation-item-title-${idx}`)
      ).toHaveTextContent(item.title)
      expect(
        screen.getByTestId(`motivation-item-description-${idx}`)
      ).toHaveTextContent(item.description)
      // Check the icon img
      const img = screen
        .getByTestId(`motivation-icon-${idx}`)
        .querySelector('img')
      expect(img).toHaveAttribute('src', item.icon.url)
      expect(img).toHaveAttribute('alt', item.icon.alternativeText)
    })
  })

  it('renders nothing for motivationItems if empty array', () => {
    render(<MotivationSection {...baseProps} motivationItems={[]} />)
    expect(screen.queryByTestId('motivation-list')).not.toBeInTheDocument()
  })
})
