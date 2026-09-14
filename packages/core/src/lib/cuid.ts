/**
 * Prisma generates model ids with `@default(cuid())`, which is cuid **v1**:
 * 25 characters, a leading `c` followed by 24 lowercase base36 characters
 * (e.g. `cmtu73ef50001r3y8ycp4odg7`).
 *
 * This is not cuid2 (24 characters, no mandatory prefix), so a cuid2
 * validator — valibot's `cuid2()` among them — would not describe our ids.
 */
const CUID_REGEX = /^c[a-z0-9]{24}$/

/**
 * Tells whether a string has the shape of a cuid.
 *
 * Used to resolve an `<id or slug>` parameter before querying, so that the
 * lookup hits a single indexed column instead of an `OR` over both.
 *
 * Trade-off: the check is purely lexical. A slug shaped like a cuid would be
 * looked up as an id and therefore not be found. Slugs are derived from
 * user-provided names, so the collision is possible but vanishingly unlikely.
 */
export const isCuid = (value: string): boolean => CUID_REGEX.test(value)
