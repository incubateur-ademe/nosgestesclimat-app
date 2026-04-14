import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import StatsContent from './_components/StatsContent'

export const generateMetadata = getCommonMetadata({
  title: t("Nos Statistiques d'utilisation - Nos Gestes Climat"),
  description: t(
    "Observez l'évolution de l'impact de Nos Gestes Climat en mesures chiffrées."
  ),
  alternates: {
    canonical: '/stats',
  },
})

export default function Dashboard() {
  return <StatsContent />
}
