'use server'

import { AGE_PAGE_PATH } from '@/constants/urls/paths'
import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidateAgePage() {
  revalidatePath(AGE_PAGE_PATH)
}
