import { isUserAuthenticated } from '@/helpers/server/model/user'
import { redirect } from 'next/navigation'

export default async function Page() {
  if (await isUserAuthenticated()) {
    redirect('/amis/creer/votre-groupe')
  } else {
    redirect('/amis/creer/connexion')
  }
}
