import { faker } from '@faker-js/faker'

import { TEST_EMAIL_DOMAIN } from '../constants'

export interface UserData {
  firstName: string
  lastName: string
  email: string
}

/** A new user, with a unique address the test mailbox can read. */
export function generateUser(): UserData {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    firstName,
    lastName,
    email: faker.internet
      .email({ provider: TEST_EMAIL_DOMAIN, firstName, lastName })
      .toLowerCase(),
  }
}

export function generateGroupName() {
  return `${faker.word.adjective()} ${faker.word.noun()}`
}

export function generateOrganisationName() {
  return faker.company.name()
}

export function generatePollName() {
  return `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`
}
