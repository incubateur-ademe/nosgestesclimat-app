import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { organisationFactory } from '../../factories/organisation.factory.ts'
import { isOrganisationAdministrator } from '../is-organisation-administrator.service.ts'

describe('isOrganisationAdministrator', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('returns true for the administrator of the organisation', async () => {
    const user = await userFactory.verified().create()
    const organisation = await organisationFactory
      .withAdministrator(user.email)
      .create()

    const result = await isOrganisationAdministrator({
      organisationSlug: organisation.slug,
      userEmail: user.email,
    })

    expect(result).toBe(true)
  })

  it('returns false for an email that administrates nothing', async () => {
    const organisation = await organisationFactory.create()

    const result = await isOrganisationAdministrator({
      organisationSlug: organisation.slug,
      userEmail: faker.internet.email().toLocaleLowerCase(),
    })

    expect(result).toBe(false)
  })

  it('returns false for an administrator of another organisation', async () => {
    const user = await userFactory.verified().create()
    await organisationFactory.withAdministrator(user.email).create()
    const otherOrganisation = await organisationFactory.create()

    const result = await isOrganisationAdministrator({
      organisationSlug: otherOrganisation.slug,
      userEmail: user.email,
    })

    expect(result).toBe(false)
  })

  it('returns false for an unknown organisation slug', async () => {
    const user = await userFactory.verified().create()

    const result = await isOrganisationAdministrator({
      organisationSlug: 'does-not-exist',
      userEmail: user.email,
    })

    expect(result).toBe(false)
  })
})
