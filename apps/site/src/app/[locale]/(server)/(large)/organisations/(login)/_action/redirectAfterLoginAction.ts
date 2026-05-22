import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { redirect } from 'next/navigation'

export async function redirectAfterLogin() {
  'use server'
  const organisation = await getUserOrganisation()
  if (!organisation) {
    redirect('/organisations/creer')
  }
  redirect(`/organisations/${organisation.slug}`)
}
