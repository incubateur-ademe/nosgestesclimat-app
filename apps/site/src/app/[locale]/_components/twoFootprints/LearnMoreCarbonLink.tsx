'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'

export default function LearnMoreCarbonLink() {
  return (
    <Link href="/empreinte-carbone" className="text-[13px] md:text-base">
      <Trans>En savoir plus sur l'empreinte carbone</Trans>
    </Link>
  )
}
