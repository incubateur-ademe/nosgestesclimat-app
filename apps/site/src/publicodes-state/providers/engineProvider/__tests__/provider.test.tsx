import type { Simulation } from '@/helpers/server/model/simulations'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import useRule from '../../../hooks/useRule/useRule'
import UserProvider from '../../userProvider/provider'
import EngineProvider from '../provider'

vi.mock('@/services/geolocation/get-geolocation', () => ({
  getGeolocation: () => Promise.resolve({ code: 'FR', name: 'France' }),
}))

const CAR_USER_QUESTION =
  'transport . voiture . utilisateur' satisfies DottedName
/** Both are only asked once `CAR_USER_QUESTION` is answered. */
const CAR_KM_QUESTION = 'transport . voiture . km' satisfies DottedName
const CAR_CONSUMPTION_QUESTION =
  'transport . voiture . thermique . consommation aux 100' satisfies DottedName

// TODO: use factory
const simulation = {
  id: 'simulation-id',
  date: new Date(),
  situation: {},
  foldedSteps: [],
  computedResults: { carbone: {}, eau: {} },
  progression: 0,
  model: 'FR-fr-9.9.9',
} as unknown as Simulation

function Probe() {
  const { numericValue } = useRule('bilan')
  const { setValue: setCarUser } = useRule(CAR_USER_QUESTION)
  const { setValue: setCarKm } = useRule(CAR_KM_QUESTION)
  const { value: carConsumption } = useRule(CAR_CONSUMPTION_QUESTION)

  return (
    <>
      <span data-testid="bilan">{numericValue}</span>
      <span data-testid="car-consumption">{String(carConsumption)}</span>
      <button
        onClick={() =>
          setCarUser('propriétaire', {
            questionDottedName: CAR_USER_QUESTION,
          })
        }>
        answer car user
      </button>
      <button
        onClick={() =>
          setCarKm(60_000, { questionDottedName: CAR_KM_QUESTION })
        }>
        answer car km
      </button>
    </>
  )
}

const Tree = ({ rules }: { rules: NGCRules }) => (
  <UserProvider userSession={null} simulation={simulation}>
    <EngineProvider rules={rules}>
      <Probe />
    </EngineProvider>
  </UserProvider>
)

/** An equal but brand new rules object, as the server hands over on a refresh. */
const refreshedRules = () => ({ ...rules }) as unknown as NGCRules

const bilan = () => Number(screen.getByTestId('bilan').textContent)
const carConsumption = () => screen.getByTestId('car-consumption').textContent

describe('EngineProvider', () => {
  it('should keep the answers already given when it receives a new rules object holding the same rules', async () => {
    // Given — a running simulation, a couple of questions in
    const { rerender } = render(<Tree rules={rules as unknown as NGCRules} />)
    const initialBilan = bilan()

    await userEvent.click(
      screen.getByRole('button', { name: 'answer car user' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'answer car km' }))
    const answeredBilan = bilan()
    expect(answeredBilan).not.toBe(initialBilan)

    // When — the server re-renders the tree (a `revalidatePath` in a server
    // action refreshes the active route, even one the user is still on)
    rerender(<Tree rules={refreshedRules()} />)

    // Then — the footprint does not fall back to the model defaults
    expect(bilan()).toBeCloseTo(answeredBilan, 5)
  }, 30_000)

  it('should keep a rule depending on a previous answer evaluable when it receives a new rules object', async () => {
    // Given — a rule only applicable once `CAR_USER_QUESTION` is answered
    const { rerender } = render(<Tree rules={rules as unknown as NGCRules} />)
    expect(carConsumption()).toBe('null')

    await userEvent.click(
      screen.getByRole('button', { name: 'answer car user' })
    )
    const answeredCarConsumption = carConsumption()
    expect(answeredCarConsumption).not.toBe('null')

    // When
    rerender(<Tree rules={refreshedRules()} />)

    // Then — its dependency is still answered, so it still evaluates
    expect(carConsumption()).toBe(answeredCarConsumption)
  }, 30_000)
})
