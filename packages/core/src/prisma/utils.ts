import { Prisma } from './generated/client.ts'

// See https://www.prisma.io/docs/orm/reference/error-reference
const PrismaErrorCodes = {
  NotFound: 'P2025',
  UniqueConstraintFailed: 'P2002',
  ForeignKeyConstraintFailed: 'P2003',
  InconsistentColumnData: 'P2023',
} as const

type PrismaErrorCode = (typeof PrismaErrorCodes)[keyof typeof PrismaErrorCodes]

const isPrismaError = (
  error: unknown,
  code: PrismaErrorCode
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code

export const isPrismaErrorNotFound = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.NotFound
} => isPrismaError(err, PrismaErrorCodes.NotFound)

export const isPrismaErrorUniqueConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.UniqueConstraintFailed
} => isPrismaError(err, PrismaErrorCodes.UniqueConstraintFailed)

export const isPrismaErrorForeignKeyConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.ForeignKeyConstraintFailed
} => isPrismaError(err, PrismaErrorCodes.ForeignKeyConstraintFailed)

export const isPrismaErrorInconsistentColumnData = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.InconsistentColumnData
} => isPrismaError(err, PrismaErrorCodes.InconsistentColumnData)
