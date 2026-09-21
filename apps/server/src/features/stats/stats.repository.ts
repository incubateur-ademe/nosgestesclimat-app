import type { ListIds } from '../../adapters/brevo/constant.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'

export const createNewsLetterStats = (
  {
    listId,
    subscriptions,
    date,
  }: { listId: ListIds; subscriptions: number; date: Date },
  { session }: { session: Session }
) => {
  return session.brevoNewsletterStats.create({
    data: {
      date,
      newsletter: listId,
      subscriptions,
    },
  })
}
