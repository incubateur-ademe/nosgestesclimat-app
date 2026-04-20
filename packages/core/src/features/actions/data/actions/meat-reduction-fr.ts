import type { ActionFile } from '../../types/action.js'
import { foodFr } from '../themes/index.js'

export const meatReduction: ActionFile = {
  id: 'c99b8fc3-67e5-4fdb-8239-00306692c10a',
  language: 'fr',
  title: 'Réduire le poids de la viande dans son empreinte carbone',
  themeId: foodFr.id,
  ruleId: '',
  longDescription: `Depuis plusieurs dizaines d’années, nos habitudes alimentaires ont changé.

Notre alimentation est plus diversifiée, mais aussi *plus riche en graisses, en sucre et en protéines animales* (la consommation de viande a augmenté de 50% depuis les années 70). Ces dernières, en particulier, pèsent très lourd sur notre *empreinte carbone individuelle*… une empreinte portée presque intégralement par la phase de *production de l’aliment* (et non de transformation, ou de transport ou de distribution).
  `,
  media: {
    type: 'impact_co2',
    data: {
      type: 'repas',
    },
    title: "L'impact carbone des différents types de repas",
  },
  means: `Les *recommandations de Santé Publique France* sont les suivantes :

- *Viande* : maximum 3 à 4 portions par semaine (steak, blanc ou cuisse de poulet, rôti de porc…)
- *Charcuterie* : maximum 150 g / semaine (à peu près 3 tranches de jambon blanc)
- *Poisson* : maximum 2 repas / semaine

Plus que jamais, *végétaliser notre alimentation est un objectif essentiel pour les prochaines années.*`,
  furtherReading:
    'Ces aliments ne pèsent pas que sur le climat. La forte hausse de la consommation de produits d’origine animale a des *conséquences fâcheuses sur notre santé* : elle favorise par exemple le diabète, et le cancer colorectal. Apprenez-en plus sur les liens entre santé et planète en parcourant le dossier de l’ADEME [Comment préserver sa santé et la planète.](https://librairie.ademe.fr/air/6260-comment-preserver-sa-sante-et-la-planete--9791029721076.html)',
}
