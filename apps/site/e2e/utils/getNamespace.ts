export default function getNamespace(
  ruleName: string | undefined
): string | undefined {
  return !ruleName ? undefined : ruleName.split(' . ')[0]
}
