// In-memory store of the Brevo contacts the app writes, so that a flow reads
// back what it wrote, as it would on Brevo.

interface StoredContact {
  id: number
  email: string
  attributes: Record<string, unknown>
  listIds: number[]
}

interface ContactPayload {
  email: string
  attributes?: Record<string, unknown>
  listIds?: number[]
}

const contacts = new Map<string, StoredContact>()
let nextId = 1

/** Brevo addresses are case-insensitive. */
const keyOf = (email: string) => email.toLocaleLowerCase()

export const findContact = (email: string) => contacts.get(keyOf(email))

/** Creates the contact, or merges into it: Brevo adds the attributes and the
 * lists it is sent. */
export const upsertContact = ({
  email,
  attributes = {},
  listIds = [],
}: ContactPayload) => {
  const key = keyOf(email)
  const existing = contacts.get(key)

  if (!existing) {
    contacts.set(key, {
      id: nextId++,
      email,
      attributes: { ...attributes },
      listIds: [...listIds],
    })
    return
  }

  existing.attributes = { ...existing.attributes, ...attributes }
  existing.listIds = [...new Set([...existing.listIds, ...listIds])]
}

/** An empty value erases the attribute; `unlinkListIds` drops the lists. */
export const updateContact = ({
  email,
  attributes = {},
  unlinkListIds = [],
}: ContactPayload & { unlinkListIds?: number[] }) => {
  const contact = contacts.get(keyOf(email))

  if (!contact) {
    return false
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (value === '') {
      delete contact.attributes[name]
    } else {
      contact.attributes[name] = value
    }
  }

  contact.listIds = contact.listIds.filter((id) => !unlinkListIds.includes(id))

  return true
}

export const deleteContact = (email: string) => contacts.delete(keyOf(email))
