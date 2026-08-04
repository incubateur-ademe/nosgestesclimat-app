/**
 * Décor purement visuel : deux vagues stylisées, positionnées en haut à droite
 * de la carte "empreinte eau" de la page de résultats de campagne.
 *
 * Le composant parent doit être en `position: relative` et `overflow: hidden`.
 */
export default function WaterWavesBackground() {
  return (
    <div
      aria-hidden="true"
      data-testid="water-waves-background"
      className="pointer-events-none absolute -top-2 right-0 h-24 w-1/2 md:h-32 md:w-2/5">
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full">
        {/* Vague arrière (la plus haute, nuance claire) */}
        <path
          d="M0,40 C30,10 60,70 100,40 C140,10 170,70 200,40 L200,0 L0,0 Z"
          fill="#A5B4FC"
          fillOpacity="0.35"
        />
        {/* Vague avant (plus basse, nuance plus claire) */}
        <path
          d="M0,55 C25,30 55,75 95,55 C140,30 175,75 200,55 L200,20 L0,20 Z"
          fill="#C7D2FE"
          fillOpacity="0.55"
        />
      </svg>
    </div>
  )
}
