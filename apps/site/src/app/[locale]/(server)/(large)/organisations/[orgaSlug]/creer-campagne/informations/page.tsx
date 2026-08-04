import { COLLECTIVE_TEST_INFORMATIONS_PATH } from '@/constants/urls/paths'
import { redirect } from 'next/navigation'

export default function CreerCampagneInformationsRedirectPage() {
  redirect(COLLECTIVE_TEST_INFORMATIONS_PATH)
}
