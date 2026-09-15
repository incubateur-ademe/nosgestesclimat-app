import { getOrganisationPolls } from '@/helpers/server/model/organisations'
import type { OrganisationPoll } from '@/types/organisations'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LegacyPollResultsPage from '../page'

const navigationMock = vi.hoisted(() => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock('@/helpers/server/model/organisations', () => ({
  getOrganisationPolls: vi.fn(),
}))

vi.mock('next/navigation', () => navigationMock)

const asPolls = (polls: { slug: string }[]) =>
  polls as unknown as OrganisationPoll[]

describe('LegacyPollResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Next ends the render by throwing, and the page relies on it: without this
    // the code keeps going after the redirect, as no render ever would.
    navigationMock.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    navigationMock.notFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
  })

  const render = () =>
    LegacyPollResultsPage({
      params: Promise.resolve({ locale: 'fr', orgaSlug: 'my-org' }),
      searchParams: Promise.resolve({}),
    })

  it('hands over to the first campaign of the organisation', async () => {
    vi.mocked(getOrganisationPolls).mockResolvedValue(
      asPolls([{ slug: 'my-poll' }])
    )

    await expect(render()).rejects.toThrow('NEXT_REDIRECT')

    expect(navigationMock.redirect).toHaveBeenCalledWith(
      '/organisations/my-org/campagnes/my-poll'
    )
  })

  it('sends an administrator with no campaign to its dashboard', async () => {
    vi.mocked(getOrganisationPolls).mockResolvedValue([])

    await expect(render()).rejects.toThrow('NEXT_REDIRECT')

    expect(navigationMock.redirect).toHaveBeenCalledWith(
      '/organisations/my-org'
    )
  })

  it('calls notFound when the polls are not readable', async () => {
    vi.mocked(getOrganisationPolls).mockRejectedValue(new Error('Forbidden'))

    await expect(render()).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
