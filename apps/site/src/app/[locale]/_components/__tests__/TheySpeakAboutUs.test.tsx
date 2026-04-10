import { mswServer } from '@/__tests__/server'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeAll, describe, expect, it } from 'vitest'
import TheySpeakAboutUs from '../TheySpeakAboutUs'

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

describe('TheySpeakAboutUs component', () => {
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
    // When
    render(
      await TheySpeakAboutUs({
        locale: 'fr',
      })
    )

    // Then
    // The categories are displayed
    // The partners are displayed
    expect(screen.queryAllByTestId('partner-theyspeakaboutus')).toHaveLength(2)
  })
})
