import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { faker } from '@faker-js/faker'
import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import { screen, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import UpdateSimulationUsed from '../UpdateSimulationUsed'

vi.mock('@/services/groups/updateGroupParticipant', () => {
  return {
    updateGroupParticipant: vi.fn(),
  }
})

const mockRefetchGroup = vi.fn()

const mockSimulation = {
  id: faker.string.uuid(),
  progression: 1,
  computedResults: {
    carbone: {
      bilan: 4000,
      categories: {} as Record<string, number>,
    },
    eau: {
      bilan: 1000,
      categories: {} as Record<string, number>,
    },
  },
  date: new Date('2024-03-20'),
  situation: {},
  extendedSituation: {} as ExtendedSituation,
  foldedSteps: [],
  actionChoices: {} as Partial<Record<DottedName, boolean>>,
}

const mockGroupSimulation = {
  id: faker.string.uuid(),
  progression: 1,
  computedResults: {
    carbone: {
      bilan: 5000,
      categories: {} as Record<string, number>,
    },
    eau: {
      bilan: 1200,
      categories: {} as Record<string, number>,
    },
  },
  date: new Date('2024-03-15'),
  situation: {},
  extendedSituation: {} as ExtendedSituation,
  foldedSteps: [],
  actionChoices: {} as Partial<Record<DottedName, boolean>>,
  severity: 1,
}

const mockUserId = faker.string.uuid()

const mockProps = {
  group: {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    emoji: '👥',
    administrator: {
      id: mockUserId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
    severity: 1,
    participants: [
      {
        id: faker.string.uuid(),
        userId: mockUserId,
        name: faker.person.fullName(),
        severity: 1,
        simulation: mockGroupSimulation,
      },
    ],
  },
  refetchGroup: mockRefetchGroup,
}

let mockUser: Record<string, string>

describe('UpdateSimulationUsed', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUser = {
      userId: mockUserId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }
  })

  it('should display the update alert when detecting a more recent simulation with a different result', async () => {
    // When
    renderWithWrapper(<UpdateSimulationUsed {...mockProps} />, {
      user: mockUser,
      simulations: [mockGroupSimulation, mockSimulation],
      currentSimulation: mockSimulation,
      providers: {
        user: true,
      },
    })

    // Then
    await waitFor(() => {
      expect(screen.getByTestId('update-alert')).toBeInTheDocument()
    })
  })

  it('should display success alert when update is successful', async () => {
    // Given
    const { updateGroupParticipant } =
      await import('@/services/groups/updateGroupParticipant')
    vi.mocked(updateGroupParticipant).mockResolvedValue({
      data: {
        success: true,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as unknown,
    } as Awaited<ReturnType<typeof updateGroupParticipant>>)

    // When
    renderWithWrapper(<UpdateSimulationUsed {...mockProps} />, {
      user: mockUser,
      simulations: [mockGroupSimulation, mockSimulation],
      currentSimulation: mockSimulation,
      providers: {
        user: true,
      },
    })
    // Wait for the update button to appear before clicking
    const updateButton = await screen.findByTestId('update-button')
    await userEvent.click(updateButton)

    // Then
    await waitFor(() => {
      expect(screen.getByTestId('success-alert')).toBeInTheDocument()
      expect(screen.getByText('Participation mise à jour')).toBeInTheDocument()
    })
  })

  it('should display error alert when update fails', async () => {
    // Given
    const { updateGroupParticipant } =
      await import('@/services/groups/updateGroupParticipant')
    vi.mocked(updateGroupParticipant).mockRejectedValue(
      new Error('Update failed')
    )

    // When
    renderWithWrapper(<UpdateSimulationUsed {...mockProps} />, {
      user: mockUser,
      simulations: [mockGroupSimulation, mockSimulation],
      currentSimulation: mockSimulation,
      providers: {
        user: true,
      },
    })
    // Wait for the update button to appear before clicking
    const updateButton = await screen.findByTestId('update-button')
    await userEvent.click(updateButton)

    // Then
    await waitFor(() => {
      expect(screen.getByTestId('error-alert')).toBeInTheDocument()
      expect(
        screen.getByText("Oups, une erreur s'est produite")
      ).toBeInTheDocument()
    })

    // And
    await userEvent.click(screen.getByTestId('alert-close'))

    // Then
    await waitFor(() => {
      expect(screen.getByTestId('update-alert')).toBeInTheDocument()
    })
  })
})
