const script =
  document.getElementById('ecolab-climat') ||
  document.getElementById('nosgestesclimat')

if (!script) {
  console.error('Iframe Nos Gestes Climat: No target element found')
}

// Avoid unwanted reloading loop
const currentParams = new URLSearchParams(window.location.search)
if (!currentParams.has('iframe') && !currentParams.has('integratorUrl')) {
  const href = window.location.href.toString()
  if (!href) {
    console.error('Iframe Nos Gestes Climat: window.location.href is empty')
  }
  const integratorUrl = new URL(href || 'about:blank')

  // Remove all search params from integratorUrl
  integratorUrl.search = ''

  const srcURL = new URL(script.src)
  const hostname = srcURL.origin || 'https://nosgestesclimat.fr'

  const possibleOptions = [
    { key: 'shareData', legacy: 'partagedatafinsimulation' },
    { key: 'region' },
    { key: 'lang' },
    { key: 'onlySimulation' },
    { key: 'pr' },
    { key: 'withHomepage' },
    { key: 'maxHeight' },
    { key: 'utm_source' },
    { key: 'utm_campaign' },
    { key: 'path' },
  ]

  const lang = script.dataset.lang

  const url = new URL(hostname)

  // Display or not homepage / specific path or directly show the simulator
  const path = script.dataset.path
  const withHomepage = script.dataset.withHomepage

  if (path) {
    url.pathname = `/${lang ? lang + '/' : ''}${path.startsWith('/') ? path.slice(1) : path}`
  } else if (withHomepage) {
    url.pathname = `/${lang ? lang + '/accueil-iframe' : 'accueil-iframe'}`
  } else {
    url.pathname = `/${lang ? lang + '/' : ''}simulateur/bilan`
  }

  // Append iframe and integratorUrl params to allow iframe event to be triggered
  url.searchParams.append('iframe', 'true')
  url.searchParams.append('integratorUrl', integratorUrl.toString())

  // Append matomo tracking params

  const utmSourceParam = script.dataset.utm_source

  const utmCampaignParam = script.dataset.utm_campaign

  const utmMediumParam = `iframe`

  if (utmSourceParam != undefined) {
    url.searchParams.append('utm_source', utmSourceParam)
  }

  if (utmCampaignParam != undefined) {
    url.searchParams.append('utm_campaign', utmCampaignParam)
  }

  url.searchParams.append('utm_medium', utmMediumParam)

  possibleOptions
    .filter(
      ({ key }) =>
        [
          'maxHeight',
          'utm_campaign',
          'utm_source',
          'utm_medium',
          'path',
        ].includes(key) === false
    )
    .forEach(({ key, legacy }) => {
      const value = script.dataset[key] || script.dataset[legacy]

      if (value) {
        url.searchParams.append(key === 'pr' ? 'PR' : key, value)
      }
    })

  const iframe = document.createElement('iframe')

  const iframeAttributes = {
    src: url.toString(),
    allowfullscreen: true,
    webkitallowfullscreen: true,
    mozallowfullscreen: true,
    allow: 'fullscreen',
    id: 'iframeNGC',
    style: `border: none; width: 100%; display: block; height: 801px; ${
      script.dataset.maxHeight
        ? `max-height: ${script.dataset.maxHeight}px;`
        : ''
    }`,
    title: 'Iframe Nos Gestes Climat',
  }

  for (var key in iframeAttributes) {
    iframe.setAttribute(key, iframeAttributes[key])
  }

  script.parentNode.insertBefore(iframe, script)
}
