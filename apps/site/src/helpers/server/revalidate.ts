'use server'

import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidatePathAction(
  ...args: Parameters<typeof revalidatePath>
) {
  revalidatePath(...args)
  return
}
