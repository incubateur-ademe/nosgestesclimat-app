import { useEffect, useState } from 'react'

// We only check if the user agent is an In App browser on Android
const rules = ['WebView', 'Android.*(wv)']
const regex = new RegExp(`(${rules.join('|')})`, 'ig')

export const useRedirectIfInAppBrowser = () => {
  const [isInApp, setIsInApp] = useState(false)

  useEffect(() => {
    setIsInApp(Boolean(navigator.userAgent.match(regex)))
  }, [])

  useEffect(() => {
    if (isInApp) {
      window.location.href = `intent:${window.location.href}/#Intent;end`
    }
  }, [isInApp])

  return { isInApp }
}
