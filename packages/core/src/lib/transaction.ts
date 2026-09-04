import { prisma } from '../prisma/client.ts'
import type { Prisma } from '../prisma/generated/client.ts'

export type Transaction = Prisma.TransactionClient

export const transaction = <R>(
  cb: (prisma: Transaction) => Promise<R>,
  transaction?: Transaction
): Promise<R> => {
  return (transaction ? cb(transaction) : prisma.$transaction(cb)) as Promise<R>
}
