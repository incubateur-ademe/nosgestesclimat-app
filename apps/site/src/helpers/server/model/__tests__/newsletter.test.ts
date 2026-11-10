import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../../error'
import { getNewsletterSubscriptions } from '../newsletter'

const { fetchServerMock } = vi.hoisted(() => ({ fetchServerMock: vi.fn() }))

describe('getNewsletterSubscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the subscriptions the API knows about', async () => {
    const contact = { email: faker.internet.email(), listIds: [22] }
    fetchServerMock.mockResolvedValueOnce(contact)

    await expect(
      getNewsletterSubscriptions(contact.email)
    ).resolves.toStrictEqual(contact)
  })

  it('returns no subscription when Brevo holds no contact for the user', async () => {
    const email = faker.internet.email()
    fetchServerMock.mockRejectedValueOnce(new NotFoundError())

    await expect(getNewsletterSubscriptions(email)).resolves.toStrictEqual({
      email,
      listIds: [],
    })
  })

  it('propagates any other error', async () => {
    fetchServerMock.mockRejectedValueOnce(new Error('Boom'))

    await expect(
      getNewsletterSubscriptions(faker.internet.email())
    ).rejects.toThrow('Boom')
  })
})

vi.mock('../../fetchServer', () => ({ fetchServer: fetchServerMock }))
