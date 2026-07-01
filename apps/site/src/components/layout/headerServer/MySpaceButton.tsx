import { logout } from '@/helpers/server/dal/user'
import { getAuthUser } from '@/helpers/server/model/user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import MySpaceDropdown from './mySpaceButton/MySpaceDropdown'

async function logoutAndRedirect() {
  'use server'
  await logout()

  revalidatePath('/', 'layout')
  redirect('/')
}

export default async function MySpaceButton() {
  let user
  try {
    user = await getAuthUser()
  } catch {
    user = undefined
  }

  return <MySpaceDropdown user={user} onLogout={logoutAndRedirect} />
}
