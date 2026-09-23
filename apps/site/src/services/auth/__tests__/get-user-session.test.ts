// @vitest-environment node
import { trace } from '@opentelemetry/api'
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

import { currentRequestIdentity } from '@/observability/request-identity'
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

  it('returns an authenticated user and links the request to it', async () => {
    headersMock.current = new Map([
      ['x-session', JSON.stringify({ userId, email: 'alice@example.com' })],
      ['x-posthog-session-id', 'replay-1'],
    ])

    // Read inside the request's own span: the identity is filed under the
    // trace, and that is how every later line and span of the request finds it.
    await trace
      .getTracer('test')
      .startActiveSpan('POST /fr/simulateur/bilan', async (request) => {
        try {
          await expect(getUserSession()).resolves.toEqual({
            id: userId,
            email: 'alice@example.com',
            isAuth: true,
          })
          expect(currentRequestIdentity()).toEqual({
            distinctId: userId,
            sessionId: 'replay-1',
          })
          expect(Sentry.setUser).toHaveBeenCalledWith({
            id: userId,
            email: 'alice@example.com',
            isAuth: true,
          })
        } finally {
          request.end()
        }
      })
  })

  it('takes the visitor identity posthog-js sent when there is no account', async () => {
    headersMock.current = new Map([
      ['x-session', JSON.stringify({ userId })],
      ['x-posthog-distinct-id', 'anon-1'],
      ['x-posthog-session-id', 'replay-2'],
    ])

    await trace
      .getTracer('test')
      .startActiveSpan('POST /fr/simulateur/bilan', async (request) => {
        try {
          await expect(getUserSession()).resolves.toEqual({
            id: userId,
            isAuth: false,
          })
          expect(currentRequestIdentity()).toEqual({
            distinctId: 'anon-1',
            sessionId: 'replay-2',
          })
        } finally {
          request.end()
        }
      })
  })

  it('runs the read in its own span, named after the service', async () => {
    headersMock.current = session({ userId, email: 'alice@example.com' })

    await getUserSession()

    const spans = exporter.getFinishedSpans()
    expect(spans.map((span) => span.name)).toContain(
      'site.service.getUserSession'
    )
  })
})
