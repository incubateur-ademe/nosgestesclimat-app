'use client'

import Loader from '@/design-system/layout/Loader'
import Emoji from '@/design-system/utils/Emoji'
import Trans from '../translation/trans/TransClient'

export default function PollLoader() {
  return (
    <div className="py-12 text-center">
      <Loader color="dark" className="mb-8" />
      <p>
        <Trans>Nous récupérons les données du test collectif...</Trans>
      </p>
      <p className="text-sm text-gray-700">
        <Trans>
          (Cela peut durer quelques dizaines de secondes pour les tests avec un
          grand nombre de participants ! Merci pour votre patience.)
        </Trans>{' '}
        <Emoji>🙏</Emoji>
      </p>
    </div>
  )
}
