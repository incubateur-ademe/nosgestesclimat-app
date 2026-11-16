import { stepToUrl, type Step } from './steps'

/**
 * Move to another question without a server round-trip. Next patches
 * `history.pushState` to restore its router state from the current tree, so
 * `useSearchParams` sees the new URL and nothing is fetched. `router.push`
 * would request the RSC payload of the target route on every question.
 */
export const pushStep = (step: Step, searchParams?: URLSearchParams) => {
  const url = stepToUrl(step, searchParams)
  if (url) window.history.pushState(null, '', url)
}
