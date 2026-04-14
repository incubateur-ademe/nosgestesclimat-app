'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import { useRules } from '@/hooks/useRules'

export default function ModeleStatsBlock() {
  const { data: rules } = useRules({
    isOptim: false,
  })

  if (!rules) return <p>Chargement du modèle...</p>

  const numberOfRules = Object.keys(rules).length
  const numberOfQuestions = Object.values(rules).filter(
    (el) => el?.question
  ).length

  const NumberOfRules = () => <span>{numberOfRules}</span>
  const NumberOfQuestions = () => <span>{numberOfQuestions}</span>

  return (
    <div>
      <p>
        <Trans i18nKey={'model.stats'}>
          Le modèle comprend aujourd'hui <NumberOfRules /> règles de calcul.
          Parmi elles, <NumberOfQuestions /> règles sont des questions à poser à
          l'utilisateur pour calculer un résultat précis.
        </Trans>
      </p>
      <p>
        <Trans i18nKey={'model.questions'}>
          Découvrez{' '}
          <Link href="/questions">
            la liste des questions disponibles dans le modèle
          </Link>
          .
        </Trans>
      </p>
    </div>
  )
}
