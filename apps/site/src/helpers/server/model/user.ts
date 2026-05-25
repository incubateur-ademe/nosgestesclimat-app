import { USER_URL } from '@/constants/urls/main'
import { fetchServer } from '../fetchServer'

interface UserServer {
  id: string
  email: string
}

export interface AuthUser extends UserServer {
  isAuth: true
}

export async function getAuthUser(): Promise<AuthUser> {
  const user = await fetchServer<UserServer>(`${USER_URL}/me`)
  return {
    ...user,
    isAuth: true,
  }
}

export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const user = await fetchServer<UserServer>(`${USER_URL}/me`)
    return !!user
  } catch {
    return false
  }
}
