import { IframeOptionsProvider } from '@/app/[locale]/_components/mainLayoutProviders/IframeOptionsContext'
import MainHooks from '@/app/[locale]/_components/mainLayoutProviders/MainHooks'
import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { CookieConsentProvider } from '@/components/cookies/useCookieManagement'
import ErrorBoundary from '@/components/error/ErrorBoundary'
import EngineProviders from '@/components/providers/EngineProviders'
import PRNumberHook from '@/components/providers/simulationProviders/PRNumberHook'
import { PartnerProvider } from '@/contexts/partner/PartnerContext'
import UserProvider from '@/publicodes-state/providers/userProvider/provider'
import type { Simulation } from '@/publicodes-state/types'
import { faker } from '@faker-js/faker'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr-opti.json'
import '@testing-library/jest-dom'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { randomUUID } from 'crypto'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { getInitialExtendedSituation } from '../modelFetching/getInitialExtendedSituation'

// Mock useRules
vi.mock('@/hooks/useRules', () => ({
  useRules: () => ({
    data: rules,
    isLoading: false,
    isFetched: true,
  }),
}))

// Mock getGeolocation with a valid region to avoid userId issues in usePersistentUser
vi.mock('@/helpers/api/getGeolocation', () => ({
  getGeolocation: () => Promise.resolve({ code: 'FR', name: 'France' }),
}))

// Default mock values
const defaultSimulation: Simulation = {
  id: faker.string.uuid(),
  date: new Date(),
  situation: {},
  extendedSituation: getInitialExtendedSituation(),
  foldedSteps: [],
  actionChoices: {},
  computedResults: {
    carbone: {
      bilan: 0,
      categories: {
        transport: 0,
        alimentation: 0,
        logement: 0,
        divers: 0,
        'services sociétaux': 0,
      } as Record<DottedName, number>,
    },
    eau: {
      bilan: 0,
      categories: {
        transport: 0,
        alimentation: 0,
        logement: 0,
        divers: 0,
        'services sociétaux': 0,
      } as Record<DottedName, number>,
    },
  },
  progression: 0,
}

const defaultUser = {
  userId: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}

const defaultState = {
  user: defaultUser,
  tutorials: {},
  simulations: [defaultSimulation],
  currentSimulationId: defaultSimulation.id,
  updateCurrentSimulation: vi.fn(),
}

interface ProviderConfig {
  errorBoundary?: boolean
  queryClient?: boolean
  user?: boolean
  partner?: boolean
  iframeOptions?: boolean
  mainHooks?: boolean
  engine?: boolean
  prNumber?: boolean
  cookieConsent?: boolean
}

interface UserProviderProps {
  serverSimulations?: Simulation[]
  serverUserId?: string
}

const TestWrapper = ({
  children,
  providers,
  userProviderProps,
}: {
  children: ReactElement
  providers: ProviderConfig
  userProviderProps?: UserProviderProps
}) => {
  let wrapped = children

  if (providers.engine) {
    wrapped = <EngineProviders isOptim={false}>{wrapped}</EngineProviders>
  }

  if (providers.mainHooks) {
    wrapped = (
      <>
        <MainHooks />
        {wrapped}
      </>
    )
  }

  if (providers.iframeOptions) {
    wrapped = <IframeOptionsProvider>{wrapped}</IframeOptionsProvider>
  }

  if (providers.partner) {
    wrapped = <PartnerProvider>{wrapped}</PartnerProvider>
  }

  if (providers.user) {
    wrapped = (
      <UserProvider
        serverUserId={userProviderProps?.serverUserId ?? randomUUID()}
        serverSimulations={userProviderProps?.serverSimulations}>
        {wrapped}
      </UserProvider>
    )
  }

  if (providers.queryClient) {
    wrapped = <QueryClientProviderWrapper>{wrapped}</QueryClientProviderWrapper>
  }

  if (providers.cookieConsent) {
    wrapped = <CookieConsentProvider>{wrapped}</CookieConsentProvider>
  }

  if (providers.errorBoundary) {
    wrapped = <ErrorBoundary>{wrapped}</ErrorBoundary>
  }

  return (
    <>
      {providers.prNumber && <PRNumberHook setPRNumber={() => {}} />}
      {wrapped}
    </>
  )
}

export const renderWithWrapper = (
  ui: ReactElement,
  {
    user = defaultUser,
    currentSimulation = defaultSimulation,
    simulations = [defaultSimulation],
    providers = {
      queryClient: true,
      errorBoundary: true,
      cookieConsent: true,
    },
    ...options
  }: RenderOptions & {
    user?: Partial<typeof defaultUser>
    currentSimulation?: Partial<typeof defaultSimulation>
    simulations?: Simulation[]
    providers?: ProviderConfig
  } = {}
) => {
  const userMerged = {
    ...defaultUser,
    ...user,
  }

  localStorage.setItem(
    'nosgestesclimat::v3',
    JSON.stringify({
      ...defaultState,
      user: userMerged,
      simulations,
      currentSimulationId: currentSimulation?.id ?? defaultSimulation?.id,
      tutorials: {},
    })
  )

  // Pass user provider props for server-hydrated mode to avoid async localStorage loading issues
  const userProviderProps: UserProviderProps | undefined = providers.user
    ? {
        serverSimulations: simulations,
        serverUserId: userMerged.userId,
      }
    : undefined

  return render(
    <TestWrapper providers={providers} userProviderProps={userProviderProps}>
      {ui}
    </TestWrapper>,
    options
  )
}
