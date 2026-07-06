import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'

export default async function Page() {
  await requireAuthUser({ redirect: '/amis/creer/connexion' })
  redirect('/amis/creer/votre-groupe')
}
