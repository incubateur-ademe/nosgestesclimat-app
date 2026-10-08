import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type {
  Prisma,
  VerificationCodeUsage,
} from '../../../prisma/generated/client.ts'
import type { VerificationCode } from '../types/verification-code.ts'

const verificationCodeSelect = {
  id: true,
  email: true,
  usage: true,
  code: true,
  expirationDate: true,
} as const

export const createVerificationCode = async (
  data: Prisma.VerificationCodeCreateInput & {
    /** Feature the code validates in: a code created for one usage never validates in another. */
    usage: VerificationCodeUsage
  },
  { session = prisma }: { session?: Transaction } = {}
) => {
  await session.verificationCode.create({
    data,
    select: {
      id: true,
    },
  })
}

export const findValidVerificationCode = async (
  { email, code, usage }: Pick<VerificationCode, 'email' | 'code' | 'usage'>,
  { session = prisma }: { session?: Transaction } = {}
): Promise<VerificationCode | null> => {
  return session.verificationCode.findFirst({
    where: {
      code,
      email,
      usage,
      expirationDate: {
        gte: new Date(),
      },
    },
    select: verificationCodeSelect,
  })
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
  { session = prisma }: { session?: Transaction } = {}
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
