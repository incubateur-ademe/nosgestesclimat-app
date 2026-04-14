import { mswServer } from '@/__tests__/server'
import type { DefaultPageProps } from '@/types'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeAll, describe, expect, it } from 'vitest'
import OurPartners from '../page'

const mockPartners = [
  {
    name: 'Partner 1',
    imageSrc: '/partner1.png',
    link: 'https://partner1.com',
    category: { category: 'Category 1' },
    displayOrder: 1,
  },
  {
    name: 'Partner 2',
    imageSrc: '/partner2.png',
    link: 'https://partner2.com',
    category: { category: 'Category 2' },
    displayOrder: 2,
  },
]

describe('OurPartners page', () => {
  beforeAll(() => {
    // Mock des variables d'environnement CMS
    process.env.CMS_URL = 'http://localhost'
    process.env.CMS_TOKEN = 'fake-token'
    mswServer.use(
      http.get('*/api/partners*', () => {
        return HttpResponse.json({
          data: [
            {
              id: '1',

              name: mockPartners[0].name,
              imageSrc: mockPartners[0].imageSrc,
              link: mockPartners[0].link,
              displayOrder: mockPartners[0].displayOrder,
              displayOnLandingPage: true,
              category: {
                category: mockPartners[0].category.category,
                id: '1',
              },
            },
            {
              id: '2',
              name: mockPartners[1].name,
              imageSrc: mockPartners[1].imageSrc,
              link: mockPartners[1].link,
              displayOrder: mockPartners[1].displayOrder,
              displayOnLandingPage: true,
              category: {
                category: mockPartners[1].category.category,
                id: '2',
              },
            },
          ],
        })
      })
    )
  })

  it('should display partners correctly', async () => {
    // Given
    const props = {
      params: Promise.resolve({ locale: 'fr' }),
      searchParams: Promise.resolve({}),
    } satisfies DefaultPageProps

    // When
    render(await OurPartners(props))

    // Then
    // The categories are displayed in h2 tags
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: mockPartners[0].category.category,
      })
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: mockPartners[1].category.category,
      })
    ).toBeInTheDocument()
    // The partners are displayed
    expect(await screen.findByText(mockPartners[0].name)).toBeInTheDocument()
    expect(await screen.findByText(mockPartners[1].name)).toBeInTheDocument()
    // No error alert
    expect(screen.queryByTestId('default-error-alert')).not.toBeInTheDocument()
  })
})
