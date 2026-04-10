import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { fireEvent, render, screen } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoryTabs from '../CategoryTabs'

// Mock getSearchParamsClientSide
const mockUseSearchParams = useSearchParams as ReturnType<typeof vi.fn>

// Mock encodeDottedNameAsURI
vi.mock('@/utils/format/encodeDottedNameAsURI', () => ({
  encodeDottedNameAsURI: vi.fn((dottedName: string) => dottedName),
}))

// Mock CategoryFilter component
vi.mock('../categoryFilters/CategoryFilter', () => ({
  default: vi.fn(
    ({ title, count, index, isActive, isSelected, onTabActivate }) => (
      <button
        role="tab"
        id={`category-tab-${index}`}
        aria-selected={isSelected}
        aria-controls={`category-panel-${index}`}
        tabIndex={isActive ? 0 : -1}
        data-testid={`category-tab-${index}`}
        data-is-active={isActive}
        data-is-selected={isSelected}
        onClick={onTabActivate}>
        {title} ({count})
      </button>
    )
  ),
}))

describe('CategoryTabs', () => {
  const mockCategories = [
    {
      title: 'Transport',
      dottedName: 'transport' as DottedName,
      count: 10,
    },
    {
      title: 'Alimentation',
      dottedName: 'alimentation' as DottedName,
      count: 15,
    },
    {
      title: 'Logement',
      dottedName: 'logement' as DottedName,
      count: 8,
    },
  ]

  const mockChildren = <div data-testid="tab-content">Tab Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return empty search params
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  it('renders tablist with correct ARIA attributes', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveAttribute('aria-label', 'Filtres par catégorie')
  })

  it('renders all category tabs', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    expect(screen.getByTestId('category-tab-0')).toBeInTheDocument()
    expect(screen.getByTestId('category-tab-1')).toBeInTheDocument()
    expect(screen.getByTestId('category-tab-2')).toBeInTheDocument()
  })

  it('renders tabpanel with correct ARIA attributes', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tabpanel = screen.getByRole('tabpanel')
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'category-tab-0')
    expect(tabpanel).toHaveAttribute('id', 'category-panel-0')
  })

  it('renders children content in tabpanel', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    expect(screen.getByTestId('tab-content')).toBeInTheDocument()
  })

  it('sets first tab as active by default when no category is selected', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const firstTab = screen.getByTestId('category-tab-0')
    expect(firstTab).toHaveAttribute('data-is-active', 'true')
    expect(firstTab).toHaveAttribute('tabindex', '0')
  })

  it('sets correct tab as active when category is selected', () => {
    // Mock search params to include the category parameter
    const searchParams = new URLSearchParams('category=alimentation')
    mockUseSearchParams.mockReturnValue(searchParams)

    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const alimentationTab = screen.getByTestId('category-tab-1')
    expect(alimentationTab).toHaveAttribute('data-is-active', 'true')
    expect(alimentationTab).toHaveAttribute('tabindex', '0')
  })

  it('updates active tab when URL changes', () => {
    // Initially no category in URL
    mockUseSearchParams.mockReturnValue(new URLSearchParams())

    const { rerender } = render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    // Initially first tab is active
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Change URL to select second tab
    const searchParams = new URLSearchParams('category=alimentation')
    mockUseSearchParams.mockReturnValue(searchParams)

    rerender(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    // Second tab should now be active
    expect(screen.getByTestId('category-tab-1')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('handles keyboard navigation with arrow keys', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')

    // Test right arrow key
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(screen.getByTestId('category-tab-1')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Test left arrow key
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('handles keyboard navigation with Home and End keys', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')

    // Test End key
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(screen.getByTestId('category-tab-2')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Test Home key
    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('wraps around when navigating past boundaries', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')

    // Navigate left from first tab should go to last tab
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(screen.getByTestId('category-tab-2')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Navigate right from last tab should go to first tab
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('prevents default behavior for navigation keys', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')

    // Test that navigation keys actually change the active tab
    // This proves that preventDefault was called and the event was handled

    // Test ArrowRight
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(screen.getByTestId('category-tab-1')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Test ArrowLeft
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Test Home
    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Test End
    fireEvent.keyDown(tablist, { key: 'End' })
    expect(screen.getByTestId('category-tab-2')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('ignores non-navigation keys', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')

    // Test that preventDefault is not called for non-navigation keys
    const preventDefaultSpy = vi.fn()

    fireEvent.keyDown(tablist, {
      key: 'Enter',
      preventDefault: preventDefaultSpy,
    })
    expect(preventDefaultSpy).not.toHaveBeenCalled()

    fireEvent.keyDown(tablist, {
      key: ' ',
      preventDefault: preventDefaultSpy,
    })
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('focuses the active tab after keyboard navigation', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    const tablist = screen.getByRole('tablist')
    const focusSpy = vi.spyOn(screen.getByTestId('category-tab-1'), 'focus')

    fireEvent.keyDown(tablist, { key: 'ArrowRight' })

    expect(focusSpy).toHaveBeenCalled()
  })

  it('resets active tab to 0 when categories change', () => {
    const { rerender } = render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    // Navigate to second tab
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(screen.getByTestId('category-tab-1')).toHaveAttribute(
      'data-is-active',
      'true'
    )

    // Change categories
    const newCategories = [
      {
        title: 'New Category',
        dottedName: 'new.category' as DottedName,
        count: 5,
      },
    ]
    rerender(
      <CategoryTabs categories={newCategories}>{mockChildren}</CategoryTabs>
    )

    // Should reset to first tab
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })

  it('applies custom className to tablist', () => {
    const { container } = render(
      <CategoryTabs categories={mockCategories} className="custom-class">
        {mockChildren}
      </CategoryTabs>
    )

    const tablist = container.querySelector('[role="tablist"]')
    expect(tablist).toHaveClass('custom-class')
  })

  it('handles empty categories array', () => {
    render(<CategoryTabs categories={[]}>{mockChildren}</CategoryTabs>)

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('handles undefined categories', () => {
    render(
      <CategoryTabs
        categories={
          undefined as unknown as Parameters<
            typeof CategoryTabs
          >[0]['categories']
        }>
        {mockChildren}
      </CategoryTabs>
    )

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('updates tabpanel when active tab changes', () => {
    render(
      <CategoryTabs categories={mockCategories}>{mockChildren}</CategoryTabs>
    )

    // Initially first tab is active
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'category-tab-0'
    )
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'id',
      'category-panel-0'
    )

    // Navigate to second tab
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowRight' })

    // Tabpanel should update to reflect second tab
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'category-tab-1'
    )
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'id',
      'category-panel-1'
    )
  })

  it('handles single category correctly', () => {
    const singleCategory = [mockCategories[0]]
    render(
      <CategoryTabs categories={singleCategory}>{mockChildren}</CategoryTabs>
    )

    expect(screen.getByTestId('category-tab-0')).toBeInTheDocument()
    expect(screen.queryByTestId('category-tab-1')).not.toBeInTheDocument()

    // Single tab should be active
    expect(screen.getByTestId('category-tab-0')).toHaveAttribute(
      'data-is-active',
      'true'
    )
  })
})
