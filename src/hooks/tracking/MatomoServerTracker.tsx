import Script from 'next/script'

/**
 *
 * @deprecated Matomo tracking is deprecated and will be removed at one point
 */
export default function MatomoScript__deprecated() {
  return (
    <>
      {
        // Matomo Prod
        process.env.NEXT_PUBLIC_MATOMO_ID === '1' && (
          <Script id="matomo">
            {`
          var _paq = window._paq = window._paq || [];
          /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
          _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
          _paq.push(["setCookieDomain", "*.nosgestesclimat.fr"]);
          _paq.push(['setCookieSameSite', 'None']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u="https://stats.beta.gouv.fr/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '20']);
            _paq.push(['addTracker', 'https://stats.data.gouv.fr/matomo.php', '153'])
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}
          </Script>
        )
      }

      {
        // Matomo Pre-prod
        process.env.NEXT_PUBLIC_MATOMO_ID === '2' && (
          <Script id="matomo">
            {`
        var _paq = window._paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
        _paq.push(["setCookieDomain", "${process.env.NEXT_PUBLIC_MATOMO_DOMAIN}"]);
        _paq.push(['setCookieSameSite', 'None']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="https://stats.beta.gouv.fr/";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '79']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `}
          </Script>
        )
      }
    </>
  )
}
