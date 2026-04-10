import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { z } from 'zod'
import { deleteContact, fetchContact } from '../src/adapters/brevo/client.js'
import { prisma } from '../src/adapters/prisma/client.js'
import { defaultVerifiedUserSelection } from '../src/adapters/prisma/selection.js'
import { Locales } from '../src/core/i18n/constant.js'
import { PaginationQuery } from '../src/core/pagination.js'
import { isPrismaErrorNotFound } from '../src/core/typeguards/isPrismaError.js'
import {
  deleteGroup,
  fetchGroups,
  removeParticipant,
} from '../src/features/groups/groups.service.js'
import {
  deletePoll,
  fetchOrganisations,
  fetchPolls,
} from '../src/features/organisations/organisations.service.js'
import { fetchSimulations } from '../src/features/simulations/simulations.service.js'
import {
  fetchUsersForEmail,
  fetchVerifiedUser,
} from '../src/features/users/users.repository.js'
import logger from '../src/logger.js'

const args = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    type: 'string',
    description: 'The email of the user asking resources deletions',
  })
  .coerce('email', (email: string) => email.toLocaleLowerCase())
  .demandOption('email')
  .boolean('dry')
  .alias('d', 'dry')
  .default('dry', true)
  .boolean('deleteUser')
  .alias('u', 'deleteUser')
  .default('deleteUser', false)
  .boolean('deleteOrganisations')
  .alias('o', 'deleteOrganisations')
  .default('deleteOrganisations', false)
  .check(({ email: rawEmail }) => {
    const email = z.string().email().safeParse(rawEmail)

    if (!email.success) {
      throw email.error
    }

    return true
  })
  .parse()

const { deleteUser, deleteOrganisations, dry, email } = await args
const DeletionMessage = dry ? 'Skipping deletion as in dry mode' : 'Deleting...'

if (deleteOrganisations) {
  try {
    const verifiedUser = await fetchVerifiedUser(
      { email, select: defaultVerifiedUserSelection },
      { session: prisma, orThrow: true }
    )

    logger.info('Found verified user. Looking for organisations', {
      verifiedUser,
    })

    const { id: userId } = verifiedUser
    const query = PaginationQuery.parse({})

    while (true) {
      const { organisations } = await fetchOrganisations({
        user: { userId, email },
        query,
      })

      for (const organisation of organisations) {
        logger.info('Found organisations. Looking for polls', {
          organisation,
        })

        const { id: organisationIdOrSlug } = organisation

        const polls = await fetchPolls({
          params: { organisationIdOrSlug },
          user: { userId, email },
        })

        for (const poll of polls) {
          logger.info(`Found poll. ${DeletionMessage}`, { poll })

          const { id: pollIdOrSlug } = poll

          if (!dry) {
            await deletePoll({
              params: { organisationIdOrSlug, pollIdOrSlug },
              user: { userId, email },
            })
          }
        }

        logger.info(`Polls handled. Handling organisation. ${DeletionMessage}`)

        if (!dry) {
          await prisma.organisation.delete({
            where: {
              id: organisationIdOrSlug,
            },
            select: { id: true },
          })
        }
      }

      if (organisations.length < query.pageSize) {
        break
      }

      query.page++
    }

    if (deleteUser) {
      logger.info(`User deletion Requested. ${DeletionMessage}`)
      if (!dry) {
        await prisma.verifiedUser.delete({
          where: {
            email,
          },
          select: { id: true },
        })
      }
    }
  } catch (e) {
    if (!isPrismaErrorNotFound(e)) {
      throw e
    }
  }
}

if (deleteUser) {
  try {
    const users = await fetchUsersForEmail({ email }, { session: prisma })

    for (const user of users) {
      logger.info('Found user. Looking for groups and simulations', {
        user,
      })

      const { id: userId } = user

      const groups = await fetchGroups({ userId }, { locale: Locales.fr })

      for (const group of groups) {
        logger.info('Found group. Looking if administrator or participant', {
          group,
        })

        const { id: groupId } = group

        if ('id' in group.administrator) {
          logger.info(`Found group administration. ${DeletionMessage}`)

          if (!dry) {
            await deleteGroup({ userId, groupId })
          }
        }

        for (const participant of group.participants) {
          const { id: participantId } = participant

          if ('userId' in participant && participantId) {
            logger.info(`Found group participation. ${DeletionMessage}`, {
              participant,
            })

            if (!dry) {
              await removeParticipant({ userId, groupId, participantId })
            }
          }
        }
      }

      const query = {
        ...PaginationQuery.parse({}),
        locale: 'fr' as const,
      }

      while (true) {
        const { simulations } = await fetchSimulations({
          params: { userId },
          query,
        })

        for (const simulation of simulations) {
          logger.info(`Found simulation. ${DeletionMessage}`, { simulation })
        }

        if (!dry) {
          await prisma.simulation.deleteMany({
            where: {
              userId,
            },
          })
        }

        if (simulations.length < query.pageSize) {
          break
        }

        query.page++
      }
    }

    if (users.length) {
      logger.info(`User deletion Requested. ${DeletionMessage}`)
      if (!dry) {
        await prisma.user.deleteMany({
          where: {
            email,
          },
        })
      }
    }

    const contact = await fetchContact(email)

    if (contact) {
      logger.info(`Found brevo contact. ${DeletionMessage}`, { contact })

      if (!dry) {
        await deleteContact(email)
      }
    }
  } catch (error) {
    logger.error('Error deleting user data', error)
  }
}
