import type {
  FetchEntityResponse,
  RequestOptions,
  RequestOptionsOrNull,
  Transaction,
} from '../../../lib/transaction.ts'
import type { Prisma } from '../../../prisma/generated/client.ts'
import type { PartialVerifiedUser } from '../types/user.ts'
import { createOrUpdateUser } from './users.repository.ts'

export const defaultVerifiedUserSelection = {
  id: true,
  name: true,
  email: true,
  position: true,
  telephone: true,
  optedInForCommunications: true,
  createdAt: true,
  updatedAt: true,
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

type VerifiedUserPayload = {
  email?: string | undefined
  name?: string | null | undefined
  position?: string | null | undefined
  telephone?: string | null | undefined
  optedInForCommunications?: boolean | undefined
  ageRange?: Prisma.UserModel['ageRange'] | undefined
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
  { session }: { session: Transaction }
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
