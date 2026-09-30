import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../factories/user.factory.ts'
import type { AgeRange } from '../../types/age-range.ts'
import {
  createOrUpdateUser,
  findUserById,
  findVerifiedUserByEmail,
} from '../users.repository.ts'

const generateEmail = () => faker.internet.email().toLocaleLowerCase()

// The users table's email column is deprecated and no repository read
// exposes it: the raw query is the only way to assert the write never
// touches it.
const readUserEmailColumn = async (id: string) => {
  const row = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  })

  return row?.email
}

const countVerifiedRecords = (id: string) =>
  prisma.verifiedUser.count({ where: { id } })

// Legacy unverified user: unverified, but with an email set on the user table.
const createLegacyUserWithEmail = async (email: string) => {
  const id = faker.string.uuid()

  await prisma.user.create({
    data: { id, email, name: faker.person.fullName() },
  })

  return { id, email }
}

describe('createOrUpdateUser', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  describe('Given the user does not exist yet', () => {
    it('creates a bare unverified user, without a verified record', async () => {
      const id = faker.string.uuid()

      const user = await createOrUpdateUser({ type: 'unverified', id })

      expect(user).toEqual({
        type: 'unverified',
        id,
        name: null,
        email: null,
        ageRange: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
      expect(await findUserById(id)).toEqual(user)
      expect(await readUserEmailColumn(id)).toBeNull()
      expect(await countVerifiedRecords(id)).toBe(0)
    })

    it('creates an unverified user carrying its profile fields', async () => {
      const id = faker.string.uuid()
      const name = faker.person.fullName()
      const ageRange: AgeRange = 'age_25_34'

      await createOrUpdateUser({ type: 'unverified', id, name, ageRange })

      expect(await findUserById(id)).toMatchObject({
        type: 'unverified',
        id,
        name,
        ageRange,
        email: null,
      })
      expect(await countVerifiedRecords(id)).toBe(0)
    })

    it('creates a verified user with its verified record, email only on the verified record', async () => {
      const id = faker.string.uuid()
      const email = generateEmail()
      const name = faker.person.fullName()
      const ageRange: AgeRange = 'age_35_49'
      const telephone = faker.phone.number()
      const position = faker.person.jobTitle()

      const user = await createOrUpdateUser({
        type: 'verified',
        id,
        email,
        name,
        ageRange,
        telephone,
        position,
        optedInForCommunications: true,
      })

      expect(user).toEqual({
        type: 'verified',
        id,
        name,
        email,
        ageRange,
        telephone,
        position,
        optedInForCommunications: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
      expect(await findUserById(id)).toEqual(user)
      expect(await findVerifiedUserByEmail({ email })).toEqual(user)
      expect(await countVerifiedRecords(id)).toBe(1)
      expect(await readUserEmailColumn(id)).toBeNull()
    })

    it('creates a verified user from an email alone, contact fields at their defaults', async () => {
      const id = faker.string.uuid()
      const email = generateEmail()

      const user = await createOrUpdateUser({ type: 'verified', id, email })

      expect(user).toMatchObject({
        type: 'verified',
        id,
        email,
        name: null,
        ageRange: null,
        telephone: null,
        position: null,
        optedInForCommunications: false,
      })
      expect(await findVerifiedUserByEmail({ email })).toEqual(user)
      expect(await readUserEmailColumn(id)).toBeNull()
    })
  })

  describe('Given the unverified user exists', () => {
    it('preserves the fields the write does not carry', async () => {
      const user = await userFactory
        .unverified()
        .create({ name: faker.person.fullName(), ageRange: 'age_18_24' })

      await createOrUpdateUser({ type: 'unverified', id: user.id })

      expect(await findUserById(user.id)).toMatchObject({
        name: user.name,
        ageRange: user.ageRange,
        email: null,
      })
    })

    it('clears the fields explicitly set to null', async () => {
      const user = await userFactory
        .unverified()
        .create({ name: faker.person.fullName(), ageRange: 'age_18_24' })

      await createOrUpdateUser({
        type: 'unverified',
        id: user.id,
        name: null,
        ageRange: null,
      })

      expect(await findUserById(user.id)).toMatchObject({
        name: null,
        ageRange: null,
      })
    })

    it('updates the fields the write carries', async () => {
      const user = await userFactory.unverified().create()
      const name = faker.person.fullName()
      const ageRange: AgeRange = 'over_65'

      await createOrUpdateUser({
        type: 'unverified',
        id: user.id,
        name,
        ageRange,
      })

      expect(await findUserById(user.id)).toMatchObject({ name, ageRange })
    })

    it('leaves a legacy users-table email untouched', async () => {
      const { id, email } = await createLegacyUserWithEmail(generateEmail())

      await createOrUpdateUser({ type: 'unverified', id })

      // The deprecated column is never written, so the legacy value stays.
      expect(await readUserEmailColumn(id)).toBe(email)
      expect(await findUserById(id)).toMatchObject({
        type: 'unverified',
        email: null,
      })
    })

    it('keeps the creation date of the existing row', async () => {
      const user = await userFactory.unverified().create()

      const before = await findUserById(user.id)
      await createOrUpdateUser({
        type: 'unverified',
        id: user.id,
        name: faker.person.fullName(),
      })

      expect((await findUserById(user.id))?.createdAt).toEqual(
        before?.createdAt
      )
    })
  })

  describe('Given the verified user exists', () => {
    it('updates the user row and the verified record together', async () => {
      const user = await userFactory.verified().create()
      const name = faker.person.fullName()
      const ageRange: AgeRange = 'age_50_64'
      const telephone = faker.phone.number()
      const position = faker.person.jobTitle()
      const optedInForCommunications = !user.optedInForCommunications

      await createOrUpdateUser(
        {
          type: 'verified',
          id: user.id,
          email: user.email,
          name,
          ageRange,
          telephone,
          position,
          optedInForCommunications,
        },
        { session: prisma }
      )

      expect(await findUserById(user.id)).toMatchObject({
        name,
        ageRange,
        email: user.email,
      })
      expect(
        await findVerifiedUserByEmail({ email: user.email })
      ).toMatchObject({
        name,
        telephone,
        position,
        optedInForCommunications,
      })
    })

    it('preserves the fields the write does not carry', async () => {
      const user = await userFactory
        .verified()
        .create({ name: faker.person.fullName(), ageRange: 'age_25_34' })

      await createOrUpdateUser({
        type: 'verified',
        id: user.id,
        email: user.email,
      })

      expect(await findUserById(user.id)).toMatchObject({
        name: user.name,
        ageRange: user.ageRange,
        email: user.email,
      })
      expect(
        await findVerifiedUserByEmail({ email: user.email })
      ).toMatchObject({
        name: user.name,
        telephone: user.telephone,
        position: user.position,
        optedInForCommunications: user.optedInForCommunications,
      })
    })

    it('clears the fields explicitly set to null', async () => {
      const user = await userFactory
        .verified()
        .create({ name: faker.person.fullName(), ageRange: 'age_25_34' })

      await createOrUpdateUser({
        type: 'verified',
        id: user.id,
        email: user.email,
        name: null,
        ageRange: null,
        telephone: null,
        position: null,
      })

      expect(await findUserById(user.id)).toMatchObject({
        name: null,
        ageRange: null,
      })
      expect(
        await findVerifiedUserByEmail({ email: user.email })
      ).toMatchObject({
        name: null,
        telephone: null,
        position: null,
      })
    })

    it('renames the verified record on an email change instead of creating a second one', async () => {
      const user = await userFactory.verified().create()
      const newEmail = generateEmail()

      await createOrUpdateUser({
        type: 'verified',
        id: user.id,
        email: newEmail,
      })

      expect(await findVerifiedUserByEmail({ email: user.email })).toBeNull()
      expect(await findVerifiedUserByEmail({ email: newEmail })).toMatchObject({
        id: user.id,
        email: newEmail,
      })
      expect(await countVerifiedRecords(user.id)).toBe(1)
      // The users-table column is not updated either: it keeps the value
      // the row already carried.
      expect(await readUserEmailColumn(user.id)).toBe(user.email)
    })

    it('keeps a single verified record when the email is unchanged', async () => {
      const user = await userFactory.verified().create()

      await createOrUpdateUser({
        type: 'verified',
        id: user.id,
        email: user.email,
      })

      expect(await countVerifiedRecords(user.id)).toBe(1)
    })

    it('leaves the verified record untouched on an unverified write', async () => {
      const user = await userFactory.verified().create()

      await createOrUpdateUser({ type: 'unverified', id: user.id })

      expect(
        await findVerifiedUserByEmail({ email: user.email })
      ).toMatchObject({
        name: user.name,
        telephone: user.telephone,
        position: user.position,
        optedInForCommunications: user.optedInForCommunications,
      })
      expect(await readUserEmailColumn(user.id)).toBe(user.email)
    })
  })

  describe('Given the unverified user is verified by a later write', () => {
    it('creates the verified record without writing the users-table email', async () => {
      const user = await userFactory
        .unverified()
        .create({ name: faker.person.fullName(), ageRange: 'age_25_34' })
      const email = generateEmail()

      await createOrUpdateUser({ type: 'verified', id: user.id, email })

      expect(await findUserById(user.id)).toMatchObject({
        type: 'verified',
        name: user.name,
        ageRange: user.ageRange,
        email,
      })
      expect(await findVerifiedUserByEmail({ email })).toMatchObject({
        id: user.id,
        email,
        telephone: null,
        position: null,
        optedInForCommunications: false,
      })
      expect(await countVerifiedRecords(user.id)).toBe(1)
      expect(await readUserEmailColumn(user.id)).toBeNull()
    })
  })

  describe('Given the write is a full user read back from the database', () => {
    it('persists the aggregate unchanged', async () => {
      const created = await userFactory.verified().create({
        name: faker.person.fullName(),
        ageRange: 'age_35_49',
      })
      const user = await findUserById(created.id)
      expect(user?.type).toBe('verified')
      if (user?.type !== 'verified') return

      await createOrUpdateUser(user)

      // The timestamps are the database's: only the carried fields are
      // compared, an update bumping `updatedAt` by design.
      expect(await findUserById(created.id)).toMatchObject({
        type: user.type,
        id: user.id,
        name: user.name,
        email: user.email,
        ageRange: user.ageRange,
        telephone: user.telephone,
        position: user.position,
        optedInForCommunications: user.optedInForCommunications,
      })
      expect(await countVerifiedRecords(created.id)).toBe(1)
    })
  })
})
