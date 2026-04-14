import { type Page } from '@playwright/test'
import path from 'path'
const E2E_TEST_DATA_KEY = 'e2e-test-data'

export async function getPlaywrightState<T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> {
  const localStorage =
    (await page.context().storageState()).origins[0]?.localStorage ?? []
  const item = localStorage.find(
    (item) => item.name === E2E_TEST_DATA_KEY + '::' + key
  )?.value
  return item ? JSON.parse(item) : undefined
}

export async function savePlaywrightState(
  page: Page,
  key: string,
  value: unknown
): Promise<void> {
  return page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key as string, JSON.stringify(value))
    },
    [E2E_TEST_DATA_KEY + '::' + key, value]
  )
}

export function saveContext(page: Page, statePath: string) {
  return page.context().storageState({
    path: path.join(import.meta.dirname, '../..', statePath),
  })
}
