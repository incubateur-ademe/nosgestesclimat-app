'use server'

import { AGE_PAGE_PATH } from '@/constants/urls/paths'
import { revalidatePath } from 'next/cache'

export async function revalidateAgePage() {
  revalidatePath(AGE_PAGE_PATH)
}
