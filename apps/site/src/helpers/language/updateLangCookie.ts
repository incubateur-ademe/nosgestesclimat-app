export function updateLangCookie(locale: string) {
  const days = 30
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = '; expires=' + date.toUTCString()
  document.cookie = `NEXT_LOCALE=${locale};expires=${expires}; path=/; SameSite=None; Secure`
}
