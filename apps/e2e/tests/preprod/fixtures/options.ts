import { test as base } from '@playwright/test'

export interface FixturesOptions {
  setup: boolean
}

export const test = base.extend<FixturesOptions>({
  setup: [false, { option: true }],
})

export { expect } from '@playwright/test'
