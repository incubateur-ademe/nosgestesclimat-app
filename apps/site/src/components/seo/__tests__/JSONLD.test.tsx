import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import JSONLD from '../JSONLD'

const getScript = (container: HTMLElement) =>
  container.querySelector('script[type="application/ld+json"]')

describe('JSONLD', () => {
  it('exposes the structured data in the initial markup', () => {
    const { container } = render(<JSONLD jsonLd={[{ '@type': 'WebPage' }]} />)

    expect(JSON.parse(getScript(container)?.textContent ?? '')).toEqual([
      { '@type': 'WebPage' },
    ])
  })

  it('serializes every document of the array', () => {
    const { container } = render(
      <JSONLD
        jsonLd={[{ '@type': 'WebPage' }, { '@type': 'BreadcrumbList' }]}
      />
    )

    expect(JSON.parse(getScript(container)?.textContent ?? '')).toHaveLength(2)
  })

  it('escapes a closing script tag coming from the payload', () => {
    const payload = '</script><script>alert(1)</script>'

    const { container } = render(<JSONLD jsonLd={[{ name: payload }]} />)

    expect(getScript(container)?.innerHTML).not.toContain('</script>')
    expect(JSON.parse(getScript(container)?.textContent ?? '')).toEqual([
      { name: payload },
    ])
  })
})
