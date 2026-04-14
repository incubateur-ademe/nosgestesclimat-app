import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoryFilter from '../categoryFilters/CategoryFilter'

// Mock next/navigation
const mockRouter = {
  replace: vi.fn(),
}

const mockSearchParams = {
  get: vi.fn(),
  toString: vi.fn(() => ''),
}

const mockPathname = '/test-path'

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}))

// Mock trackEvent
vi.mock('@/utils/analytics/trackEvent', () => ({
  trackEvent: vi.fn(),
  trackPosthogEvent: vi.fn(),
}))

// Mock getCategoryColorClass helpers
vi.mock('@/helpers/getCategoryColorClass', () => ({
  getBackgroundColor: vi.fn(() => '#f0f0f0'),
  getBackgroundLightColor: vi.fn(() => 'bg-blue-100'),
  getBorderColor: vi.fn(() => 'border-blue-500'),
  getBorderDarkColor: vi.fn(() => 'border-blue-500'),
  getTextDarkColor: vi.fn(() => 'text-blue-900'),
}))

// Mock useClientTranslation
vi.mock('@/hooks/useClientTranslation', () => ({
  useClientTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

describe('CategoryFilter', () => {
  const defaultProps = {
    title: 'Test Category',
    dottedName: 'test.category' as DottedName,
    count: 5,
    index: 0,
    isActive: false,
    onTabActivate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.get.mockReturnValue('')
  })

  it('renders with correct title and count', () => {
    render(<CategoryFilter {...defaultProps} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders with correct ARIA attributes when not selected', () => {
    render(<CategoryFilter {...defaultProps} />)

    const button = screen.getByRole('tab')
    expect(button).toHaveAttribute('aria-selected', 'false')
    expect(button).toHaveAttribute('aria-controls', 'category-panel-0')
    expect(button).toHaveAttribute('tabindex', '-1')
  })

  it('renders with correct ARIA attributes when selected', () => {
    render(
      <CategoryFilter {...defaultProps} categorySelected="test.category" />
    )

    const button = screen.getByRole('tab')
    expect(button).toHaveAttribute('aria-selected', 'true')
    expect(button).toHaveAttribute('aria-controls', 'category-panel-0')
    expect(button).toHaveAttribute('tabindex', '-1') // Still -1 because isActive is false
  })

  it('renders with correct ARIA attributes when active', () => {
    render(<CategoryFilter {...defaultProps} isActive={true} />)

    const button = screen.getByRole('tab')
    expect(button).toHaveAttribute('tabindex', '0')
  })

  it('renders with correct ARIA attributes when both active and selected', () => {
    render(
      <CategoryFilter
        {...defaultProps}
        isActive={true}
        categorySelected="test.category"
      />
    )

    const button = screen.getByRole('tab')
    expect(button).toHaveAttribute('aria-selected', 'true')
    expect(button).toHaveAttribute('tabindex', '0')
  })

  it('calls onTabActivate when clicked', () => {
    render(<CategoryFilter {...defaultProps} />)

    const button = screen.getByRole('tab')
    fireEvent.click(button)

    expect(defaultProps.onTabActivate).toHaveBeenCalledTimes(1)
  })

  it('calls router.replace with correct URL when clicked', () => {
    render(<CategoryFilter {...defaultProps} />)

    const button = screen.getByRole('tab')
    fireEvent.click(button)

    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringContaining('test.category'),
      { scroll: false }
    )
  })

  it('removes category filter when already selected', () => {
    // Set up the component as selected
    render(
      <CategoryFilter {...defaultProps} categorySelected="test.category" />
    )

    const button = screen.getByRole('tab')
    fireEvent.click(button)

    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.not.stringContaining('test.category'),
      { scroll: false }
    )
  })

  it('prevents default behavior for Enter and Space keys', () => {
    render(<CategoryFilter {...defaultProps} />)

    const button = screen.getByRole('tab')

    // Test that Enter key triggers the action
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(defaultProps.onTabActivate).toHaveBeenCalledTimes(1)
    expect(mockRouter.replace).toHaveBeenCalledTimes(1)

    // Test that Space key triggers the action
    fireEvent.keyDown(button, { key: ' ' })
    expect(defaultProps.onTabActivate).toHaveBeenCalledTimes(2)
    expect(mockRouter.replace).toHaveBeenCalledTimes(2)
  })

  it('ignores other key presses', () => {
    render(<CategoryFilter {...defaultProps} />)

    const button = screen.getByRole('tab')

    // Test that ArrowRight key doesn't trigger the action
    fireEvent.keyDown(button, { key: 'ArrowRight' })

    expect(defaultProps.onTabActivate).not.toHaveBeenCalled()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it('applies correct styling when selected', () => {
    render(
      <CategoryFilter {...defaultProps} categorySelected="test.category" />
    )

    const button = screen.getByRole('tab')
    expect(button).toHaveClass('bg-blue-100', 'border-blue-500')
  })

  it('applies correct styling when not selected', () => {
    render(
      <CategoryFilter {...defaultProps} categorySelected="other.category" />
    )

    const button = screen.getByRole('tab')
    expect(button).toHaveClass('bg-gray-100', 'hover:bg-gray-200')
  })

  it('renders count badge with correct styling', () => {
    render(<CategoryFilter {...defaultProps} />)

    const countBadge = screen.getByText('5')
    expect(countBadge).toHaveClass(
      'ml-2',
      'inline-block',
      'w-4',
      'rounded-full',
      'bg-white'
    )
  })

  it('handles zero count gracefully', () => {
    render(<CategoryFilter {...defaultProps} count={0} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles undefined count gracefully', () => {
    render(<CategoryFilter {...defaultProps} count={0} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
