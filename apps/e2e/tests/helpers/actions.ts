import {
  food,
  housing,
  misc,
  societalServices,
  transport,
} from '@nosgestesclimat/core/features/actions/data/themes/index'
import { actionFactory } from '@nosgestesclimat/core/features/actions/factories/action.factory'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { ThemeRow } from '@nosgestesclimat/core/features/actions/types/theme'

interface CatalogueActionDefinition {
  /** `meta.id` of the model rule assessing the action. */
  ruleId: string
  slug: string
  title: string
  theme: ThemeRow
}

/**
 * The action catalogue seeded by `seedActionsCatalogue`, keyed by a short name
 * the specs refer to.
 *
 * Each action is linked to a real rule of the installed model (its `meta.id`),
 * so that the site worker assesses it for a simulation completed through the
 * UI. Titles are written for the tests: unique, and none contained in another,
 * so that they can be matched as accessible names, and free of apostrophes
 * (the site renders typographic ones).
 *
 * The public catalogue highlights three curated slugs: see
 * PUBLIC_HIGHLIGHTED_ACTIONS.
 */
export const CATALOGUE_ACTIONS = {
  reduireViande: {
    ruleId: '62ad3f76-e4d1-4fcc-acdf-0c69a89b03f3',
    slug: 'reduire-viande',
    title: 'Manger moins de viande',
    theme: food,
  },
  limiterAvion: {
    ruleId: '3122683a-e542-4d91-9ea8-fc221ffe2783',
    slug: 'limiter-avion-toutes-distances',
    title: 'Limiter ses trajets en avion',
    theme: transport,
  },
  petitsTrajetsSansVoiture: {
    ruleId: '9ec9c596-7675-470d-a306-1e63d5293aed',
    slug: 'petits-trajets-sans-voiture',
    title: 'Laisser la voiture au garage pour les petits trajets',
    theme: transport,
  },
  ecoconduite: {
    ruleId: '14f89d9a-36b4-4047-8b92-0f829a544512',
    slug: 'ecoconduite',
    title: 'Économiser du carburant en conduisant souplement',
    theme: transport,
  },
  vacancesEnTrain: {
    ruleId: '0a161fc2-5c25-453e-93de-db38c8cbf3d9',
    slug: 'vacances-en-train',
    title: 'Partir en vacances en train',
    theme: transport,
  },
  locationVoiture: {
    ruleId: '1fe0115d-d4fd-4bab-b04b-7bf36a47073d',
    slug: 'location-voiture',
    title: 'Louer ou partager plutôt que posséder un véhicule',
    theme: transport,
  },
  reduireBoissonsSucrees: {
    ruleId: '4425f8fb-a40c-41ed-9f38-294d71d598ab',
    slug: 'reduire-boissons-sucrees',
    title: 'Réduire sa consommation de boissons sucrées',
    theme: food,
  },
  valoriserDechets: {
    ruleId: 'd53531cc-b965-4129-b337-1122f0c0f7db',
    slug: 'valoriser-ses-dechets',
    title: 'Valoriser ses déchets alimentaires',
    theme: food,
  },
  reduireViandeRouge: {
    ruleId: 'ef60db60-7d8d-46f0-96b9-9a0101120dac',
    slug: 'reduire-viande-rouge',
    title: 'Limiter sa consommation de viande rouge',
    theme: food,
  },
  faireDurerSesObjets: {
    ruleId: '6eb1d3fe-785c-4dfc-99b9-438d4aa24e99',
    slug: 'faire-durer-ses-objets',
    title: 'Entretenir et réparer ses objets',
    theme: misc,
  },
  achatReconditionne: {
    ruleId: '7ec479b9-3905-4ea6-b06f-f78e6baaf70a',
    slug: 'achat-reconditionne',
    title: 'Acheter du matériel reconditionné',
    theme: misc,
  },
  engagementAssociatif: {
    ruleId: 'f521de66-58e2-4c6c-8db8-ae7b0ed2af8e',
    slug: 'engagement-associatif',
    title: 'Devenir bénévole dans une association',
    theme: societalServices,
  },
  eviterDeperditionsChaleur: {
    ruleId: 'abaf07c3-59c8-408c-bbd6-755ec90ec10a',
    slug: 'eviter-deperditions-chaleur',
    title: 'Éviter les déperditions de chaleur en hiver',
    theme: housing,
  },
  consommationHeuresCreuses: {
    ruleId: '15ce7f04-1898-4b38-b73e-e4411cc227d5',
    slug: 'consommation-heures-creuses',
    title: 'Utiliser ses appareils électriques en heures creuses',
    theme: housing,
  },
} as const satisfies Record<string, CatalogueActionDefinition>

export type CatalogueActionKey = keyof typeof CATALOGUE_ACTIONS

export type SeededActionsCatalogue = Record<CatalogueActionKey, Action>

/**
 * The public catalogue highlights curated slugs, in this order, whatever
 * their impact or applicability (`get-public-actions-catalogue.service.ts`).
 */
export const PUBLIC_HIGHLIGHTED_ACTIONS = [
  'limiterAvion',
  'petitsTrajetsSansVoiture',
  'reduireViande',
] as const satisfies readonly CatalogueActionKey[]

/**
 * How the worker assesses the catalogue for a simulation answered with the
 * model's defaults only, i.e. every question skipped (`NGCTest.skipAll`).
 * Once its computation is completed, the personalized catalogue
 * (/actions/mes-suggestions) lists the applicable actions only, sorted by
 * impact, and highlights the first three with a numeric impact.
 *
 * Derived from the installed model (@incubateur-ademe/nosgestesclimat): a
 * model upgrade may change it.
 */
export const ASSESSMENT_WITH_MODEL_DEFAULTS = {
  /** « Vos 3 actions clés », in order: the highest numeric impacts. */
  topActions: ['reduireViande', 'ecoconduite', 'faireDurerSesObjets'],
  /**
   * Applicable but not highlighted: listed in the theme sections only (the
   * top actions are listed there too). The first two have a small numeric
   * impact, the others none (« Impact non quantifiable »).
   */
  otherApplicableActions: [
    'reduireBoissonsSucrees',
    'valoriserDechets',
    'vacancesEnTrain',
    'achatReconditionne',
    'engagementAssociatif',
    'eviterDeperditionsChaleur',
    'consommationHeuresCreuses',
  ],
  /** Not applicable or not assessable: hidden from the personalized catalogue. */
  hiddenActions: [
    'limiterAvion',
    'petitsTrajetsSansVoiture',
    'locationVoiture',
    'reduireViandeRouge',
  ],
} as const satisfies Record<string, readonly CatalogueActionKey[]>

/**
 * Seeds the published action catalogue (CATALOGUE_ACTIONS) in the e2e
 * database, which each test starts empty.
 *
 * Only the fields the tests rely on are fixed: the factory still draws the
 * markdown sections of the detail page, and the media is left out so that no
 * page loads third-party content.
 */
export async function seedActionsCatalogue(): Promise<SeededActionsCatalogue> {
  const entries = await Promise.all(
    Object.entries(CATALOGUE_ACTIONS).map(
      async ([key, { ruleId, slug, title, theme }]) => {
        const action = await actionFactory.published().create({
          ruleId,
          slug,
          title,
          trackingId: `action_${slug}`,
          theme: {
            id: theme.id,
            key: theme.key,
            slug: theme.slug,
            trackingId: theme.trackingId,
            title: theme.title,
            emoji: theme.emoji,
          },
          description: `${title}, une action pour le climat.`,
          metadata: {
            title: undefined,
            description: `${title} : pourquoi et comment s'y mettre.`,
            jsonLd: undefined,
          },
          media: undefined,
        })
        return [key, action] as const
      }
    )
  )

  return Object.fromEntries(entries) as SeededActionsCatalogue
}
