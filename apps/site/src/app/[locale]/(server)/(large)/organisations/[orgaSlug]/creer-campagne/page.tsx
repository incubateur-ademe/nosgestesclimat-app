import { redirect } from 'next/navigation'

/* global PageProps */
export default async function CreerCampagnePage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne'>) {
  const { orgaSlug } = await params

  redirect(`/organisations/${orgaSlug}/creer-campagne/informations`)
}
