import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
import type { BrevoContact } from '../../adapters/brevo/client.ts'
import {
  fetchContact,
  fetchContactOrThrow,
} from '../../adapters/brevo/client.ts'
import {
  defaultUserSelection,
  defaultVerifiedUserSelection,
} from '../../adapters/prisma/selection.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import { isVerifiedUser } from '../../core/typeguards/isVerifiedUser.ts'
import type { PartialUser } from '../../core/types/user.ts'
import {
  createToken,
  verifyCode,
} from '../authentication/authentication.service.ts'
import { UserUpdatedEvent } from './events/UserUpdated.event.ts'
import {
  createOrUpdateUser,
  createOrUpdateVerifiedUser,
  fetchUser,
  transferOwnershipToUser,
  transferSimulationsFromUser,
} from './users.repository.ts'
import type { UserUpdateDto } from './users.validator.ts'

interface UserDto {
  id: string
  name: string | null
  email: string | null
  ageRange?: AgeRange | null
  createdAt: Date
  updatedAt: Date
  contact?: BrevoContact
}

const userToDto = (user: UserDto) => user

export const reconcileSimulationsAfterLogin = ({
  user,
  previousUserId,
}: {
  user: { id: string; email: string }
  previousUserId: string
}) => {
  return transaction(
    (session) =>
      transferSimulationsFromUser({ user, previousUserId }, { session }),
    prisma
  )
}

export const syncUserData = ({
  user,
  verified,
}: {
  user: { id: string; email: string }
  verified?: boolean
}) => {
  return transaction(
    (session) => transferOwnershipToUser({ user, verified }, { session }),
    prisma
  )
}

export const fetchUserContact = async (user: PartialUser) => {
  try {
    const contactUser = await transaction(
      (session) =>
        fetchUser(
          { id: user.id, select: defaultUserSelection },
          { session, orThrow: true }
        ),
      prisma
    )

    if (!contactUser.email) {
      throw new EntityNotFoundException('Contact not found')
    }

    const contact = await fetchContact(contactUser.email)

    if (!contact) {
      throw new EntityNotFoundException('Contact not found')
    }

    return contact
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Contact not found')
    }
    throw e
  }
}

const getEmailMutation = <
  PreviousUser extends { email?: string | null },
  NextUser extends { email?: string | null },
>(
  nextUser: NextUser,
  previousUser?: PreviousUser | null
):
  | { emailChanged: true; previousEmail: string; nextEmail: string }
  | {
      emailChanged: false
      previousEmail?: string | null
      nextEmail?: string | null
    } => {
  const { email: nextEmail } = nextUser
  const previousEmail = previousUser?.email

  if (!!nextEmail && !!previousEmail && previousEmail !== nextEmail) {
    return {
      emailChanged: true,
      previousEmail,
      nextEmail,
    }
  }
  return {
    nextEmail: nextEmail || previousEmail,
    emailChanged: false,
    previousEmail,
  }
}

export const updateUserAndContact = async ({
  code,
  user: userToUpdate,
  newUserData,
  origin,
}: {
  user: PartialUser
  code?: string
  newUserData: UserUpdateDto
  origin: string
}) => {
  const { user, contact, nextEmail, verified, previousContact, token } =
    await transaction(async (session) => {
      const verifiedUser = isVerifiedUser(userToUpdate)

      const previousUser = await (verifiedUser
        ? userToUpdate
        : fetchUser(
            { id: userToUpdate.id, select: defaultUserSelection },
            { session }
          ))

      const { emailChanged, nextEmail, previousEmail } = getEmailMutation(
        newUserData,
        previousUser
      )

      let token: string | undefined
      if (verifiedUser && emailChanged) {
        if (!code) {
          throw new ForbiddenException(
            'Forbidden ! Cannot update email without a verification code.'
          )
        }

        try {
          await verifyCode(
            {
              ...userToUpdate,
              code,
              email: nextEmail,
            },
            { session }
          )
        } catch (e) {
          if (e instanceof EntityNotFoundException) {
            throw new ForbiddenException(
              'Forbidden ! Invalid verification code.'
            )
          }
          throw e
        }
      }

      let contact: BrevoContact | undefined
      let previousContact: BrevoContact | undefined
      if (nextEmail) {
        contact = await fetchContact(nextEmail)
        if (emailChanged) {
          previousContact = await fetchContact(previousEmail)
        }
      }

      const verified = verifiedUser || !nextEmail

      const update =
        verified || !emailChanged
          ? newUserData
          : { ...newUserData, email: previousEmail }

      let user
      if (verifiedUser) {
        user = (
          await createOrUpdateVerifiedUser(
            {
              id: userToUpdate,
              user: update,
              select: defaultVerifiedUserSelection,
            },
            { session }
          )
        ).user
        token = createToken(user)
      } else {
        user = (
          await createOrUpdateUser(
            {
              id: userToUpdate.id,
              user: update,
              select: defaultUserSelection,
            },
            { session }
          )
        ).user
      }

      return {
        user,
        token,
        contact,
        verified,
        nextEmail,
        previousContact,
      }
    })

  const userUpdatedEvent = new UserUpdatedEvent({
    previousContact,
    nextEmail,
    verified,
    origin,
    user,
  })

  EventBus.emit(userUpdatedEvent)

  await EventBus.once(userUpdatedEvent)

  return {
    token,
    verified,
    user: userToDto({
      ...user,
      ...(user.email
        ? {
            contact: verified
              ? await fetchContactOrThrow(user.email)
              : previousContact || contact,
          }
        : {}),
    }),
  }
}
