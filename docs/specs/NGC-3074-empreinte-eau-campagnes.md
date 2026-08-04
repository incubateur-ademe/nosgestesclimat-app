# Spec — NGC-3074 : Section "Empreinte eau" sur la page de résultats des campagnes

> Spec d'implémentation écrite pour un agent de code (LLM moins puissant) à partir de :
> - la carte kanban Notion [NGC-3074](https://app.notion.com/p/accelerateur-transition-ecologique-ademe/Ajouter-une-section-explicative-sur-l-empreinte-eau-sur-la-page-de-r-sultats-des-campagnes-31a6523d57d78096a19aca7ca00d689f) ;
> - les captures Figma (versions **Desktop** et **Mobile**) jointes au ticket ;
> - l'exploration du codebase (Next.js + TS + Tailwind v4 + i18next).

---

## 1. Contexte & problème

Sur la page de résultats d'une campagne (`/organisations/[orgaSlug]/campagnes/[pollSlug]`), un encart visuel affichait autrefois l'empreinte eau moyenne. Suite au ticket « Retirer l'encart visuel des pages de résultats de campagnes collectives », **le chiffre a disparu** alors que les utilisateurs s'attendaient à le voir.

**Objectif** : réintroduire le chiffre de l'empreinte eau moyenne du groupe, mais **dans une section dédiée**, avec :
- plus d'explications (éviter les incompréhensions/frustrations) ;
- un lien « En savoir plus » vers le lexique eau ;
- si possible une **animation sur la vague d'eau** comme dans la version précédente.

---

## 2. Localisation & arborescence à créer / modifier

| Action | Chemin |
|---|---|
| **Créer** le composant section | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/waterFootprint/WaterFootprintSection.tsx` |
| **Créer** le sous-composant de la carte | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/waterFootprint/WaterFootprintCard.tsx` |
| **Créer** le SVG de la vague (utilisé comme background) | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/waterFootprint/WaterWavesBackground.tsx` |
| **Modifier** la page | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/page.tsx` (insertion de la nouvelle section **juste après** `<FootprintDistribution …/>`) |
| **Modifier** les fichiers i18n | `apps/site/src/locales/ui/ui-fr.yaml` **et** `apps/site/src/locales/ui/ui-en.yaml` (ajout des nouvelles clés sous le namespace `pollResults.waterFootprint.*`) |
| **Créer** les tests | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/waterFootprint/WaterFootprintSection.test.tsx` |
| **Créer** les stories Storybook (recommandé) | `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/waterFootprint/WaterFootprintSection.stories.tsx` |

> Convention du repo : préfixe `_` pour les dossiers "private" (Next.js), PascalCase pour les composants.

---

## 3. Modèle de données

### Source de la donnée

Le `bilan` de la métrique `eau` est exprimé en **litres par AN** (le modèle publicodes le divise par 365 pour obtenir le quotidien — voir `formatFootprint` / `shouldDivideBy365`). La valeur affichée est la **moyenne journalière** parmi les participants terminés :

```ts
const simulationsFinished = poll?.simulations?.finished ?? 0
// litres/an → litres/jour
const meanWaterFootprintLitresPerDay =
  (computedResults?.eau?.bilan ?? 0) /
  Math.max(simulationsFinished, 1) /
  365
```

Le type existe déjà dans le codebase :

```ts
// apps/site/src/publicodes-state/types.d.ts
export type ComputedResults = Record<Metric, ComputedResultsFootprint>
// Metric = 'carbone' | 'eau'  (depuis @incubateur-ademe/nosgestesclimat)
```

La maquette affiche `6 151 litres / jour` (litres/jour).

### Formatage

- **Nombre entier arrondi** (Math.round).
- Séparateur de milliers : **espace insécable U+00A0** (cohérent avec le reste de l'app, ex. `NumberFormatter`).
- Exemple : `Math.round(6151.4).toLocaleString('fr-FR')` → `"6 151"`.

> ⚠️ L'agent peut soit utiliser `Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })`, soit un helper existant s'il en trouve un (`@/utils/format/formatNumber`). À privilégier s'il existe.

---

## 4. Props du composant React

```ts
// WaterFootprintSection.tsx
interface Props {
  /** Moyenne de l'empreinte eau du groupe en litres/jour (déjà calculée). */
  meanWaterFootprintLitresPerDay: number
  /** Nombre de participants terminés — sert au gating d'affichage. */
  simulationsCount: number
  /** Préfixe d'URL du lien "En savoir plus" (utile pour les tests/E2E, par défaut '/blog/environnement/lexique-eau-tout-comprendre'). */
  learnMoreHref?: string
  /** Classes utilitaires supplémentaires (rare). */
  className?: string
}
```

Le composant n'a **pas** de directive `"use client"` : il est rendu depuis la page `campagnes/[pollSlug]/page.tsx` qui est déjà `'use client'` (le sous-arbre entier est donc côté client). Il lit des valeurs déjà passées en props et utilise `useLocale()` pour le formatage localisé — même pattern que `FootprintDistribution.tsx` (voisin) et `StatisticsBlocks.tsx`.

---

## 5. Conditions d'affichage

Afficher la section **uniquement si** :

1. `simulationsCount >= 3` (cohérent avec `<FootprintDistribution>` qui a la même règle).
2. `meanWaterFootprintLitresPerDay > 0` (sinon, donnée absente côté serveur).

Si l'une des deux conditions échoue, **rien n'est rendu** (`return null`), sans alternative visible pour ne pas casser la maquette.

---

## 6. Spécifications visuelles

### 6.1 Hiérarchie globale

```
<section>
  <h2>Et à propos de l'empreinte eau ?</h2>
  <Card>            ← carte indigo foncé, rounded-2xl, overflow-hidden, relative
    <WaterWavesBackground />   ← SVG absolu top-right
    <div>                       ← contenu, position: relative, z-index: 1
      <Header>                  ← goutte + chiffre + unité + libellé
      <Body>                    ← paragraphe explicatif
      <CtaButton />             ← bouton "En savoir plus"
    </div>
  </Card>
</section>
```

### 6.2 Conteneur extérieur

```tsx
<section className="mb-8" data-testid="water-footprint-section">
  <h2 className="mb-4">
    <Trans i18nKey="pollResults.waterFootprint.title">
      Et à propos de l'empreinte eau ?
    </Trans>
  </h2>
  <WaterFootprintCard … />
</section>
```

> On suit le pattern existant `<FootprintDistribution>` qui fait `<section className="mb-8"><h2>…</h2>…</section>`.

### 6.3 Carte (WaterFootprintCard)

| Propriété | Valeur |
|---|---|
| `background` | `#3F40B5` (indigo foncé spécifique à cette section — voir palette "eau" plus bas). |
| `border-radius` | `rounded-2xl` (= 1rem). |
| `overflow` | `hidden` (indispensable pour clipper la vague). |
| `position` | `relative`. |
| `padding` mobile | `p-6` (24px). |
| `padding` ≥ md | `md:p-10` (40px). |
| `min-height` mobile | ~ 260px (pour laisser respirer). |

### 6.4 Layout interne

#### Mobile (< 768px)

Stack vertical, gouttière 16px :

```
┌─ Carte (p-6) ─────────────────────┐
│ [💧 goutte  ]   [vague top-right] │
│ 6 151 litres / jour               │
│ — empreinte eau moyenne des       │
│   participants                    │
│                                   │
│ Texte explicatif 3 lignes         │
│                                   │
│           [ En savoir plus ]      │
└───────────────────────────────────┘
```

#### Desktop (≥ 768px)

Layout en grille 12 colonnes :

```
┌─ Carte (md:p-10) ─────────────────────────────────────────────┐
│                                              [vague top-right] │
│  💧 6 151 litres / jour — empreinte eau moyenne des participants
│  Texte explicatif 3 lignes                            [ En savoir plus ] │
└──────────────────────────────────────────────────────────────────┘
```

Implémentation recommandée :

```tsx
<div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end md:gap-8">
  {/* Header : goutte + chiffre + unité + libellé */}
  <div className="flex items-center gap-3 md:col-span-12">
    <WaterDropIcon className="h-7 w-7 fill-white" />
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-4xl font-bold text-white md:text-5xl">
        {/* ex. "6 151" */}
        {formattedValue}
      </span>
      <span className="text-base font-medium text-white/80">
        <Trans i18nKey="pollResults.waterFootprint.unit">
          litres / jour
        </Trans>
      </span>
      <span className="text-base text-white/80 md:ml-2">
        —{' '}
        <Trans i18nKey="pollResults.waterFootprint.averageLabel">
          empreinte eau moyenne des participants
        </Trans>
      </span>
    </p>
  </div>

  {/* Body texte explicatif : les <strong> en children direct = indices <2>/<4>/<7> */}
  <p className="text-base leading-relaxed text-white md:col-span-8">
    <Trans i18nKey="pollResults.waterFootprint.body">
      C'est l'eau nécessaire pour produire et distribuer vos{' '}
      <strong>biens et services</strong>. En règle générale, les
      empreintes eau varient entre <strong>3 000</strong> et{' '}
      <strong>9 000</strong> litres par jour. L'eau dite "domestique"
      (douche, toilettes, cuisine...) n'est pas comptée.
    </Trans>
  </p>

  {/* CTA */}
  <div className="flex md:col-span-4 md:justify-end">
    <ButtonLink
      href={learnMoreHref}
      target="_blank"
      rel="noopener noreferrer"
      color="borderless" /* pas de variant "white" : on surcharge via twMerge */
      className="bg-white text-[#3F40B5] hover:bg-white/90 hover:text-[#3F40B5]"
    >
      <Trans i18nKey="pollResults.waterFootprint.learnMore">
        En savoir plus
      </Trans>
    </ButtonLink>
  </div>
</div>
```

> L'icône `WaterDropIcon` provient de `@/components/icons/WaterDropIcon` (déjà existant, 12×12 par défaut → on surcharge avec `h-7 w-7`).

### 6.5 Bouton "En savoir plus"

- Composant : `@/design-system/buttons/ButtonLink` (cf. usages existants dans `ShareSection.tsx`).
- Variante : **`color="white"` n'existe pas** dans le design system. Utiliser `color="borderless"` + `className="bg-white text-[#3F40B5] hover:bg-white/90 hover:text-[#3F40B5]"` (surcharge via `twMerge`, déjà géré par `ButtonLink`).
- Forme : le `rounded-full` est déjà porté par `ButtonLink` (pas besoin de le re-spécifier).
- Ouverture dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`).

### 6.6 SVG de la vague (WaterWavesBackground)

#### Spécifications

- Composant React fonctionnel retournant un `<svg>` positionné en `absolute`, **haut-droite** de la carte.
- **viewBox** : `0 0 200 80` (ratio ~ 5:2).
- **Préserve le ratio** (`preserveAspectRatio="none"`).
- `pointer-events-none` (purement décoratif).
- `aria-hidden="true"`.

#### Positionnement

```tsx
<div
  aria-hidden="true"
  className="pointer-events-none absolute -top-2 right-0 h-24 w-1/2 md:h-32 md:w-2/5"
>
  <svg
    viewBox="0 0 200 80"
    preserveAspectRatio="none"
    className="h-full w-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 2-3 paths superposés */}
  </svg>
</div>
```

#### Paths (couleur)

| Path | Couleur | Opacité | Épaisseur visuelle |
|---|---|---|---|
| Vague arrière (la plus large, en haut) | `#A5B4FC` (primary-300) | `opacity-60` | trait plus épais |
| Vague avant (plus en bas) | `#C7D2FE` (primary-200) | `opacity-80` | trait plus fin |

> Ces deux nuances bleu clair se marient bien avec le fond `#3F40B5` et respectent la palette Tailwind du projet (`primary.300`, `primary.200`) — éviter d'introduire une nouvelle couleur hex.

#### Forme (exemple de paths à adapter si besoin)

Le rendu attendu est **2 vagues empilées**, courbes de Bézier douces :

```svg
<!-- Vague arrière -->
<path
  d="M0,40 C30,10 60,70 100,40 C140,10 170,70 200,40 L200,0 L0,0 Z"
  fill="#A5B4FC"
  fillOpacity="0.35"
/>

<!-- Vague avant (chevauche légèrement la première) -->
<path
  d="M0,55 C25,30 55,75 95,55 C140,30 175,75 200,55 L200,20 L0,20 Z"
  fill="#C7D2FE"
  fillOpacity="0.55"
/>
```

> L'agent peut ajuster les courbes pour matcher au mieux la maquette, mais doit garder **2 paths, courbes Bézier douces, pas de stroke**.

#### Animation optionnelle (mentionnée dans le ticket)

Le ticket Notion dit : *« pourquoi pas refaire une animation sur la vague d'eau comme on avait avant ? »*.

**MVP** : ne pas animer. **Bonus optionnel** : si l'agent en a le temps, ajouter une **animation CSS `translate-x` lente** via une `@keyframes` dans le module CSS du composant (Tailwind v4 supporte `@layer` et `@keyframes` inline, ou via un `style jsx` non applicable ici → préférer un `globals.css` ou un fichier CSS module colocated `.module.css`).

Si l'agent choisit d'animer :
```css
@keyframes wave-drift {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-25%); }
}
.animate-wave-back  { animation: wave-drift 12s linear infinite alternate; }
.animate-wave-front { animation: wave-drift 9s  linear infinite alternate; }
```
Et appliquer `animate-wave-back` / `animate-wave-front` sur des `<g>` correspondants. **Respecter `prefers-reduced-motion`** :
```tsx
className="… motion-reduce:animate-none"
```

> Cette animation est OPTIONNELLE. Si trop complexe, livrer la version statique (les 2 paths fixes) qui suffit à la maquette.

---

## 7. Palette de couleurs

### Couleur dédiée "eau"

Le projet n'a pas encore de palette `eau`. Pour cette PR, **utiliser directement** la valeur hex `#3F40B5` (et non pas l'ajouter au `tailwind.config.js`) afin de limiter le scope de la PR. Si l'équipe souhaite une palette formelle, c'est une PR séparée.

```tsx
// Référence unique, en haut du fichier WaterFootprintCard.tsx
const WATER_FOOTPRINT_BG = '#3F40B5' // indigo foncé — section eau campagnes
```

### Récap des couleurs à utiliser

| Élément | Classe / valeur |
|---|---|
| Fond de carte | `bg-[#3F40B5]` |
| Vague arrière | `fill="#A5B4FC"` (`primary-300`) |
| Vague avant | `fill="#C7D2FE"` (`primary-200`) |
| Texte principal | `text-white` |
| Texte secondaire (unité, libellé) | `text-white/80` |
| Goutte | `fill-white` |
| Bouton | `bg-white text-[#3F40B5] hover:bg-white/90` |
| Mot en gras dans le body | `<strong className="font-bold">` (hérite de la couleur du parent) |

---

## 8. Accessibilité

- Le `<h2>` de la section porte l'intitulé — fournit la navigation par headings.
- L'icône goutte est `aria-hidden="true"` (décorative, le texte adjacent la décrit).
- Le SVG de fond est entièrement `aria-hidden="true"` et `pointer-events-none`.
- Le bouton est un vrai `<a>` (via `ButtonLink`) → focus clavier natif.
- **Contraste** : blanc sur `#3F40B5` ≈ ratio 7:1 → ✅ WCAG AAA pour le texte normal.
- **Ne pas se fier uniquement à la couleur** : le mot "eau" est aussi écrit dans le `<h2>` et dans le body.

---

## 9. Internationalisation

### Clés à ajouter

Dans **`apps/site/src/locales/ui/ui-fr.yaml`** (sous `pollResults.waterFootprint.*`) :

```yaml
pollResults.waterFootprint.title: Et à propos de l'empreinte eau ?
pollResults.waterFootprint.unit: litres / jour
pollResults.waterFootprint.averageLabel: empreinte eau moyenne des participants
pollResults.waterFootprint.body: >-
  C'est l'eau nécessaire pour produire et distribuer vos <2>biens et services</2>.
  En règle générale, les empreintes eau varient entre <4>3 000</4> et <7>9 000</7> litres par jour.
  L'eau dite "domestique" (douche, toilettes, cuisine...) n'est pas comptée.
pollResults.waterFootprint.learnMore: En savoir plus
```

Dans **`apps/site/src/locales/ui/ui-en.yaml`** :

```yaml
pollResults.waterFootprint.title: And what about water footprint?
pollResults.waterFootprint.unit: litres / day
pollResults.waterFootprint.averageLabel: average water footprint of participants
pollResults.waterFootprint.body: >-
  It's the water needed to produce and distribute your <2>goods and services</2>.
  Generally, water footprints range from <4>3,000</4> to <7>9,000</7> litres per day.
  Domestic water (shower, toilets, kitchen…) is not counted.
pollResults.waterFootprint.learnMore: Learn more
```

### Pourquoi les indices `<2>`, `<4>`, `<7>` ?

Les indices ne sont **pas** des numéros de "paragraphe" : ils référencent la position réelle de chaque composant dans le tableau des `children` du `<Trans>` (les nœuds texte comptent aussi). Avec 3 `<strong>` et des nœuds texte autour (dont les `{' '}`), le parser i18n (`pnpm run ui:parse`) génère automatiquement `<2>`, `<4>`, `<7>` — c'est la référence de vérité.

**Ne pas écrire ces indices à la main** : écrire les `<strong>` en children du `<Trans>` puis lancer `pnpm run ui:parse`, qui régénère la valeur FR avec les bons indices. Reprendre ensuite ces indices pour la valeur EN (même structure JSX → mêmes indices). Pattern déjà utilisé dans le codebase (ex. `components.localisation.LocalisationMessage.betaMsg` avec `<1>` pour un seul `<strong>`).

---

## 10. Lien "En savoir plus"

**URL** (fixée par le ticket Notion) :
```
https://nosgestesclimat.fr/blog/environnement/lexique-eau-tout-comprendre
```

À passer dans la props `learnMoreHref` (valeur par défaut) pour rester testable.

---

## 11. Critères d'acceptance (extraits du ticket Notion + complétés)

- [ ] La section **« Et à propos de l'empreinte eau ? »** apparaît sur la page de résultats d'une campagne.
- [ ] Le chiffre affiché est la **moyenne** de `computedResults.eau.bilan` (en litres/jour), **arrondi à l'entier**, formaté avec séparateur de milliers.
- [ ] La carte a un **fond indigo foncé** (`#3F40B5`), des **coins arrondis** (`rounded-2xl`) et une **vague bleu clair** en haut à droite.
- [ ] Le **lien "En savoir plus"** pointe vers `/blog/environnement/lexique-eau-tout-comprendre` et s'ouvre dans un **nouvel onglet**.
- [ ] Les mots **« biens et services », « 3 000 » et « 9 000 »** sont en **gras**.
- [ ] **Responsive** : sur mobile la carte est en colonne (goutte+chiffre → texte → bouton en bas) ; sur desktop la carte affiche goutte+chiffre en haut, texte à gauche, bouton à droite.
- [ ] La section est **cachée** si `simulationsCount < 3` OU si `meanWaterFootprintLitresPerDay <= 0`.
- [ ] **Aucun warning d'accessibilité** (eslint-plugin-jsx-a11y OK).
- [ ] **Tests unitaires Vitest** ajoutés pour : rendu conditionnel, formatage du chiffre, présence du lien, ouverture en nouvel onglet.
- [ ] **i18n** : clés FR + EN ajoutées ; aucun warning `pnpm ui:check`.

---

## 12. Tests à écrire

Fichier : `WaterFootprintSection.test.tsx`

Cas à couvrir (avec `@testing-library/react` + `vitest`) :

1. **N'affiche rien si `simulationsCount < 3`** (assert `queryByTestId('water-footprint-section')` → `null`).
2. **N'affiche rien si la valeur ≤ 0** (`queryByTestId('water-footprint-section')` → `null`).
3. **Affiche la section si `simulationsCount >= 3`** et valeur > 0.
4. **Affiche le chiffre formaté** : passer `meanWaterFootprintLitresPerDay={6151.4}` → attend le texte `"6 151"`.
5. **Affiche l'unité** `litres / jour`.
6. **Affiche le body** avec les mots en gras (`getByText('biens et services')` doit résoudre un `<strong>`).
7. **Le lien "En savoir plus"** a `href` correct + `target="_blank"` + `rel="noopener noreferrer"`.
8. **Le SVG de la vague** est présent dans le DOM (par `data-testid="water-waves-background"`).

> Le setup Vitest (`vitest.setup.ts`) mocke déjà `TransClient` pour rendre directement les children — aucun wrapper i18n n'est nécessaire, les tests rendent le composant tel quel (le fallback FR s'affiche).

---

## 13. Critères de qualité / "Definition of Done"

- `pnpm lint` → 0 erreur.
- `pnpm typecheck` → 0 erreur.
- `pnpm test` (Vitest) → 100 % des nouveaux tests passent, aucune régression.
- `pnpm ui:check` → aucune nouvelle clé manquante portée par cette feature. NB : `ui:check` signale déjà **19 manquantes EN pré-existantes** sur `main` (clés `signIn.*`, `banner.close`, `common.errors.errorHappening`, etc.) non liées à cette feature — ne pas tenter de les corriger ici.
- Vérification visuelle manuelle sur 2 breakpoints : 375px (iPhone SE) et 1280px (desktop standard).
- Vérification au clavier : `Tab` atteint le bouton "En savoir plus" et l'active avec `Enter`.
- Respect du pattern du repo : pas de dépendance ajoutée, pas de nouveau fichier dans `tailwind.config.js`.

---

## 14. Hors scope (NOT DOING)

- ❌ Ajouter une nouvelle couleur "eau" dans `tailwind.config.js` (PR séparée si besoin).
- ❌ Animer la vague (optionnel, à faire en bonus seulement — pas bloquant).
- ❌ Modifier le placement de la section ailleurs que dans la page campagne.
- ❌ Refondre la maquette desktop pour l'aligner sur la version mobile (l'inverse non plus).
- ❌ Ajouter un tracking analytics (à voir avec l'équipe produit — non demandé).
- ❌ Localiser dans d'autres langues que FR/EN (non demandé).
- ❌ Internationaliser la valeur par défaut du lien "En savoir plus" (URL absolue).

---

## 15. Notes pour l'agent implémenteur

- **Tu n'as PAS besoin de toucher `tailwind.config.js`** : utilise `bg-[#3F40B5]` (arbitrary value Tailwind v4).
- **`<Trans>`** est utilisé partout dans ce dossier — respecte ce pattern, **pas** de `<p dangerouslySetInnerHTML>`.
- Le **bouton** doit utiliser **`@/design-system/buttons/ButtonLink`** (cohérence avec `ShareSection.tsx`).
- L'icône **`WaterDropIcon`** existe déjà (`@/components/icons/WaterDropIcon`). NE PAS en créer une nouvelle.
- Le **SVG de la vague** est volontairement simple (2 paths en Bézier) — ne pas chercher à le rendre hyperréaliste, le maquette montre des vagues stylisées.
- Si tu hésites entre mobile-first (stacking) et desktop-first, **mobile-first** : la maquette mobile est plus contraignante.
- Pour le **formatage des nombres**, regarde s'il existe un helper `@/utils/format/formatNumber` ou similaire — sinon, `Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })` suffit.
- Après implémentation, **lance** : `pnpm --filter @nosgestesclimat/site lint && pnpm --filter @nosgestesclimat/site typecheck && pnpm --filter @nosgestesclimat/site test`.

---

## 16. Liens utiles

- Carte Notion : https://app.notion.com/p/accelerateur-transition-ecologique-ademe/Ajouter-une-section-explicative-sur-l-empreinte-eau-sur-la-page-de-r-sultats-des-campagnes-31a6523d57d78096a19aca7ca00d689f
- Figma (maquettes source) : https://www.figma.com/design/8PHjeVtRZvbz5qZqaKVA6B/Cre%CC%81er-une-orga-_-campagne?node-id=57310-2702
- Page Lexique eau (cible du lien) : https://nosgestesclimat.fr/blog/environnement/lexique-eau-tout-comprendre
- Fichier de la page campagne : `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/page.tsx`
- Composant à proximité (modèle) : `apps/site/src/app/[locale]/(server)/(large)/organisations/[orgaSlug]/campagnes/[pollSlug]/_components/footPrintDistribution/FootprintDistribution.tsx`