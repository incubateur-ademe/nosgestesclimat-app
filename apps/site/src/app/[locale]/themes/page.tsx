import { redirect } from 'next/navigation'

// Redirection in redirects.js doesn't seem to suffise
// added a server-side redirection
export default function ThemesRedirectPage() {
  redirect('/')
}
