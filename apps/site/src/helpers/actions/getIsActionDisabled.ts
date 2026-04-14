export const getIsActionDisabled = (
  flatRule: { formule?: string },
  nodeValue?: number | boolean
) =>
  flatRule?.formule == null
    ? false
    : nodeValue === 0 || nodeValue === false || nodeValue === null
