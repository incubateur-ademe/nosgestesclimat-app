'use client'
import Trans from '../translation/trans/TransClient'

export default function Baseline() {
  return (
    <p>
      <strong className="text-secondary-700">
        <Trans>Entreprises</Trans>
      </strong>
      ,{' '}
      <strong className="text-secondary-700">
        <Trans>collectivités</Trans>
      </strong>
      ,{' '}
      <strong className="text-secondary-700">
        <Trans>associations</Trans>
      </strong>
      ,{' '}
      <strong className="text-secondary-700">
        <Trans>écoles</Trans>
      </strong>{' '}
      ou encore{' '}
      <strong className="text-secondary-700">
        <Trans>festivals</Trans>
      </strong>
       :{' '}
      <Trans>
        vous souhaitez lancer une campagne Nos Gestes Climat et sensibiliser
        toutes vos parties prenantes ? Découvrez nos outils 100% gratuits !
      </Trans>
    </p>
  )
}
