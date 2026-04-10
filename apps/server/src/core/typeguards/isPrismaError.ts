import { Prisma } from '../../../prisma/generated/prisma/client.js'
import { PrismaErrorCodes } from '../../adapters/prisma/constant.js'

const isPrismaError = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError =>
  err instanceof Prisma.PrismaClientKnownRequestError

export const isPrismaErrorNotFound = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: PrismaErrorCodes.NotFound
} => isPrismaError(err) && err.code === PrismaErrorCodes.NotFound

export const isPrismaErrorForeignKeyConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: PrismaErrorCodes.ForeignKeyConstraintFailed
} =>
  isPrismaError(err) && err.code === PrismaErrorCodes.ForeignKeyConstraintFailed

export const isPrismaErrorUniqueConstraintFailed = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: PrismaErrorCodes.UniqueConstraintFailed
} => isPrismaError(err) && err.code === PrismaErrorCodes.UniqueConstraintFailed

export const isPrismaErrorInconsistentColumnData = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError & {
  code: PrismaErrorCodes.InconsistentColumnData
} => isPrismaError(err) && err.code === PrismaErrorCodes.InconsistentColumnData
