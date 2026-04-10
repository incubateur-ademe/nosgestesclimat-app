import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { formatBrevoDate } from '../../../adapters/brevo/__tests__/fixtures/formatBrevoDate.js'
import { brevoGetNewsletter } from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { ListIds } from '../../../adapters/brevo/constant.js'
import { prisma } from '../../../adapters/prisma/client.js'
import type { BrevoNewsletterStats } from '../../../adapters/prisma/generated.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import logger from '../../../logger.js'
import { recoverNewsletterSubscriptions } from '../stats.service.js'

describe('Given newsletter stats recover job', () => {
  let newsletterSubscriptions: Array<{
    listId: ListIds
    totalSubscribers: number
  }>
  let date: string

  beforeEach(() => {
    date = dayjs().format('YYYY-MM-DD')
    newsletterSubscriptions = Object.values(ListIds).map((listId) => ({
      listId,
      totalSubscribers: faker.number.int({ min: 0, max: 2147483647 }),
    }))
  })

  afterEach(async () => {
    await prisma.brevoNewsletterStats.deleteMany()
  })

  describe('When CRON is triggerred', () => {
    test('Then it stores newsletter subscriptions', async () => {
      newsletterSubscriptions.forEach(({ listId, totalSubscribers }) =>
        mswServer.use(
          brevoGetNewsletter(listId.toString(), {
            customResponses: [
              {
                body: {
                  id: listId,
                  name: faker.company.buzzPhrase(),
                  startDate: formatBrevoDate(faker.date.recent()),
                  endDate: formatBrevoDate(faker.date.future()),
                  totalBlacklisted: faker.number.int(),
                  totalSubscribers,
                  uniqueSubscribers: faker.number.int(),
                  folderId: faker.number.int(),
                  createdAt: formatBrevoDate(faker.date.past()),
                  dynamicList: faker.datatype.boolean(),
                  campaignStats: [],
                },
              },
            ],
          })
        )
      )

      await recoverNewsletterSubscriptions(date)

      await Promise.all(
        newsletterSubscriptions.map(async ({ listId, totalSubscribers }) => {
          const stat = await prisma.brevoNewsletterStats.findUniqueOrThrow({
            where: {
              date_newsletter: {
                date: new Date(`${date}T00:00:00.000Z`),
                newsletter: listId,
              },
            },
            select: {
              id: true,
              subscriptions: true,
            },
          })

          expect(stat).toEqual({
            id: expect.any(String),
            subscriptions: totalSubscribers,
          })
        })
      )
    })

    describe('And subscriptions already does exist in database', () => {
      let storedNewsletterSubscriptions: BrevoNewsletterStats[]

      beforeEach(async () => {
        await prisma.brevoNewsletterStats.createMany({
          data: newsletterSubscriptions.map(({ listId, totalSubscribers }) => ({
            date: new Date(`${date}T00:00:00.000Z`),
            newsletter: listId,
            subscriptions: totalSubscribers,
          })),
        })

        storedNewsletterSubscriptions =
          await prisma.brevoNewsletterStats.findMany({
            orderBy: { newsletter: 'asc' },
          })
      })

      test('Then it does not replace existing data', async () => {
        newsletterSubscriptions.forEach(({ listId }) =>
          mswServer.use(
            brevoGetNewsletter(listId.toString(), {
              customResponses: [
                {
                  body: {
                    id: listId,
                    name: faker.company.buzzPhrase(),
                    startDate: formatBrevoDate(faker.date.recent()),
                    endDate: formatBrevoDate(faker.date.future()),
                    totalBlacklisted: faker.number.int(),
                    totalSubscribers: faker.number.int({
                      min: 0,
                      max: 2147483647,
                    }),
                    uniqueSubscribers: faker.number.int(),
                    folderId: faker.number.int(),
                    createdAt: formatBrevoDate(faker.date.past()),
                    dynamicList: faker.datatype.boolean(),
                    campaignStats: [],
                  },
                },
              ],
            })
          )
        )

        await recoverNewsletterSubscriptions(date)

        expect(
          await prisma.brevoNewsletterStats.findMany({
            orderBy: { newsletter: 'asc' },
          })
        ).toEqual(storedNewsletterSubscriptions)
      })

      test('Then it warns about existing data', async () => {
        newsletterSubscriptions.forEach(({ listId }) =>
          mswServer.use(
            brevoGetNewsletter(listId.toString(), {
              customResponses: [
                {
                  body: {
                    id: listId,
                    name: faker.company.buzzPhrase(),
                    startDate: formatBrevoDate(faker.date.recent()),
                    endDate: formatBrevoDate(faker.date.future()),
                    totalBlacklisted: faker.number.int(),
                    totalSubscribers: faker.number.int({
                      min: 0,
                      max: 2147483647,
                    }),
                    uniqueSubscribers: faker.number.int(),
                    folderId: faker.number.int(),
                    createdAt: formatBrevoDate(faker.date.past()),
                    dynamicList: faker.datatype.boolean(),
                    campaignStats: [],
                  },
                },
              ],
            })
          )
        )

        await recoverNewsletterSubscriptions(date)

        newsletterSubscriptions.forEach(({ listId }) => {
          expect(logger.warn).toHaveBeenCalledWith(
            `Newsletter ${listId} ${dayjs(date).format('DD/MM/YYYY')} ignored. Value already exists, script is not idempotent`
          )
        })
      })
    })

    describe('And brevo is down', () => {
      test('Then it logs the exception', async () => {
        newsletterSubscriptions.forEach(({ listId }) =>
          mswServer.use(
            brevoGetNewsletter(listId.toString(), {
              networkError: true,
            })
          )
        )

        await recoverNewsletterSubscriptions(date)

        expect(logger.error).toHaveBeenCalledWith(
          `Newsletter ${dayjs(date).format('DD/MM/YYYY')} import failed`,
          expect.any(Object)
        )

        mswServer.resetHandlers()
      })
    })
  })
})
