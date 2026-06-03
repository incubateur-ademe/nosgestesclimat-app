'use server'

import { revalidatePath } from 'next/cache'
import { AGE_PAGE_PATH } from '@/constants/urls/paths'

export async function revalidateAgePage() {
  revalidatePath(AGE_PAGE_PATH)
}
