import { claimVerificationCode } from '@nosgestesclimat/core/features/auth/services/claim-verification-code.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import { VerificationCodeUsage } from '@nosgestesclimat/core/prisma/generated/client'
import type { BrevoContact } from '../../adapters/brevo/client.ts'
import {
  fetchContact,
  fetchContactOrThrow,
} from '../../adapters/brevo/client.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import { isVerifiedUser } from '../../core/typeguards/isVerifiedUser.ts'
import type { PartialUser } from '../../core/types/user.ts'
import { UserUpdatedEvent } from './events/UserUpdated.event.ts'
import { createOrUpdateUser, findUserById } from './users.repository.ts'
import type { UserUpdateDto } from './users.validator.ts'

interface UserDto {
  id: string
  name: string | null
  email: string | null
  ageRange?: AgeRange | null
  createdAt: Date
  updatedAt: Date
  telephone?: string | null
  position?: string | null
  optedInForCommunications?: boolean
  contact?: BrevoContact
}

const userToDto = (user: UserDto) => user

export const fetchUserContact = async (user: PartialUser) => {
  const contactUser = await findUserById(user.id)

  if (!contactUser?.email) {
    throw new EntityNotFoundException('Contact not found')
  }

  const contact = await fetchContact(contactUser.email)

  if (!contact) {
    throw new EntityNotFoundException('Contact not found')
  }

  return contact
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
}: {
  user: PartialUser
  code?: string
  newUserData: UserUpdateDto
}) => {
  const { user, verified, nextEmail, previousEmail, emailChanged } =
    await transaction(async (session) => {
      const verifiedUser = isVerifiedUser(userToUpdate)

      const previousUser = await (verifiedUser
        ? userToUpdate
        : findUserById(userToUpdate.id, { session }))

      const { emailChanged, nextEmail, previousEmail } = getEmailMutation(
        newUserData,
        previousUser
      )

      if (!verifiedUser && !!nextEmail && nextEmail !== previousEmail) {
        throw new ForbiddenException(
          'Forbidden ! Cannot update email without a verified account.'
        )
      }

      if (verifiedUser && emailChanged) {
        if (!code) {
          throw new ForbiddenException(
            'Forbidden ! Cannot update email without a verification code.'
          )
        }

        // The email-change code is created by the site's code-creation flow,
        // the same one that issues login codes.
        const claimedCode = await claimVerificationCode(
          {
            email: nextEmail,
            code,
            usage: VerificationCodeUsage.login,
          },
          { session }
        )

        if (!claimedCode.success) {
          throw new ForbiddenException('Forbidden ! Invalid verification code.')
        }
      }

      const verified = verifiedUser || !nextEmail

      // A verified account is updated as one aggregate: the user together
      // with its verified record, the email being the record's final email.
      const user = await createOrUpdateUser(
        verifiedUser
          ? {
              type: 'verified',
              id: userToUpdate.id,
              email: nextEmail || userToUpdate.email,
              name: newUserData.name,
              ageRange: newUserData.ageRange,
            }
          : {
              type: 'unverified',
              id: userToUpdate.id,
              name: newUserData.name,
              ageRange: newUserData.ageRange,
            },
        { session }
      )

      return {
        user,
        verified,
        nextEmail,
        previousEmail,
        emailChanged,
      }
    })

  let contact: BrevoContact | undefined
  let previousContact: BrevoContact | undefined
  if (nextEmail) {
    contact = await fetchContact(nextEmail)
    if (emailChanged) {
      previousContact = await fetchContact(previousEmail!)
    }
  }

  const userUpdatedEvent = new UserUpdatedEvent({
    previousContact,
    nextEmail,
    verified,
    user,
  })

  EventBus.emit(userUpdatedEvent)

  await EventBus.once(userUpdatedEvent)

  // The response keeps the aggregate's internal shape out of the API: the
  // user is returned flat, with the verified-only fields on verified
  // accounts and the age range on anonymous ones.
  const { type: _type, ageRange, ...userDto } = user
  const userFields =
    user.type === 'verified' ? userDto : { ...userDto, ageRange }

  return {
    verified,
    user: userToDto({
      ...userFields,
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
