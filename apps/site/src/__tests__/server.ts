import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const mswServer = setupServer(
  // Handler pour l'endpoint de géolocalisation
  http.get('https://localhost:3001/modele/v1/geolocation', () => {
    return HttpResponse.json({
      code: 'FR',
      name: 'France',
      region: 'Europe',
    })
  }),

  // Handler pour les requêtes OPTIONS (CORS preflight)
  http.options('https://localhost:3001/modele/v1/geolocation', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),

  // Handler pour les endpoints d'intégration (partners)
  http.get('https://localhost:3001/integrations/v1/:partner', () => {
    return HttpResponse.json(true)
  }),

  http.post(
    'https://localhost:3001/integrations/v1/:partner/export-situation',
    () => {
      return HttpResponse.json({
        redirectUrl: '/partner-site',
      })
    }
  ),

  // Handler pour les requêtes OPTIONS sur les endpoints d'intégration
  http.options('https://localhost:3001/integrations/v1/:partner', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),

  http.options(
    'https://localhost:3001/integrations/v1/:partner/export-situation',
    () => {
      return new HttpResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
  ),

  // Handler pour l'endpoint CMS des partenaires
  http.get('*/api/partners*', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          attributes: {
            name: 'Partner 1',
            imageSrc: '/partner1.png',
            link: 'https://partner1.com',
            displayOrder: 1,
            displayOnLandingPage: true,
            category: {
              data: {
                id: '1',
                attributes: {
                  category: 'Category 1',
                },
              },
            },
          },
        },
        {
          id: '2',
          attributes: {
            name: 'Partner 2',
            imageSrc: '/partner2.png',
            link: 'https://partner2.com',
            displayOrder: 2,
            displayOnLandingPage: true,
            category: {
              data: {
                id: '2',
                attributes: {
                  category: 'Category 2',
                },
              },
            },
          },
        },
      ],
    })
  })
)
