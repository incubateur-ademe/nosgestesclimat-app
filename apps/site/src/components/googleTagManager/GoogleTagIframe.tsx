export function GoogleTagIframe() {
  return (
    <noscript>
      <iframe
        id="google-tag-iframe"
        title="Iframe - Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
