import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import { mapRule } from '../repositories/rule.mapper.ts'
import type { Rule } from '../types/rule.ts'

/** A stored public rule. `create` returns it with the id the database gave. */
export const ruleFactory = Factory.define<Rule>(({ sequence, onCreate }) => {
  onCreate(async ({ name, appliesToWaterMetric }) =>
    mapRule(
      await prisma.rule.create({
        data: { name, appliesToWaterMetric },
        select: {
          id: true,
          name: true,
          appliesToWaterMetric: true,
        },
      })
    )
  )

  return {
    id: sequence,
    name: `footprint . ${faker.lorem.word()} ${sequence}`,
    appliesToWaterMetric: false,
  }
})
