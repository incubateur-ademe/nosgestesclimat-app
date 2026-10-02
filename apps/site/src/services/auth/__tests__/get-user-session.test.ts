// @vitest-environment node
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import * as Sentry from '@sentry/nextjs'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { getUserSession } from '../get-user-session'

const headersMock = vi.hoisted(() => ({ current: new Map<string, string>() }))

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(headersMock.current),
}))

const userId = 'user-1'
const session = (payload: unknown) =>
  new Map([['x-session', JSON.stringify(payload)]])

describe('getUserSession', () => {
  const exporter = new InMemorySpanExporter()
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  })

  beforeAll(() => {
    provider.register()
  })

  afterAll(async () => {
    await provider.shutdown()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    exporter.reset()
    headersMock.current = new Map()
  })

  it('reads no session without the header', async () => {
    await expect(getUserSession()).resolves.toBeNull()
  })

  it('ignores a malformed header', async () => {
    headersMock.current = new Map([['x-session', '{not json']])

    await expect(getUserSession()).resolves.toBeNull()
  })

  it('returns an authenticated user', async () => {
    headersMock.current = new Map([
      ['x-session', JSON.stringify({ userId, email: 'alice@example.com' })],
    ])

    // The PostHog link is the proxy's job (`middlewareIdentity`): this only
    // resolves who the caller is.
    await expect(getUserSession()).resolves.toEqual({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
  })

  it('returns an anonymous user when there is no account', async () => {
    headersMock.current = new Map([['x-session', JSON.stringify({ userId })]])

    await expect(getUserSession()).resolves.toEqual({
      id: userId,
      isAuth: false,
    })
  })

  it('runs the read in its own span, named after the service', async () => {
    headersMock.current = session({ userId, email: 'alice@example.com' })

    await getUserSession()

    const spans = exporter.getFinishedSpans()
    expect(spans.map((span) => span.name)).toContain(
      'site.action.getUserSession'
    )
  })
})
