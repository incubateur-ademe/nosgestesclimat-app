import type { Prisma } from '../../../prisma/generated/client.ts'
import type { NewActionChoice } from '../types/action.ts'

export function mapActionChoiceToPrisma({
  userId,
  actionId,
  type,
}: NewActionChoice): Prisma.ActionChoiceCreateInput {
  return {
    user: { connect: { id: userId } },
    action: { connect: { id: actionId } },
    type,
  }
}
