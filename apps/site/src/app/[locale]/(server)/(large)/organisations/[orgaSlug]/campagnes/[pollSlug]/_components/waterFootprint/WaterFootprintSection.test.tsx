import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WaterFootprintSection from './WaterFootprintSection'

describe('WaterFootprintSection', () => {
  const defaultProps = {
    meanWaterFootprintLitresPerDay: 6151.4,
    simulationsCount: 5,
  }

  it('renders nothing when simulationsCount < 3', () => {
    render(<WaterFootprintSection {...defaultProps} simulationsCount={2} />)
    expect(screen.queryByTestId('water-footprint-section')).toBeNull()
  })

  it('renders nothing when value <= 0', () => {
    render(
      <WaterFootprintSection
        {...defaultProps}
        meanWaterFootprintLitresPerDay={0}
      />
    )
    expect(screen.queryByTestId('water-footprint-section')).toBeNull()
  })

  it('renders the section when simulationsCount >= 3 and value > 0', () => {
    render(<WaterFootprintSection {...defaultProps} />)
    expect(screen.getByTestId('water-footprint-section')).toBeInTheDocument()
  })

  it('renders the formatted value with thousand separator', () => {
    render(<WaterFootprintSection {...defaultProps} />)
    expect(screen.getByText('6 151')).toBeInTheDocument()
  })

  it('renders the unit', () => {
    render(<WaterFootprintSection {...defaultProps} />)
    expect(screen.getByText('litres / jour')).toBeInTheDocument()
  })

  it('renders the body with bold words', () => {
    render(<WaterFootprintSection {...defaultProps} />)
    expect(screen.getByText('biens et services').tagName).toBe('STRONG')
    expect(screen.getByText('3 000').tagName).toBe('STRONG')
    expect(screen.getByText('9 000').tagName).toBe('STRONG')
  })

  it('renders the "En savoir plus" link with target=_blank', () => {
    render(
      <WaterFootprintSection
        {...defaultProps}
        learnMoreHref="/blog/environnement/lexique-eau-tout-comprendre"
      />
    )
    const link = screen.getByRole('link', { name: 'En savoir plus' })
    expect(link).toHaveAttribute(
      'href',
      '/blog/environnement/lexique-eau-tout-comprendre'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the water waves background SVG', () => {
    render(<WaterFootprintSection {...defaultProps} />)
    expect(screen.getByTestId('water-waves-background')).toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="water-waves-background"] svg')
    ).toBeInTheDocument()
  })
})
