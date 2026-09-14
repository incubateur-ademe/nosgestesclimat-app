export default function getNamespace(
  ruleName: string | undefined
): string | undefined {
  return ruleName ? ruleName.split(' . ')[0] : undefined
}
