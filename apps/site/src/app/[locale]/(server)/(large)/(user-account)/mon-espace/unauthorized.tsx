import { redirect } from 'next/navigation'

export default function UnauthorizedPage() {
  redirect('/connexion')
}
