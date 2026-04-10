export function formatEmail(email: string | undefined | null): string {
  return email?.trim().toLowerCase() ?? ''
}
