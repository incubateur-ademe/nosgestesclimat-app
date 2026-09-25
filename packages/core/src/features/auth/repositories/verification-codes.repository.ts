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
