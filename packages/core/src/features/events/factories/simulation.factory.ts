import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

class SimulationFactory extends Factory<{
  id: string
  date: Date
  progression: number
  computedResults: object
  actionChoices: object
  situation: object
  createdAt: Date
}> {}

export const simulationFactory = SimulationFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.simulation.create({
      data: {
        id: data.id,
        date: data.date,
        progression: data.progression,
        computedResults: data.computedResults,
        actionChoices: data.actionChoices,
        situation: data.situation,
        createdAt: data.createdAt,
      },
    })
    return data
  })

  return {
    id: faker.string.uuid(),
    date: new Date(),
    progression: 1,
    computedResults: {},
    actionChoices: {},
    situation: {},
    createdAt: new Date(),
  }
})
