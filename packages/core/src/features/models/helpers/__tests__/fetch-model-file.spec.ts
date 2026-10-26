import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModelFileFetchFailedError } from '../../errors.ts'
import { fetchModelFile } from '../fetch-model-file.ts'

const REMOTE_RULES = { bilan: { formule: 0 } }

const okResponse = () => ({
  ok: true,
  json: () => Promise.resolve(REMOTE_RULES),
})

describe('fetchModelFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the parsed body on a successful request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchModelFile('https://example.com/model.json')

    expect(fetchMock).toHaveBeenCalledOnce()
    expect.assert(result.success)
    expect(result.data).toEqual(REMOTE_RULES)
  })

  it('returns a failure on a missing remote file instead of an empty rule set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    )

    const result = await fetchModelFile('https://example.com/model.json')

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(ModelFileFetchFailedError)
    expect(result.error.status).toBe(404)
  })

  it('does not retry a 4xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchModelFile('https://example.com/model.json')

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(ModelFileFetchFailedError)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('retries once on a transient failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchModelFile('https://example.com/model.json')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect.assert(result.success)
    expect(result.data).toEqual(REMOTE_RULES)
  })

  it('gives up after the retry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 502 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchModelFile('https://example.com/model.json')

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(ModelFileFetchFailedError)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
