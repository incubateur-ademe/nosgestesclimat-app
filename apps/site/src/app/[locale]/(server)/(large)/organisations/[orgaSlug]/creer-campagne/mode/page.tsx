import { COLLECTIVE_TEST_MODE_PATH } from '@/constants/urls/paths'
import { redirect } from 'next/navigation'

export default function CreerCampagneModeRedirectPage() {
  redirect(COLLECTIVE_TEST_MODE_PATH)
}
