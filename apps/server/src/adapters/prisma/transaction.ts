import { prisma } from './client.js'
import type { Prisma } from './generated.js'

export type Session = Prisma.TransactionClient

export type RequestOptionsOrThrow = { session: Session; orThrow: true }
export type RequestOptionsOrNull = { session: Session; orThrow?: false }

export type RequestOptions = RequestOptionsOrNull | RequestOptionsOrThrow

export type FetchEntityResponse<
  T,
  Options extends RequestOptions,
> = Options extends RequestOptionsOrThrow ? Promise<T> : Promise<T | null>

export const transaction = <R>(
  cb: (prisma: Session) => Promise<R>,
  session?: Session
): Promise<R> => {
  return (session ? cb(session) : prisma.$transaction(cb)) as Promise<R>
}
