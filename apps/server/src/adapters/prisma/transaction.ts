import { prisma } from '@nosgestesclimat/core/prisma/client'
import type { Prisma } from './generated.ts'

export type Session = Prisma.TransactionClient

export const transaction = <R>(
  cb: (prisma: Session) => Promise<R>,
  session?: Session
): Promise<R> => {
  return (session ? cb(session) : prisma.$transaction(cb)) as Promise<R>
}
