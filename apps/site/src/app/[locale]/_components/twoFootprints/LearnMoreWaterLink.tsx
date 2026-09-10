'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'

export default function LearnMoreWaterLink() {
  return (
    <Link href="/empreinte-eau" className="text-[13px] md:text-base">
      <Trans>En savoir plus sur l'empreinte eau</Trans>
    </Link>
  )
}
