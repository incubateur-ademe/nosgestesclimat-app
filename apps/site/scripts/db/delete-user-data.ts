import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { getUser } from '@nosgestesclimat/core/features/users/services/get-user.service'
import { parseArgs } from 'node:util'
import _logger from '../../../server/src/logger'

async function deleteUserData(userId: string, isDryMode: boolean) {
  const logger = _logger.child({
    scope: 'action.scripts.delete_user_data',
    userId,
  })
  if (isDryMode) {
    try {
      const user = await getUser({ userId })
      if (!user) throw new Error('Dry mode enabled: an error happened')

      logger.info('Dry mode enabled: user found')
      logger.info('Dry mode enabled: user not deleted')
    } catch (error: unknown) {
      logger.error('Dry mode enabled: an error happened ', error)
    }
    return
  }
  logger.info('Dry mode disabled: will try and delete data for user', {
    userId,
  })
  try {
    await deleteUser(userId)
    logger.info('Dry mode disabled: user deleted')
  } catch (error) {
    logger.error(
      'Dry mode disabled: an error happened when trying to delete user',
      error
    )
  }
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
      userId: { type: 'string' },
    },
    allowNegative: true,
  })

  const { userId, dry } = values

  if (!userId) {
    throw new Error('No userId received via the parameters')
  }

  deleteUserData(userId, !!dry)
}
