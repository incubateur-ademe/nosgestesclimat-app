import type { Prisma, User } from '../../adapters/prisma/generated.ts'
import { defaultUserSelection } from '../../adapters/prisma/selection.ts'
import type {
  FetchEntityResponse,
  RequestOptions,
  RequestOptionsOrNull,
  Session,
} from '../../adapters/prisma/transaction.ts'
import type { PartialVerifiedUser } from '../../core/types/user.ts'

export {
  transferOwnershipToUser,
  transferSimulationsFromUser,
} from '@nosgestesclimat/core/features/users/repositories/ownership-transfer.repository'

export const fetchUser = <
  Select extends Prisma.UserSelect = { id: true },
  Options extends RequestOptions = RequestOptionsOrNull,
>(
  { id, select = { id: true } as Select }: { id: string; select?: Select },
  { session, orThrow }: Options
): FetchEntityResponse<Prisma.UserGetPayload<{ select: Select }>, Options> => {
  const method = orThrow
    ? session.user.findUniqueOrThrow
    : session.user.findUnique

  return method({
    where: {
      id,
    },
    select,
  }) as FetchEntityResponse<Prisma.UserGetPayload<{ select: Select }>, Options>
}

export const fetchVerifiedUser = <
  Select extends Prisma.VerifiedUserSelect = { id: true },
  Options extends RequestOptions = RequestOptionsOrNull,
>(
  {
    email,
    select = { id: true } as Select,
  }: { email: string; select?: Select },
  { session, orThrow }: Options
): FetchEntityResponse<
  Prisma.VerifiedUserGetPayload<{ select: Select }>,
  Options
> => {
  const method = orThrow
    ? session.verifiedUser.findUniqueOrThrow
    : session.verifiedUser.findUnique

  return method({
    where: {
      email,
    },
    select,
  }) as FetchEntityResponse<
    Prisma.VerifiedUserGetPayload<{ select: Select }>,
    Options
  >
}

export const fetchUsersForEmail = (
  { email }: Pick<PartialVerifiedUser, 'email'>,
  { session }: { session: Session }
) => {
  return session.user.findMany({
    where: {
      email,
    },
    select: defaultUserSelection,
  })
}

export const createOrUpdateUser = async <
  Select extends Prisma.UserSelect = { id: true },
>(
  {
    id,
    user: { email, name, ageRange, createdAt, updatedAt },
    select = { id: true } as Select,
  }: {
    id: string
    user: Partial<User>
    select?: Select
  },
  { session }: { session: Session }
) => {
  const existingUser = await fetchUser({ id }, { session })

  const user = existingUser
    ? await session.user.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          ageRange,
          updatedAt,
          createdAt,
        },
        select,
      })
    : await session.user.create({
        data: {
          id,
          name,
          email,
          ageRange,
          updatedAt,
          createdAt,
        },
        select,
      })

  return {
    user,
    created: !existingUser,
    updated: !!existingUser,
  }
}

type VerifiedUserPayload = {
  email?: string | undefined
  name?: string | null | undefined
  position?: string | null | undefined
  telephone?: string | null | undefined
  optedInForCommunications?: boolean | undefined
  ageRange?: User['ageRange'] | undefined
}

export const createOrUpdateVerifiedUser = async <
  Select extends Prisma.VerifiedUserSelect = { id: true },
>(
  {
    id: { id, email },
    user: {
      email: newEmail,
      name,
      position,
      telephone,
      optedInForCommunications,
      ageRange,
    },
    select = { email: true } as Select,
  }: {
    id: PartialVerifiedUser
    user: VerifiedUserPayload
    select?: Select
  },
  { session }: { session: Session }
) => {
  const existingUser = await fetchVerifiedUser({ email }, { session })
  const userData = { name, position, telephone, optedInForCommunications }

  // The VerifiedUser.id -> User.id FK requires the User row to exist before
  // the VerifiedUser row is created/updated. We therefore upsert the User
  // first and only then touch the VerifiedUser (no more Promise.all race).
  await createOrUpdateUser(
    {
      id,
      user: {
        email: newEmail || email,
        name: userData.name,
        ageRange,
      },
    },
    { session }
  )

  const user = existingUser
    ? await session.verifiedUser.update({
        where: {
          email,
        },
        data: {
          id,
          ...userData,
          ...(newEmail ? { email: newEmail } : {}),
        },
        select,
      })
    : await session.verifiedUser.create({
        data: {
          id,
          email: newEmail || email,
          ...userData,
        },
        select,
      })

  return {
    user,
    created: !existingUser,
    updated: !!existingUser,
  }
}
