import { Prisma } from './generated/client.ts'

// See https://www.prisma.io/docs/orm/reference/error-reference
export const PrismaErrorCodes = {
  NotFound: 'P2025',
  UniqueConstraintFailed: 'P2002',
  ForeignKeyConstraintFailed: 'P2003',
  InconsistentColumnData: 'P2023',
} as const

export type PrismaErrorCode =
  (typeof PrismaErrorCodes)[keyof typeof PrismaErrorCodes]

export const isPrismaError = (
  error: unknown,
  code: PrismaErrorCode
): error is Prisma.PrismaClientKnownRequestError & { code: typeof code } =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
