import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { describe, test } from 'vitest'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { ExternalServiceTypeEnum } from '../integrations.validator.ts'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/integrations/v1/:externalService'
  const userId = faker.string.uuid()
  const email = faker.internet.email()

  describe('When requesting if partner is valid', () => {
    describe('And invalid external service parameter', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .set(authHeaders({ userId, email }))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe.each([
      {
        externalService: ExternalServiceTypeEnum.agir,
        features: {
          hasEndSimulationRedirection: true,
          hasPossibleSituationExport: false,
        },
      },
      {
        externalService: ExternalServiceTypeEnum['2-tonnes'],
        features: {
          hasEndSimulationRedirection: false,
          hasPossibleSituationExport: true,
        },
      },
    ])(
      'And $externalService external service',
      ({ features, externalService }) => {
        test(`Then it returns a ${StatusCodes.OK} response`, async () => {
          await agent
            .get(url.replace(':externalService', externalService))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.OK)
            .expect(features)
        })
      }
    )
  })
})
