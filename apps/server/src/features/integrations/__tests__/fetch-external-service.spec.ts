import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { describe, test } from 'vitest'
import app from '../../../app.js'
import { ExternalServiceTypeEnum } from '../integrations.validator.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/integrations/v1/:externalService'

  describe('When requesting if partner is valid', () => {
    describe('And invalid external service parameter', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent.get(url).expect(StatusCodes.BAD_REQUEST)
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
            .expect(StatusCodes.OK)
            .expect(features)
        })
      }
    )
  })
})
