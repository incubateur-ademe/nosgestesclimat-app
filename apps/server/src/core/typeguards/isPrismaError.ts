import { Prisma } from '@nosgestesclimat/core/prisma/generated/client'
import { PrismaErrorCodes } from '../../adapters/prisma/constant.ts'

const isPrismaError = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError =>
  err instanceof Prisma.PrismaClientKnownRequestError

export const isPrismaErrorNotFound = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.NotFound
} => isPrismaError(err) && err.code === PrismaErrorCodes.NotFound

export const isPrismaErrorForeignKeyConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.ForeignKeyConstraintFailed
} =>
  isPrismaError(err) && err.code === PrismaErrorCodes.ForeignKeyConstraintFailed

export const isPrismaErrorUniqueConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.UniqueConstraintFailed
} => isPrismaError(err) && err.code === PrismaErrorCodes.UniqueConstraintFailed

export const isPrismaErrorInconsistentColumnData = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: typeof PrismaErrorCodes.InconsistentColumnData
} => isPrismaError(err) && err.code === PrismaErrorCodes.InconsistentColumnData
