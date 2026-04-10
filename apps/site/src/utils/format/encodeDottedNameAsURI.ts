export const encodeDottedNameAsURI = (dottedName: string) => {
  return encodeURIComponent(dottedName.toLowerCase())
}
