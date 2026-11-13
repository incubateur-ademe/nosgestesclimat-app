import { createBrevoClient } from '@nosgestesclimat/core/features/emails/brevo/client'
import { findVerifiedUserByEmail } from '@nosgestesclimat/core/features/users/repositories/users.repository'
import { eraseUser } from '@nosgestesclimat/core/features/users/services/erase-user.service'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import { parseArgs } from 'node:util'
import { env } from '../../src/env/server.ts'

const { eraseContact } = createBrevoClient({
  apiKey: env.BREVO_API_KEY,
  url: env.BREVO_URL,
})

export async function deleteUserData(email: string, isDryMode: boolean) {
  // `VerifiedUser.email` is the primary key: an email addresses at most one
  // verified account, so a miss is a typo rather than an ambiguous request.
  const user = await findVerifiedUserByEmail({ email })

  if (!user) {
    throw new Error(`No verified user for this email`)
  }

  console.log(`User found: ${user.id}`)

  if (isDryMode) {
    console.log('Dry mode enabled: user not deleted')
    return
  }

  await eraseUser(user.id, { eraseContact })

  console.log('Dry mode disabled: user erased')
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
      email: { type: 'string' },
    },
    allowNegative: true,
  })

  const dry = values.dry ?? values.d ?? true
  const email = values.email

  if (!email) {
    console.error('No email received via the parameters')
    process.exit(1)
  }

  deleteUserData(email, dry)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(toError(error).message)
      process.exit(1)
    })
}
