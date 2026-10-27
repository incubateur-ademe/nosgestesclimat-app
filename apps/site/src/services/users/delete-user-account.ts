'use server'
import { ForbiddenError, UnauthorizedError } from '@/helpers/server/error'
import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { redirect } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'

export async function deleteUserAccount() {
  const session = await getUserSession()

  if (!session) {
    throw new UnauthorizedError()
  }

  if (!session.isAuth) {
    throw new ForbiddenError()
  }

  await deleteUser(session.id)

  redirect('/')
}
