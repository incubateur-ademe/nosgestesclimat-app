'use server'
import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { forbidden, redirect, unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'
import { logout } from '../auth/logout'

export async function deleteUserAccount() {
  const session = await getUserSession()

  if (!session) {
    unauthorized()
  }

  if (!session.isAuth) {
    forbidden()
  }

  await deleteUser(session.id)

  await logout()

  redirect('/')
}
