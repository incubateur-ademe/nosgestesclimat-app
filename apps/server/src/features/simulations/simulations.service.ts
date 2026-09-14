import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import dayjs from 'dayjs'
import * as v from 'valibot'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import type { PartialUser } from '../../core/types/user.ts'
import type { OrganisationPollCustomAdditionalQuestion } from '../organisations/organisations.validator.ts'
import { carbonMetric, waterMetric } from './simulation.constant.ts'
import {
  batchPollSimulations,
  softDeleteSimulation as softDeleteSimulationFunc,
} from './simulations.repository.ts'
import { type SimulationParams } from './simulations.validator.ts'

export const softDeleteSimulation = async ({
  params,
  user,
}: {
  params: SimulationParams
  user: PartialUser
}) => {
  const simulation = await transaction(
    (session) =>
      softDeleteSimulationFunc(
        { simulationId: params.simulationId, userId: user.id },
        { session }
      ),
    prisma
  )

  if (!simulation) {
    throw new EntityNotFoundException('Simulation not found')
  }
}

const EXCEL_ERROR = '#####'

export const getPollSimulationsExcelData = async (
  {
    id,
    customAdditionalQuestions,
  }: {
    id: string
    customAdditionalQuestions: OrganisationPollCustomAdditionalQuestion[]
  },
  session: { session: Session }
) => {
  const data = []

  for await (const { simulation } of batchPollSimulations(
    {
      id,
      batchSize: 1000,
      select: {
        date: true,
        computedResults: true,
        progression: true,
        additionalQuestionsAnswers: {
          select: {
            key: true,
            answer: true,
          },
        },
      },
    },
    session
  )) {
    if (simulation.progression !== 1) {
      continue
    }
    const computedResults = v.safeParse(
      ComputedResultsSchema,
      simulation.computedResults
    )

    const line = {}

    if (computedResults.issues) {
      Object.assign(line, {
        date: dayjs(simulation.date).format('DD/MM/YYYY'),
        'total carbone': EXCEL_ERROR,
        'transport carbone': EXCEL_ERROR,
        'alimentation carbone': EXCEL_ERROR,
        'logement carbone': EXCEL_ERROR,
        'divers carbone': EXCEL_ERROR,
        'services sociétaux carbone': EXCEL_ERROR,
        'total eau': EXCEL_ERROR,
        'transport eau': EXCEL_ERROR,
        'alimentation eau': EXCEL_ERROR,
        'logement eau': EXCEL_ERROR,
        'divers eau': EXCEL_ERROR,
        'services sociétaux eau': EXCEL_ERROR,
      })
    } else {
      const carbon = computedResults.output[carbonMetric]
      const water = computedResults.output[waterMetric]
      Object.assign(line, {
        date: dayjs(simulation.date).format('DD/MM/YYYY'),
        'total carbone': Math.round(carbon.bilan),
        'transport carbone': Math.round(carbon.categories.transport),
        'alimentation carbone': Math.round(carbon.categories.alimentation),
        'logement carbone': Math.round(carbon.categories.logement),
        'divers carbone': Math.round(carbon.categories.divers),
        'services sociétaux carbone': Math.round(
          carbon.categories['services sociétaux']
        ),
        'total eau': Math.round(water.bilan),
        'transport eau': Math.round(water.categories.transport),
        'alimentation eau': Math.round(water.categories.alimentation),
        'logement eau': Math.round(water.categories.logement),
        'divers caeau': Math.round(water.categories.divers),
        'services sociétaux eau': Math.round(
          water.categories['services sociétaux']
        ),
      })
    }

    customAdditionalQuestions.forEach(({ question }) =>
      Object.assign(line, {
        [question]:
          simulation.additionalQuestionsAnswers.find(
            ({ key }) => key === question
          )?.answer ?? '',
      })
    )

    data.push(line)
  }

  return data
}
