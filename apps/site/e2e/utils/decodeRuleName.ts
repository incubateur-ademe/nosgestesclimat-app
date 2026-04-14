export function decodeRuleName(ruleName: string): string {
  return decodeURI(ruleName)
    ?.replaceAll('/', ' . ')
    .replace('\u2011', '-') // replace with a insecable tiret to differenciate from space
    .replace('-', ' ')
}
