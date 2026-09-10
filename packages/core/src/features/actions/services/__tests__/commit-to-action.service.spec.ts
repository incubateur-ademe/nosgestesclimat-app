import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'

describe('commitToAction()', () => {
  afterEach(async () => {
    await prisma.action.deleteMany()
    await prisma.actionChoice.deleteMany()
    await prisma.user.deleteMany()
  })
  it('creates a new action choice for a given user', () => {
    expect(false).toBe(true)
  })

  it('throws when an invalid userId is pass as an argument', () => {
    expect(false).toBe(true)
  })

  it('throws when an invalid actionId is pass as an argument', () => {
    expect(false).toBe(true)
  })

  it('throws when an action choice is already created for a user', () => {
    expect(false).toBe(true)
  })
})
