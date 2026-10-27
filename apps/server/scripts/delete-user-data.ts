import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user'
import { getUser } from '@nosgestesclimat/core/features/users/services/get-user.service'
import { parseArgs } from 'node:util'

async function deleteUserData(userId: string, isDryMode: boolean) {
  if (isDryMode) {
    try {
      const user = await getUser({ userId })
      if (!user) throw new Error('Dry mode enabled: an error happened')

      console.log(`Dry mode enabled: user ${userId} found`)
      console.log(`Dry mode enabled: user ${userId} not deleted`)
    } catch (error: unknown) {
      console.log('Dry mode enabled: an error happened ', error)
    }
    return
  }
  console.log(`Dry mode disabled: will try and delete data for user ${userId}`)
  try {
    await deleteUser(userId)
    console.log(`Dry mode disabled: user ${userId} deleted`)
  } catch (error) {
    console.log(
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

  deleteUserData(userId ?? '', !!dry)
}
