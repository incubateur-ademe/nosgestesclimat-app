'use client'

import FootprintSelector from '@/components/footprints/FootprintSelector'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

/**
 * La métrique vit dans l'URL.
 *
 * Le serveur peut ainsi rendre le bon bloc — le graphique, l'accordéon et les
 * actions ne s'affichent qu'en empreinte carbone — au lieu de faire transiter
 * tout ce HTML par les props d'un composant client.
 */
export default function GroupFootprintSelector({
  metric,
}: {
  metric: Metrics
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const selectMetric = (selected: Metrics) => {
    const query = new URLSearchParams(searchParams)

    query.set('metric', selected)

    startTransition(() => {
      router.replace(`${pathname}?${query}`, { scroll: false })
    })
  }

  return (
    <FootprintSelector footprintSelected={metric} onChange={selectMetric} />
  )
}
