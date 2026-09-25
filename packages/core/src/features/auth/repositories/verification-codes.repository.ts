import type { Transaction } from '../../../lib/transaction.ts'
import type {
  Prisma,
  VerificationCode,
  VerificationCodeMode,
  VerificationCodeUsage,
} from '../../../prisma/generated/client.ts'

type SignVerificationCode = {
  id: string
  email: string
  mode: VerificationCodeMode
}

type RegisterOrganisationVerificationCode = {
  id: string
  email: string
  mode?: undefined
}

type RegisterApiVerificationCode = {
  id: string
  email: string
  mode?: undefined
}

export type UserVerificationCode =
  | SignVerificationCode
  | RegisterOrganisationVerificationCode
  | RegisterApiVerificationCode

export const createUserVerificationCode = (
  data: Prisma.VerificationCodeCreateInput & {
    /** Feature the code validates in: a code created for one usage never validates in another. */
    usage: VerificationCodeUsage
  },
  { session }: { session: Transaction }
) => {
  return session.verificationCode.create({
    data,
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      expirationDate: true,
    },
  })
}

export const findVerificationCode = (
  { email, code, usage }: Pick<VerificationCode, 'email' | 'code' | 'usage'>,
  { session }: { session: Transaction }
): Promise<UserVerificationCode> => {
  return session.verificationCode.findFirstOrThrow({
    where: {
      code,
      email,
      usage,
      expirationDate: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      mode: true,
    },
  }) as Promise<UserVerificationCode>
}

/**
 * Atomically claims a verification code: the row is invalidated only while it
 * is still valid (non-expired) and issued for the given usage. A `true`
 * return means this caller won the claim - the code is single-use, and any
 * concurrent or later claim on the same row finds it already expired. The
 * atomic conditional update makes the claim race-free by construction: no
 * read-then-write gap exists for a concurrent request to slip through.
 */
export const claimVerificationCode = async (
  { id, usage }: Pick<VerificationCode, 'id' | 'usage'>,
  { session }: { session: Transaction }
): Promise<boolean> => {
  const now = new Date()
  const { count } = await session.verificationCode.updateMany({
    where: {
      id,
      usage,
      expirationDate: {
        gte: now,
      },
    },
    data: {
      expirationDate: new Date(now.getTime() - 1),
    },
  })

  return count === 1
}

export const invalidateVerificationCode = (
  { id }: Pick<VerificationCode, 'id'>,
  { session }: { session: Transaction }
) => {
  return session.verificationCode.update({
    where: { id },
    data: {
      expirationDate: new Date(Date.now() - 1),
    },
  })
}
