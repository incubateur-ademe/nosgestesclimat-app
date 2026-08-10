import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { SEDD_EVENT } from '../../constants/sedd-event.ts'
import { ensureSeddEvent } from '../ensure-sedd-event.service.ts'

describe('ensureSeddEvent', () => {
  afterEach(async () => {
    await prisma.event.deleteMany()
  })

  it('creates the default SEDD event on an empty database', async () => {
    const event = await ensureSeddEvent()

    expect(event.slug).toBe('sedd')
    expect(event.name).toBe('SEDD 2026')
    expect(event.startDate.toISOString()).toBe(
      SEDD_EVENT.startDate.toISOString()
    )
    expect(event.endDate.toISOString()).toBe(SEDD_EVENT.endDate.toISOString())
  })

  it('is idempotent: running it again does not duplicate the event', async () => {
    await ensureSeddEvent()
    const again = await ensureSeddEvent()

    const count = await prisma.event.count({ where: { slug: 'sedd' } })
    expect(count).toBe(1)
    expect(again.slug).toBe('sedd')
  })

  it('backfills the slug on an event created by an earlier seed version', async () => {
    const legacy = await prisma.event.create({
      data: {
        slug: 'legacy-sedd',
        name: SEDD_EVENT.name,
        startDate: SEDD_EVENT.startDate,
        endDate: SEDD_EVENT.endDate,
      },
    })

    const event = await ensureSeddEvent()

    expect(event.id).toBe(legacy.id)
    expect(event.slug).toBe('sedd')
  })
})
