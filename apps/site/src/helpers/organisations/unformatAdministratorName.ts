import { ADMINISTRATOR_SEPARATOR } from '@/constants/organisations/administrator'

// Removes the separator between the first and last name of an administrator
export function unformatAdministratorName(name: string) {
  return name.replace(ADMINISTRATOR_SEPARATOR, ' ')
}
