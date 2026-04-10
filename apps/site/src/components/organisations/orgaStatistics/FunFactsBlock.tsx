'use client'

import type { DottedName, FunFacts } from '@incubateur-ademe/nosgestesclimat'
import { twMerge } from 'tailwind-merge'
import FunFactsItem from './funFacts/FunFactsItem'

const defaultFunFactsRules: { [k in keyof Partial<FunFacts>]: DottedName } = {
  percentageOfBicycleUsers: 'ui . organisations . transport . roule en vélo',
  percentageOfVegetarians: 'ui . organisations . alimentation . est végétarien',
  percentageOfCarOwners: 'ui . organisations . transport . roule en voiture',
}

export default function FunFactsBlock({
  funFacts,
  className,
}: {
  funFacts?: FunFacts | null
  className?: string
}) {
  if (!funFacts) return null

  return (
    <section className={twMerge('flex flex-col justify-center', className)}>
      <div className="flex flex-row flex-wrap justify-center gap-8 md:gap-16">
        {Object.entries(defaultFunFactsRules).map(
          ([funFactKey, dottedName]) => (
            <FunFactsItem
              key={funFactKey}
              funFactKey={funFactKey}
              dottedName={dottedName}
              funFacts={funFacts}
            />
          )
        )}
      </div>
    </section>
  )
}
